socket = require('socket.io')
fs = require('fs')
express = require('express')
login = require('connect-ensure-login')
passport = require('passport')
partials = require('express-partials')
mongoose = require('mongoose')
LocalStrategy = require('passport-local').Strategy
secrets = require('./secrets.json')

mongoose.connect secrets.mongoURL

vOS_Schema = mongoose.Schema({
  name: String,
  description: String,
  url: String, 
  owner: String
});

vOS_App = mongoose.model('vOS_App', vOS_Schema)

testName = 'Friend'
testUser = 'friend@vos.com'
testPassword = 'I come in peace'

User = mongoose.model('User', {
  name: String,
  email: String,
  password: String,
  token: String,
  sessionID: String,
  recent: Array,
  friends: Array
})

db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', ->
  ###User.remove({}, function() {
    console.log('Wiped People')
  })###
)

passport.serializeUser (user, done) ->
  done null, user._id

passport.deserializeUser (obj, done) ->
  User.findOne( _id: obj, (err, person) ->
    done err, person
  )

passport.use new LocalStrategy { usernameField: 'email', passwordField: 'password' }, 
  (email, password, done) ->
    User.find { email: email, password: password}, 
      (err, people) ->
        done err if err
        if people.length is 1
          done null, people[0]
        else
          done null
  # Create or update user, call done() when complete...
  #    process.nextTick(function () {
  #      done(null, profile, tokens)
  #    })

app = express()

app.set 'views', __dirname + '/views'
app.set 'view engine', 'ejs'
app.use partials()
#app.use express.logger()
app.use express.cookieParser()
app.use express.bodyParser()
app.use express.errorHandler { dumpExceptions: true, showStack: true }
app.use express.session secret: 'virtual OS secret'
app.use passport.initialize()
app.use passport.session()
app.use app.router
app.use '/js', express.static __dirname + '/js'
app.use '/Browserify', express.static __dirname + '/Browserify'
app.use '/css', express.static(__dirname + '/css')
app.use '/fonts', express.static(__dirname + '/fonts')
app.use '/static', express.static(__dirname + '/public')
app.get '/latestAPK', (req, res) ->
  file = __dirname + '/public/vOS_Controller.apk'
  res.download(file)

app.post '/signin', 
  passport.authenticate('local', failureRedirect: '/fail'),
  (req, res) ->
    res.redirect '/'

register = (name, email, password, succeed, fail) ->
  User.find email: email, (err, people) ->
    console.log err if err
    if people.length > 0
      if people[0].password is password
        user = people[0]
      else
        return fail()

    if not user and name and password
      user = new User {
        name: name,
        email: email,
        password: password,
        recent: ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf']
      }
      user.save (err, user) ->
        console.log err if err
    if user
      succeed user
    else
      fail()

makeToken = (done) ->
  token = '' + Math.floor(Math.random() * Math.pow 10, 10)
  User.findOne token: token, (err, user) ->
    console.log err if err
    if user
      makeToken done
    else
      done token

app.post '/registerAndSignIn', (req, res) ->
  register req.body.name, req.body.email, req.body.password, (user) ->
    req.login user, (err) ->
      console.log err if err
      res.redirect '/'
  , ->
    console.log 'Email already exists with a different password or there are missing fields'
    res.redirect '/'

app.post '/registerForToken', (req, res) ->
  register req.body.name, req.body.email, req.body.password, (user) ->
    makeToken (token) ->
      user.token = token
      user.save (err, user) ->
        console.log err if err
      res.json user
  , ->
    console.log 'Email already exists with a different password or there are missing fields'
    res.json 'Email already exists with a different password or there are missing fields'

app.get '/userFromToken', (req, res) ->
  if req.query.token?
    User.findOne token: req.query.token, (err, user) ->
      console.log err if err
      if user?
        publicUser = {
          name: user.name,
          recent: user.recent,
          id: user._id
        }
        res.json(publicUser)
      else
        console.log(user)
        console.log(req.query.token)
        res.json()

app.get('/signout', (req, res) ->
  req.logout()
  res.redirect '/'
)

app.post('/recentApps', (req, res) ->
  if req.query.token?
    User.findOne token: req.query.token, (err, user) ->
      console.log err if err
      if user? and req.body.recent.constructor is Array
        user.recent = req.body.recent
        user.save((err, user) ->
          console.log err if err
          console.log 'Successful App Update'
        )
        res.json(user)
      else
        res.json(req.body)
  else 
    res.json(req.body)
)

###
app.get('/appList', [
  login.ensureLoggedIn('/'),
  (req, res) ->
    vOS_App.find {}, (err, apps) ->
      console.log err if err
#      console.log(apps)
      res.json apps
])
###

