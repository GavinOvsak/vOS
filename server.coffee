socket = require('socket.io')
fs = require('fs')
express = require('express')
login = require('connect-ensure-login')
passport = require('passport')
partials = require('express-partials')
mongoose = require('mongoose')
LocalStrategy = require('passport-local').Strategy
bcrypt = require('bcrypt')
secrets = require('./secrets.json')
http = require('http')
https = require('https')
flash = require('connect-flash')
nodemailer = require('nodemailer')

transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'ovsak.gavin',
        pass: 'hvagnzflmrssbvkn'#secrets.gmaillPass
    }
})

salt = bcrypt.genSaltSync(10)

normalHome = 'http://vos.jit.su'
sslHome = 'https://vos.jit.su'
#normalHome = 'http://localhost:8081'
#sslHome = 'https://localhost'

mongoose.connect secrets.mongoURL

vOS_Schema = mongoose.Schema({
  name: String,
  description: String,
  url: String, 
  owner: String,
  code: String
});

vOS_App = mongoose.model('vOS_App', vOS_Schema)

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
  ###
  User.remove({email: 'e'}, ->
    console.log('Wiped People')
  )
  ###
  vOS_App.find({}, ->
    console.log(arguments);    
  )
)

defaultAppList = [
  '5408e589fe909b00008fca2d',  #Canyon
  '5408e56bfe909b00008fca2c' #Flight
];

featured_apps = [
  '5408e589fe909b00008fca2d', #Canyon Explorer
  '5408e56bfe909b00008fca2c', #Flight
  '543cc3cb432f59e6b37f3c1d'  #Realm
]


passport.serializeUser (user, done) ->
  done null, user._id

passport.deserializeUser (obj, done) ->
  User.findOne( _id: obj, (err, person) ->
    done err, person
  )

passport.use new LocalStrategy { usernameField: 'email', passwordField: 'password' }, 
  (email, password, done) ->
    User.find { email: email}, 
      (err, people) ->
        console.log(people)
        done err if err?
        once = true
        for person in people
          console.log([arguments, person])
          if bcrypt.compareSync(password, person.password) and once
            done(null, people[0])
            once = false
        if once
          done(null)
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
app.use(flash())
app.use app.router
app.use '/js', express.static __dirname + '/js'
app.use '/Browserify', express.static __dirname + '/Browserify'
app.use '/css', express.static(__dirname + '/css')
app.use '/fonts', express.static(__dirname + '/fonts')
app.use '/static', express.static(__dirname + '/public')
app.get '/latestAPK', (req, res) ->
  file = __dirname + '/public/vOS_Controller.apk'
  res.download(file)

verifySignedIn = (req, res, next) ->
    if req.user?
        return next()
    req.flash('error', 'Please Sign In First')
    res.redirect(normalHome + '?from=' + encodeURIComponent(req.url))

app.post '/signin', 
  passport.authenticate('local', failureRedirect: '/fail'),
  (req, res) ->
    console.log(req.query)
    if req.query.from? and req.query.from isnt ''
      res.redirect(decodeURIComponent(req.query.from))
    else
      res.redirect normalHome

app.get('/fail', (req, res) ->
  req.flash('error', "Oops, I cannot let you in!");
  res.redirect normalHome
)

register = (name, email, password, succeed, fail) ->
  User.find(email: email, (err, people) ->
    console.log err if err?
    if people.length > 0
      if bcrypt.compareSync(password, people[0].password)
        user = people[0]
      else
        return fail()

    if not user and name and password
      user = new User {
        name: name,
        email: email,
        password: bcrypt.hashSync(password, salt),
        recent: defaultAppList
      }
      user.save (err, user) ->
        console.log err if err?
        console.log(user)
    if user?
      succeed user
    else
      fail()
  )

makeToken = (done) ->
  token = '' + Math.floor(Math.random() * Math.pow 10, 10)
  User.findOne token: token, (err, user) ->
    console.log err if err?
    if user?
      makeToken done
    else
      done token

