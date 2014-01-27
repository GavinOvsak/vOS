//var app = require('http').createServer(handler)
var socket = require('socket.io')
  , fs = require('fs')
  , express = require('express');

var app = express();
//app.get("/", handler);

app.configure(function(){
  app.use('/', express.static(__dirname + '/public'));
});

var io = socket.listen(app.listen(80));

/*
function handler (req, res) {
//  res.writeHead(200, {"Content-Type": "text/plain"});
//  res.end("Hello World\n");
  fs.readFile(__dirname + '/public/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}*/

var outputs = {};
var inputs = {};

var keyOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

var makeKey = function() {
  var key = '';
  while(key == '' || outputs[key]) {
    key = '';
    key += keyOptions[Math.floor(Math.random()*keyOptions.length)];
    key += keyOptions[Math.floor(Math.random()*keyOptions.length)];
    key += keyOptions[Math.floor(Math.random()*keyOptions.length)];
  }
  return key;
}

var bind = function(input, output) {
  input.on('start', function (data) {
    parsed = JSON.parse(data);
    output.emit('start', data);
    console.log('emit: start, ' + data);
  });
  input.on('move', function (data) {
    parsed = JSON.parse(data);
    output.emit('move', data);      
    console.log('emit: move, ' + data);
  });
  input.on('end', function (data) {
    parsed = JSON.parse(data);
    output.emit('end', data);      
    console.log('emit: end, ' + data);
  });
  input.on('size', function (data) {
    parsed = JSON.parse(data);
    output.emit('size', data);      
    console.log('emit: size, ' + data);
  });
}

io.sockets.on('connection', function (socket) {
  console.log('connected');
  socket.on('declare-type', function (data) {
    if (data == 'input') {
      socket.on('code', function (data) {
        var password = data.toUpperCase();
        if(!!outputs[password] && !inputs[password]) {
          //Todo: Consider if output is already used.

          inputs[password] = socket;

          //On input action, send to output
          bind(inputs[password], outputs[password]);

          //Notify on disconnect, should work if only one input per output.
          outputs[password].on('disconnect', function() {
            if (!!inputs[password]) {
              inputs[password].emit('connection', 'disconnected output');
            }
            delete outputs[password]; //should set to undefined?
          });
          inputs[password].on('disconnect', function() {
            if (!!outputs[password]) {
              outputs[password].emit('connection', 'disconnected input');
            }
            delete inputs[password]; //should set to undefined?
          });

          inputs[password].emit('code', 'success');
        } else {
          socket.emit('code', 'failure');
        }
      });
    } else if (data == 'output') {
      var key = makeKey();
      console.log(key);
      socket.emit('code', key);
      outputs[key] = socket;
    }
    console.log(data);
  });
});

/*io.sockets.on('disconnection', function(socket) {
  console.log("Disconnected");
  console.log(socket);
  //check if socket is an output. If it is, send a message to the input type: 'connection', message: 'disconnected output'
});*/

//To do:
//on disconnected output, send disconnected message to its input if there is one.
//on code received from input, either send correct-code or bad-code or collision-code

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:80/");
*/