app.post '/dashboard/update', [
  login.ensureLoggedIn('/'),
  (req, res) ->
    update = req.body
    console.log update
    if update.id
      vOS_App.findOne _id: update.id, (err, app) ->
        console.log err if err
#        console.log(app)
        if app
          for key in update
            app[key] = update[key]
          res.json app
          app.save (err, user) ->
            console.log err if err
            console.log 'Successful App Update'
        else
          res.json undefined
    else
#      console.log(req.user._id)
      newApp = new vOS_App({
        name: update.name,
        description: update.description,
        url: update.url,
        owner: req.user._id
      })
      newApp.save (err, user) ->
        console.log err if err
        console.log user
        res.json user
        console.log 'Successful New App'
]

app.get '/dashboard', [
  login.ensureLoggedIn('/'),
  (req, res) ->
    vOS_App.find owner: req.user._id, (err, apps) ->
      console.log err if err
#      console.log(apps)
      res.render 'dashboard', {
        user: req.user,
        apps: apps
      }
]


app.get '/appInfo', [
  (req, res) ->
    if req.query.app_id
      vOS_App.findOne _id: req.query.app_id, (err, app) ->
        console.log err if err
#        console.log app
        res.json app
    else
      res.json null
]

app.get('/all', (req, res) ->
  vOS_App.find {}, (err, apps) ->
    res.render 'all', {
      user: req.user,
      allApps: apps
    }
)

app.get('/app', (req, res) ->
  vOS_App.findOne(_id: req.query.app_id, (err, app) ->
#    console.log(app)
    console.log(err) if err?
    res.render('app', {
      user: req.user,
      app: app
    })
  )
)

app.get('/appSearchJSON', (req, res) ->
  console.log(req.query.query)
  if req.query.query? and req.query.query isnt ''
    vOS_App.find($or: [
      {description: {'$regex': '.*' + req.query.query + '.*', $options: 'i'}}, 
      {name: {'$regex': '.*' + req.query.query + '.*', $options: 'i'}}])
    .sort({'_id': -1})
    .limit(10)
    .exec((err, apps) ->
      console.log(err) if err?
      res.json(apps)
    )
  else
    res.json([])
)

app.get('/appSearch',
  (req, res) ->
    vOS_App.find($or: [
      {description: {'$regex': '.*' + req.query.query + '.*', $options: 'i'}}, 
      {name: {'$regex': '.*' + req.query.query + '.*', $options: 'i'}}])
    .sort({'_id': -1})
    .limit(10)
    .exec((err, apps) ->
      console.log(err) if err?
      res.render 'appSearch', {
        user: req.user,
        query: req.query.query
        results: apps
      }
    )
    
    ###
    vOS_App.find( {_id: req.query}, function(err, app) {
      console.log(app)
      res.render('appSearch', {
        user: undefined,
        home: false,
        app: app
      })
    })###
)

app.delete('/app', (req, res) ->
  vOS_App.remove(_id: req.query.app_id, (err, app) ->
#    console.log(app)
    res.json app
  )
)

#GOOGLE_CLIENT_ID = secrets.google.clientID
#GOOGLE_CLIENT_SECRET = secrets.google.clientSecret

featured_apps = [
  '5315354db87e860000a11cbc'
]

app.get('/', (req, res) ->
  vOS_App.findOne(_id: featured_apps[0], (err, app) ->
    console.log(err) if err?
    console.log(app)
    console.log(app.id)
    res.render('home', {
      user: req.user,
      featured: featured_apps,
      displayApp: app
    })
  )
)

app.get('/documentation', (req, res) ->
  res.render 'documentation', {
    user: req.user
  })

app.get('/about', (req, res) ->
  res.render 'about', {
    user: req.user
  })

app.get('/try', (req, res) ->
  res.render 'try', {
    user: req.user
  })

app.get('/account', [
  login.ensureLoggedIn('/'),
  (req, res) ->
    res.render 'account', {
      user: req.user
    }
])

app.get '/debug', (req, res) ->
  recents = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf']
  render = (app) ->
    res.render 'vOS', {
      user: {debug: true},
      layout: false,
      session_id: 'debug',
      recentApps: recents,
      token: 'debug'
      app: app
    }
  if req.query.app_id
    vOS_App.findOne _id: req.query.app_id, (err, app) ->
#        console.log(app)
      render app
  else
    render undefined

app.get '/local', (req, res) ->
  res.render 'local', {
    user: req.user
  }

enter = (req, res, viewName) ->
  console.log 'entering'
  console.log req.query.session_id
  console.log sessions
  if req.query.session_id? and sessions[req.query.session_id]?
    recents = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf']

    User.findOne token: sessions[req.query.session_id].token, (err, user) ->
      if user?
        recents = user.recents
      if not recents? or recents.length is 0
        recents = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf']

      #console.log(recents)

      if req.query.app_id
        if user and (not user.recents or user.recents.indexOf req.query.app_id is -1)
          #Add to recents
          user.recents = [] if not user.recents? 
          user.recents.push req.query.app_id
          user.save (err, user) ->
            console.log err if err
            console.log 'Added New Recent App'

      vOS_App.findOne _id: req.query.app_id, (err, app) ->
        console.log err if err
        console.log app

        res.render viewName, {
          layout: false,
          session_id: req.query.session_id,
          token: sessions[req.query.session_id].token,
          user: user,
          app: app
        }
  else
    console.log 'going back'
    res.redirect if req.query.from? then req.query.from else '/'
    
