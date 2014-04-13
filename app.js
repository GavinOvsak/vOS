var socket = require('socket.io')
  , fs = require('fs')
  , express = require('express')
  , login = require('connect-ensure-login')
  , passport = require('passport')
  , partials = require('express-partials')
  , GooglePlusStrategy = require('passport-google-plus')
  , mongoose = require('mongoose')
  , secrets = require('./secrets.json');

var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { 
  if (error) {
    console.log(error);
    process.exit(1);
  } 
  sys.puts(stdout); 
}
exec("browserify ./Browserify/main.js -o ./js/bundle.js", puts);

mongoose.connect(secrets.mongoURL);

var vOS_App = mongoose.model('vOS_App', { 
  name: String,
  description: String,
  url: String, 
  owner: String
});

var User = mongoose.model('User', { 
  id: String,
  name: String,
  email: String,
  recent: Array
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  /*User.remove({}, function() {
    console.log('Wiped People');
  });*/
});

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'virtual OS secret' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.post('/auth/google/callback', 
  passport.authenticate('google'),
  function(req, res) {
    res.send(req.user);
});

app.post('/logout', function(req, res){
  req.logout();
  res.json({});
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post('/recentApps', [
  login.ensureLoggedIn('/'),
  function(req, res) {
    var newList = req.body;
    req.user.recent = newList;
    req.user.save(function (err, user) {
      if (err) { console.log(err); }
      console.log('Successful App Update');
    });
    res.json(req.user);
  }
]);

app.get('/appList', [
  login.ensureLoggedIn('/'),
  function(req, res) {
    vOS_App.find( {}, function(err, apps) {
      if (err) { console.log(err); }
      console.log(apps);
      res.json(apps);
    });
  }
]);

app.post('/dashboard/update', [
  login.ensureLoggedIn('/'),
  function(req, res) {
    var update = req.body;
    console.log(update);
    if (update.id) {
      vOS_App.findOne( {_id: update.id}, function(err, app) {
        if (err) { console.log(err); }
        console.log(app);
        if (app) {
          for (key in update) {
            app[key] = update[key];
          }
          res.json(app);
          app.save(function (err, user) {
            if (err) { console.log(err); }
            console.log('Successful App Update');
          });
        } else {
          res.json(undefined);
        }
      });
    } else {
      console.log(req.user.id)
      var newApp = new vOS_App(
      {
        name: update.name,
        description: update.description,
        url: update.url,
        owner: req.user.id
      });
      newApp.save(function (err, user) {
        if (err) { console.log(err); }
        console.log(user);
        res.json(user);
        console.log('Successful New App');
      });
    }
  }
]);

app.get('/dashboard', [
  login.ensureLoggedIn('/'),
  function(req, res) {
    vOS_App.find( {owner: req.user.id}, function(err, apps) {
      if (err) { console.log(err); }
      console.log(apps);
      res.render('dashboard', {
        user: req.user,
        home: false,
        apps: apps
      });
    });
  }
]);

app.get('/appInfo', [
  function(req, res) {
    if (req.query.app_id) {
      vOS_App.findOne( {_id: req.query.app_id}, function(err, app) {
        console.log(err);
        console.log(app);
        res.json(app);
      });
    } else {
      res.json(null);
    }
}]);

app.get('/all', function(req, res) {
  vOS_App.find( {}, function(err, apps) {
    res.render('all', {
      user: req.user,
      home: false,
      allApps: apps
    });
  });
});

app.get('/app', function(req, res) {
  vOS_App.findOne( {_id: req.query.app_id}, function(err, app) {
    console.log(app);
    res.render('app', {
      user: req.user,
      home: false,
      app: app
    });
  });
});

app.get('/appSearch', [
  function(req, res) {
  res.render('appSearch', {
    user: req.user,
    home: false
  });
  /*
  vOS_App.find( {_id: req.query}, function(err, app) {
    console.log(app);
    res.render('appSearch', {
      user: undefined,
      home: false,
      app: app
    });
  });*/
}
]);

app.delete('/app', function(req, res) {
  vOS_App.remove( {_id: req.query.app_id}, function(err, app) {
    console.log(app);
    res.json(app);
  });
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(obj, done) {
  User.findOne( {id: obj}, function(err, person) {
    if (err) { console.log(err); }
    done(null, person);
  });
});

var GOOGLE_CLIENT_ID = secrets.google.clientID;
var GOOGLE_CLIENT_SECRET = secrets.google.clientSecret;

passport.use(new GooglePlusStrategy({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://gavinovsak-vos.jit.su/auth/google/callback"
  },
  function(tokens, profile, done) {
    User.find( {id: profile.id}, function(err, people) {
      if (people.length == 0) {
        var newUser = new User(
        {
          id: profile.id,
          name: profile.displayName,
          email: profile.email,
          recent: ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf']
        });
        newUser.save(function (err, user) {
          if (err) { console.log(err); }
          console.log('Successful Save');
        });
      }
    })
    // Create or update user, call done() when complete...
    process.nextTick(function () {
      done(null, profile, tokens);
    });
  }
));

var featured_apps = [
  '5315354db87e860000a11cbc'
];

app.get('/', function(req, res) {
    res.render('home', {
      user: req.user,
      home: true,
      featured: featured_apps
    });
});

app.get('/documentation', function(req, res) {
    res.render('documentation', {
      user: req.user,
      home: false
    });
});

app.get('/about', function(req, res) {
    res.render('about', {
      user: req.user,
      home: false
    });
});
app.get('/try', function(req, res) {
    res.render('try', {
      user: req.user,
      home: false
    });
});

app.get('/debug', function(req, res) {
  var recents = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf'];
  var render = function(app) {
    res.render('vOS', {
      user: {debug: true},
      layout: false,
      session_id: 'debug',
      recentApps: recents,
      userID: '1',
      app: app
    });
  }
  if (req.query.app_id) {
    vOS_App.findOne( {_id: req.query.app_id}, function(err, app) {
        console.log(app);
        render(app);
      });
  } else {
    render(undefined);
  }
});

app.get('/local', function(req, res) {
    res.render('local', {
      user: req.user,
      home: false
    });
});

app.get('/enterLocal', function(req, res) {
  if (req.query.session_id && sessions[req.query.session_id]) {
    var recents = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf'];
    if (req.user) {
      recents = req.user.recents;
    }
    if (!recents || recents.length == 0) {
      recents = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf'];
    }
    console.log(recents);
    if (req.query.app_id) {
      if (req.user && (!req.user.recents || req.user.recents.indexOf(req.query.app_id) == -1)) {
        //Add to recents
        if (!req.user.recents) {
          req.user.recents = []; 
        }
        req.user.recents.push(req.query.app_id);
        req.user.save(function (err, user) {
          if (err) { console.log(err); }
          console.log('Added New Recent App');
        });
      }
      vOS_App.findOne( {_id: req.query.app_id}, function(err, app) {
        console.log(app);
        if (req.user || app) {
          res.render('localvOS', {
            user: req.user,
            layout: false,
            session_id: req.query.session_id,
            recentApps: recents,
            userID: req.user.id,
            app: app
          });
        } else {
          res.redirect('/local');
        }
      });
    } else if (req.user) {
      res.render('localvOS', {
        user: req.user,
        layout: false,
        session_id: req.query.session_id,
        recentApps: recents,
        userID: req.user.id,
        app: undefined
      });
    } else {
      res.redirect('/local');
    }
  } else {
    res.redirect('/local');
  }
});

app.get('/enter', function(req, res) {
  if (req.query.session_id && sessions[req.query.session_id]) {
    var recents = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf'];
    if (req.user) {
      recents = req.user.recents;
    }
    if (!recents || recents.length == 0) {
      recents = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf'];
    }
    console.log(recents);
    if (req.query.app_id) {
      if (req.user && (!req.user.recents || req.user.recents.indexOf(req.query.app_id) == -1)) {
        //Add to recents
        if (!req.user.recents) {
          req.user.recents = []; 
        }
        req.user.recents.push(req.query.app_id);
        req.user.save(function (err, user) {
          if (err) { console.log(err); }
          console.log('Added New Recent App');
        });
      }
      vOS_App.findOne( {_id: req.query.app_id}, function(err, app) {
        console.log(app);
        if (req.user || app) {
          res.render('vOS', {
            user: req.user,
            layout: false,
            session_id: req.query.session_id,
            recentApps: recents,
            userID: req.user.id,
            app: app
          });
        } else {
          res.redirect('/');
        }
      });
    } else if (req.user) {
      res.render('vOS', {
        user: req.user,
        layout: false,
        session_id: req.query.session_id,
        recentApps: recents,
        userID: req.user.id,
        app: undefined
      });
    } else {
      res.redirect('/');
    }
  } else {
    res.redirect('/');
  }
});

app.get('/latestAPK', function(req, res) {
  var file = __dirname + '/public/vOS_Controller.apk';
  res.download(file);
});
app.use('/js', express.static(__dirname + '/js'));
app.use('/Browserify', express.static(__dirname + '/Browserify'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/static', express.static(__dirname + '/public'));

var io = socket.listen(app.listen(8081));
io.set('log level', 0);

var keyOptions = ['2', '3', '4', '6', '7', '8', '9', 'A', 'B', 'C', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

var codes = {
/*  "AAA": {socket: websiteSocket, name: name}
*/
};

//sessions could be an array. earliest undefined could be stored, and could find the next one from there.

var earliestUndefined = 0;
var getNewSessionID = function() {
  while (sessions[earliestUndefined]) {
    earliestUndefined ++;
  }
  return earliestUndefined;
};
var sessions = [];
  /*"1234234": {
    userID: 1,
    input: inputSocket,
    output: outputSocket
  }*/


var makeKey = function() {
  var key = '';
  while(key == '' || codes[key]) {
    key = '';
    key += keyOptions[Math.floor(Math.random() * keyOptions.length)];
    key += keyOptions[Math.floor(Math.random() * keyOptions.length)];
    key += keyOptions[Math.floor(Math.random() * keyOptions.length)];
  }
  return key;
}

var bind = function(session) {
  session.input.on('start', function (data) {
    parsed = JSON.parse(data);
    session.output.emit('start', data);
    console.log('emit: start, ' + data);
  });
  session.input.on('move', function (data) {
    parsed = JSON.parse(data);
    session.output.emit('move', data);
    console.log('emit: move, ' + data);
  });
  session.input.on('end', function (data) {
    parsed = JSON.parse(data);
    session.output.emit('end', data);      
    console.log('emit: end, ' + data);
  });
  session.input.on('size', function (data) {
    parsed = JSON.parse(data);
    session.output.emit('size', data);      
    console.log('emit: size, ' + data);
  });
  session.input.on('quaternion', function (data) {
    parsed = JSON.parse(data);
    session.output.emit('quaternion', data);      
    console.log('emit: quaternion, ' + data);
  });
  session.input.emit('response', 'ready');
}

var killSession = function(session_id) {
  if (sessions[session_id]) {
    if (sessions[session_id].input != undefined) {
      sessions[session_id].input.emit('error', 'output disconnected');
    }
    if (sessions[session_id].output != undefined) {
      sessions[session_id].output.emit('error', 'input disconnected');
    }
    delete sessions[session_id];
    earliestUndefined = session_id;
  }
}

io.sockets.on('connection', function (socket) {
  //console.log(socket);
  console.log('connected');
  socket.on('declare-type', function (data) {
    //Types of connections: page, output, input
    console.log(data.type);
    if (data.type == 'page') {
      //Make key, tie it to website socket.
      var key = makeKey();
      codes[key] = {
        socket: socket,
        name: data.name
      };
      console.log('Key: ' + key);
      socket.emit('code', {
        code: key,
        name: data.name
      });
      socket.on('disconnect', function() {
        //console.log(Object.keys(codes));
        delete codes[key];
      });
    }
    if (data.type == 'output') { 
      //Check if session is real, if so, add self as output and bind.
      if (data.session_id != undefined && sessions[data.session_id] != undefined && sessions[data.session_id].output == undefined) {
        var session = sessions[data.session_id];
        session.output = socket;
        bind(session);
        session.output.on('disconnect', function () {
          killSession(data.session_id);
        });
      } else {
        socket.emit('error', 'incorrect session id');
      }
    }
    if (data.type == 'input') {
      //Listen for code
      socket.on('code', function (raw) {
        var code = raw.toUpperCase();
        //If code exists, make a session and send it to the page.
        if (codes[code] != undefined) {
          var newSessionID = getNewSessionID();
          sessions[newSessionID] = {
            user_id: data.user_id,
            input: socket
          };
          socket.on('disconnect', function() {
            killSession(newSessionID);
          });
          socket.on('connection', function(status) {
            if (status == 'cancelled') {
              killSession(newSessionID);
            }
          });

          socket.emit('response', 'correct pair code');
          codes[code].socket.emit('session_id', {
            id: newSessionID,
            name: codes[code].name
          });
          delete codes[code];
        } else {
          socket.emit('error', 'incorrect pair code');
        }
      });
    }
  });
});

