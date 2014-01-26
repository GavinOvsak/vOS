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

/*var newInputSocket = function(socket) {
  socket.on('start', function (data) {
    parsed = JSON.parse(data);
    for (var i = 0; i < outputSockets.length; i++) {
      console.log('emit: start, ' + data);
      outputSockets[i].emit('start', data);      
    }
    console.log(parsed);
  });
  socket.on('move', function (data) {
    parsed = JSON.parse(data);
    for (var i = 0; i < outputSockets.length; i++) {
      console.log('emit: move, ' + data);
      outputSockets[i].emit('move', data);      
    }
    console.log(parsed);
  });
  socket.on('end', function (data) {
    parsed = JSON.parse(data);
    for (var i = 0; i < outputSockets.length; i++) {
      console.log('emit: end, ' + data);
      outputSockets[i].emit('end', data);      
    }
    console.log(parsed);
  });
  socket.on('size', function (data) {
    parsed = JSON.parse(data);
    for (var i = 0; i < outputSockets.length; i++) {
      console.log('emit: size, ' + data);
      outputSockets[i].emit('size', data);      
    }
    console.log(parsed);
  });
}*/

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
  /*socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log('from: my other event');
    console.log(data);
  });*/
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

      //inputSockets.push(socket);
      //newInputSocket(socket);
    } else if (data == 'output') {
      var key = makeKey();
      console.log(key);
      socket.emit('code', key);
      outputs[key] = socket;
      //outputSockets.push(socket);
    }
    console.log(data);
//    console.log(inputSockets);
//    console.log(outputSockets);
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

/*
// Load the http module to create an http server.
var http = require('http');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello World\n");
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(80);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:80/");
*/