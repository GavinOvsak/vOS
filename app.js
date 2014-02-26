var socket = require('socket.io')
  , fs = require('fs')
  , express = require('express');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'virtual OS' }));
app.use(app.router);
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/', function(req, res) {
    res.render('home');
});
app.get('/develop', function(req, res) {
    res.render('develop');
});
app.get('/about', function(req, res) {
    res.render('about');
});
app.get('/try', function(req, res) {
    res.render('try');
});
app.get('/enter', function(req, res) {
    res.render('vOS', {
      session_id: req.query.session_id
    });
});
app.get('/app', function(req, res) {
    res.render('app', {
      appID: req.query.app_id
    });
});
app.get('/latestAPK', function(req, res) {
  var file = __dirname + '/public/vOSController.apk';
  res.download(file);
});
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/static', express.static(__dirname + '/public'));

var io = socket.listen(app.listen(8081));
io.set('log level', 0);

var keyOptions = ['2', '3', '4', '6', '7', '8', '9', 'A', 'B', 'C', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

var codes = {
/*  "AAA": websiteSocket
*/
};

var lastSession = 0;
var sessions = {
  /*"1234234": {
    userID: 1,
    input: inputSocket,
    output: outputSocket
  }*/
};

var makeKey = function() {
  var key = '';
  while(key == '' || codes[key]) {
    key = '';
    key += keyOptions[Math.floor(Math.random()*keyOptions.length)];
    key += keyOptions[Math.floor(Math.random()*keyOptions.length)];
    key += keyOptions[Math.floor(Math.random()*keyOptions.length)];
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
  }
}


io.sockets.on('connection', function (socket) {
  console.log('connected');
  socket.on('declare-type', function (data) {
    //Types of connections: page, output, input
    console.log(data.type);
    if (data.type == 'page') {
      //Make key, tie it to website socket.
      var key = makeKey(); 
      codes[key] = socket;
      console.log('Key: ' + key);
      socket.emit('code', key);
      socket.on('disconnect', function() {
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
          var newSessionId = lastSession++;
          sessions[newSessionId] = {
            user_id: data.user_id,
            input: socket
          };
          //input = socket;//debugging
          socket.on('disconnect', function() {
            killSession(newSessionId);
          });
          socket.on('connection', function(status) {
            console.log(status);
            if (status == 'cancelled') {
              killSession(newSessionId);
            }
          });

          socket.emit('response', 'correct pair code');
          codes[code].emit('session_id', newSessionId);
          delete codes[code];
        } else {
          socket.emit('error', 'incorrect pair code');
        }
      });
    }
  });
});