app.post '/registerAndSignIn', (req, res) ->
  register req.body.name, req.body.email, req.body.password, (user) ->
    req.login user, (err) ->
      console.log err if err?
      res.redirect normalHome
  , ->
    console.log 'Email already exists with a different password or there are missing fields'
    res.redirect normalHome

app.post '/registerForToken', (req, res) ->
  register req.body.name, req.body.email, req.body.password, (user) ->
    makeToken (token) ->
      user.token = token
      user.save (err, user) ->
        console.log err if err?
      res.json user
  , ->
    console.log 'Email already exists with a different password or there are missing fields'
    res.json 'Email already exists with a different password or there are missing fields'

app.get '/userFromToken', (req, res) ->
  if req.query.token?
    User.findOne token: req.query.token, (err, user) ->
      console.log err if err?
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

#Can take in name, and password fields
app.post('/user', [
  verifySignedIn,
  (req, res) ->
    if req.user?
      if req.body.name?
        req.user.name = req.body.name

      if req.body.password?
        req.user.password = bcrypt.hashSync(req.body.password, salt)

      req.user.save((err, user) ->
        console.log err if err?
      )

      publicUser = {
        name: req.user.name,
        recent: req.user.recent,
        id: req.user._id
      }
      res.json(publicUser)
    else
      console.log(req.user)
      console.log(req.query.token)
      res.json()
])

makeId = ->
  text = ""
  possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for i in [0..8]
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text

app.post('/forgot', (req, res) ->
  if req.body.email?
    User.findOne email: req.body.email, (err, user) ->
      console.log err if err?
      if user?
        tempPass = makeId()
        #make new password,
        #Send email to req.query.email
        mailOptions = {
          from: 'Gavin from vOS <ovsak.gavin@gmail.com>', # sender address
          to: req.body.email, # list of receivers
          subject: 'Password Reset', # Subject line
          text: 'Your new password for http://vos.jit.su is: ' + tempPass + ' . Please change it to something more memorable!', # plaintext body
          html: 'Your new password for <a href="http://vos.jit.su">http://vos.jit.su</a> is: <b>' + tempPass + '</b> . Please change it to something more memorable!' # html body
        };

        # send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) ->
            if error?
              console.log(error)
            else
              console.log('Message sent: ' + info.response)
        );

        user.password = bcrypt.hashSync(tempPass, salt)

        user.save((err, user) ->
          console.log err if err?
        )

        publicUser = {
          name: user.name,
          id: user._id
        }
        res.json(publicUser)
      else
        res.json('No account found')
  else
    res.json('No account found')
)

app.delete('/user', [
  verifySignedIn,
  (req, res) ->
    if req.user?
      publicUser = {
        name: req.user.name,
        recent: req.user.recent,
        id: req.user._id
      }
      res.json(publicUser)
      req.user.remove()
      req.logout();
      res.redirect('/');
    else
      console.log(req.user)
      console.log(req.query.token)
      res.json()
])

app.get('/signout', (req, res) ->
  req.logout()
  res.redirect normalHome
)

#post /newAppUsed

#post /removeAppMRU

app.post('/newAppUsed', (req, res) ->
  if req.query.token?
    User.findOne token: req.query.token, (err, user) ->
      console.log err if err?
      if user? and req.body.appID?
        #if in array, remove
        index = user.recent.indexOf(req.body.appID)
        if index >= 0
          user.recent.splice(index, 1)
        #add to back.
        user.recent.push(req.body.appID)

        user.save((err, user) ->
          console.log err if err?
          console.log 'Successful App Update'
        )
        res.json(user)
      else
        res.json(req.body)
  else 
    res.json(req.body)
)

app.post('/removeAppMRU', (req, res) ->
  if req.query.token?
    User.findOne token: req.query.token, (err, user) ->
      console.log err if err?
      if user? and req.body.appID?
        index = user.recent.indexOf(req.body.appID)
        if index >= 0
          user.recent.splice(index, 1)
        
        user.save((err, user) ->
          console.log err if err?
          console.log 'Successful App Update'
        )
        res.json(user)
      else
        res.json(req.body)
  else 
    res.json(req.body)
)