app.get '/enterLocal', (req, res) ->
  enter req, res, 'localvOS'

app.get '/enter', (req, res) ->
  enter req, res, 'vOS'

io = socket.listen app.listen 8081
io.set 'log level', 0

keyOptions = ['2', '3', '4', '6', '7', '9', 'A', 'C', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

codes = {
###  "AAA": {socket: websiteSocket, name: name}
###
}

#sessions could be an array. earliest undefined could be stored, and could find the next one from there.

earliestUndefined = 0
getNewSessionID = ->
  while sessions[earliestUndefined]
    earliestUndefined++
  return earliestUndefined

sessions = []
###"1234234": {
  userID: 1,
  input: inputSocket,
  output: outputSocket
}###

makeKey = ->
  key = ''
  while key is '' or codes[key]
    key = ''
    key += keyOptions[Math.floor(Math.random() * keyOptions.length)]
    key += keyOptions[Math.floor(Math.random() * keyOptions.length)]
    key += keyOptions[Math.floor(Math.random() * keyOptions.length)]
  return key

bind = (session) ->
  session.input.on 'start', (data) ->
#    parsed = JSON.parse data
    session.output.emit 'start', data
    console.log 'emit: start, ' + data

  session.input.on 'move', (data) ->
#    parsed = JSON.parse data
    session.output.emit 'move', data 
    console.log 'emit: move, ' + data

  session.input.on 'end', (data) ->
#    parsed = JSON.parse data
    session.output.emit 'end', data
    console.log 'emit: end, ' + data

  session.input.on 'size', (data) ->
#    parsed = JSON.parse data
    session.output.emit 'size', data
    console.log 'emit: size, ' + data

  session.input.on 'value', (data) ->
    session.output.emit 'value', data
    console.log 'emit: value, ' + data

  if session.passVisuals
    session.output.on 'visual', (data) ->
      session.input.emit 'visual', data

  session.input.emit 'response', 'ready'

killSession = (session_id) ->
  console.log('killing session ' + session_id)
  if sessions[session_id]
    if sessions[session_id].input?
      sessions[session_id].input.emit 'error', 'output disconnected'
    if sessions[session_id].output?
      sessions[session_id].output.emit 'error', 'input disconnected'

    delete sessions[session_id]
    earliestUndefined = session_id

io.sockets.on 'connection', (socket) ->
  #console.log(socket)
#  console.log 'connected'

  socket.on 'ping', (data) ->
      socket.emit 'ping-back', data

  socket.on 'declare-type', (data) ->
    #Types of connections: page, output, input
    console.log data.type
    if data.type is 'page'
      #Make key, tie it to website socket.
      key = makeKey()
      codes[key] = {
        socket: socket,
        name: data.name
      }
#      console.log 'Key: ' + key
      socket.emit 'code', {
        code: key,
        name: data.name
      }
      socket.on 'disconnect', ->
        #console.log(Object.keys(codes))
        delete codes[key]

    if data.type is 'output'
      console.log 'got output'
      #Check if session is real, if so, add self as output and bind.
      if data.session_id isnt undefined and sessions[data.session_id] != undefined and sessions[data.session_id].output is undefined
        session = sessions[data.session_id]
        session.output = socket
        console.log 'binding'
        bind session
        session.output.on 'disconnect', ->
          killSession(data.session_id)
      else
        socket.emit 'error', 'incorrect session id'

    if data.type is 'input'
      #Listen for code
#      console.log 'got input'
#      console.log data
      socket.on 'code', (raw) ->
        console.log 'got code'
        console.log raw
        code = raw.toUpperCase()
        #If code exists, make a session and send it to the page.
        if codes[code] isnt undefined
          newSessionID = getNewSessionID()

          #tell user which session they are on
          User.findOne token: data.token, (err, user) ->
            console.log err if err
            if user
              user.sessionID = newSessionID
              user.save (err, user) ->
                console.log err if err

          sessions[newSessionID] = {
            token: data.token,
            input: socket,
            passVisuals: if data.passVisuals? then data.passVisuals else true
          }

          console.log('New session at ' + newSessionID)

          socket.on 'disconnect', ->
            killSession(newSessionID)

          socket.on 'connection', (status) ->
            if status is 'cancelled'
              killSession(newSessionID)

          socket.emit 'response', 'correct pair code'
          codes[code].socket.emit 'session_id', {
            id: newSessionID,
            name: codes[code].name
          }
          delete codes[code]
        else
          socket.emit 'error', 'incorrect pair code'