###
app.post('/recentApps', (req, res) ->
  if req.query.token?
    User.findOne token: req.query.token, (err, user) ->
      console.log err if err?
      if user? and req.body.recent.constructor is Array
        user.recent = req.body.recent
        user.save((err, user) ->
          console.log err if err?
          console.log 'Successful App Update'
        )
        res.json(user)
      else
        res.json(req.body)
  else 
    res.json(req.body)
)
###
###
app.get('/appList', [
  verifySignedIn,
  (req, res) ->
    vOS_App.find {}, (err, apps) ->
      console.log err if err?
#      console.log(apps)
      res.json apps
])
###

app.get('/hosted', (req, res) ->
  if req.query.id?
    vOS_App.findOne({_id: req.query.id}, (err, app) ->
      console.log err if err?
      if app? and app.code?
        res.writeHead(200, {'Content-Type': 'application/javascript'})
        res.write(app.code)
        res.end()
      else
        res.json()
    )
  else
    res.json()
)

app.post '/dashboard/update', [
  verifySignedIn,
  (req, res) ->
    update = req.body
    console.log update
    if update.id
      vOS_App.findOne _id: update.id, (err, app) ->
        console.log err if err?
#        console.log(app)
        if app?
          app.name = update.name if update.name?
          app.description = update.description if update.description?
          app.url = update.url if update.url?

          app.code = update.code if update.code?

          res.json app
          app.save (err, user) ->
            console.log err if err?
#            console.log 'Successful App Update'
        else
          res.json undefined
    else
#      console.log(req.user._id)
      options = {
        name: update.name,
        description: update.description,
        url: update.url,
        owner: req.user._id
      }
      if update.code?
        options.code = update.code
      newApp = new vOS_App(options)
      
      if newApp.code? and newApp.url is 'upload'
        newApp.url = 'http://vos.jit.su/hosted?id=' + newApp._id

      newApp.save (err, user) ->
        console.log err if err?
        console.log user
        res.json user
        console.log 'Successful New App'
]

app.get '/dashboard', [
  verifySignedIn,
  (req, res) ->
    vOS_App.find owner: req.user._id, (err, apps) ->
      console.log err if err?
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
        console.log err if err?
        console.log app
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

app.get('/', (req, res) ->
  vOS_App.findOne(_id: featured_apps[0], (err, app) ->
    console.log(err) if err?
    console.log(app)
    res.render('home', {
      user: req.user,
      featured: featured_apps,
      displayApp: app,
      message: req.flash('error')
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
  verifySignedIn,
  (req, res) ->
    res.render 'account', {
      user: req.user
    }
])

app.get('/forgot', (req, res) ->
  res.render 'forgot', {
    user: req.user
  })

app.get '/debug', (req, res) ->
  recents = defaultAppList
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

#if there is already an output, or there is no longer an input, don't enter
enter = (req, res, viewName) ->
  console.log 'entering'
  console.log req.query.session_id
  console.log sessions
  console.log(sessions[req.query.session_id])
  if req.query.session_id? and sessions[req.query.session_id]?.input? and not sessions[req.query.session_id].output?
    recents = defaultAppList

    User.findOne token: sessions[req.query.session_id].token, (err, user) ->
      if user?
        recents = user.recents
      if not recents? or recents.length is 0
        recents = defaultAppList

      #console.log(recents)

      if req.query.app_id
        if user? and (not user.recents or user.recents.indexOf req.query.app_id is -1)
          #Add to recents
          user.recents = [] if not user.recents? 
          user.recents.push req.query.app_id
          user.save (err, user) ->
            console.log err if err?
            console.log 'Added New Recent App'

      vOS_App.findOne _id: req.query.app_id, (err, app) ->
        console.log err if err?
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

app.get '/enterCardboard', (req, res) ->
  enter req, res, 'cardboardvOS'

app.get '/cardboard', (req, res) ->
  res.render('cardboard', {
      layout: false
  })

app.get '/pair', (req, res) ->
  res.render('pair', {
      layout: false
  })

app.get '/getUsers', (req, res) ->
  User.find({}, (err, people) ->
    res.json(people)
  )

app.get '/getApps', (req, res) ->
  vOS_App.find({}, (err, apps) ->
    res.json(apps)
  )

app.get '/removeUser', (req, res) ->
  User.remove({_id: req.query.id}, (err, people) ->
    res.json(people)
  )

app.get '/removeApp', (req, res) ->
  vOS_App.remove({_id: req.query.id}, (err, apps) ->
    res.json(apps)
  )

app.get '/enter', (req, res) ->
  enter req, res, 'vOS'

app.get('/mirror', [
  verifySignedIn,
  (req, res) ->
    options = {
      layout: false,
      session_id: req.query.session_id,
      user: req.user,
      view: req.query.view,
      token: req.user.token
    }
    ###
    if sessions[req.query.session_id]?.token?
      options.token = sessions[req.query.session_id].token
    else
      options.token = null
    ###
    res.render('mirror', options)
])

options = {
  key: secrets.ssl.key,
  cert: secrets.ssl.cert
}
httpServer = http.createServer(app).listen(8081)
#httpsServer = https.createServer(options, app).listen(443)

io = socket.listen(httpServer)
io.set('log level', 0)

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
#    console.log 'emit: value, ' + data

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

    if data.type is 'mirror'
      console.log 'got mirror'
      #Find session that it is requesting
      #Require token to mirror
      #console.log(sessions[data.session_id])
      #console.log(data)

      if sessions[data.session_id]? and data.view? and data.token? and sessions[data.session_id].token is data.token
        mirrors = sessions[data.session_id].mirrors
        unless mirrors[data.view]?
          mirrors[data.view] = []
        mirrors[data.view].push(socket)
        console.log(['D', mirrors[data.view]])

        #for mirror in mirrors[data.view]
        #  mirror.emit('mirror', {image: ''})

        sessions[data.session_id].output.emit('mirror-views', Object.keys(sessions[data.session_id].mirrors))

        #'mirror-request', {view, message: start/stop/pose, pose: {phi, theta, yaw}}
        #if data.view is 'HUD' and sessions[data.session_id].mirrors[data.view].length is 1
        socket.on('mirror-data', (reqData) ->
          reqData.view = data.view
          sessions[data.session_id].output.emit('mirror-data', reqData)
          )
        socket.on('disconnect', ->
          #remove and send update
          #socket.emit('mirror-views', bject.keys(sessions[data.session_id].mirrors))
          )
   
    if data.type is 'output'
      console.log 'got output'
      #Check if session is real, if so, add self as output and bind.
      if data.session_id? and sessions[data.session_id]? and not sessions[data.session_id].output?
        session = sessions[data.session_id]
        session.output = socket
        console.log('binding')
        bind(session)
        session.output.on('disconnect', ->
          killSession(data.session_id)
        )

        #'mirror', {type, image}
        session.output.on('mirror', (data) ->
          #find mirrors for this output which want this type and send the image to them
          console.log('mirror incoming')
          console.log(session.mirrors[data.view])
          if session.mirrors[data.view]?
            for mirror in session.mirrors[data.view]
              console.log('emitted')
              mirror.emit('mirror', data)
        )
      else
        socket.emit 'error', 'incorrect session id'

    if data.type is 'input'
      #Listen for code
      console.log 'got input'
      console.log data
      User.findOne token: data.token, (err, user) ->
        console.log err if err?
        if user?
          socket.on 'code', (raw) ->
            console.log 'got code'
            console.log raw
            code = raw.toUpperCase()
            #If code exists, make a session and send it to the page.
            if codes[code] isnt undefined
              newSessionID = getNewSessionID()

              #tell user which session they are on
              user.sessionID = newSessionID
              user.save (err, user) ->
                console.log err if err?

              sessions[newSessionID] = {
                token: data.token,
                userID: user._id,
                input: socket,
                mirrors: {},
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
        else
          socket.emit 'error', 'bad token'
