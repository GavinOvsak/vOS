var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(80);

function handler (req, res) {
//  res.writeHead(200, {"Content-Type": "text/plain"});
//  res.end("Hello World\n");
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

//Will design codified way to map
var inputSockets = [];
var outputSockets = [];

var newInputSocket = function(socket) {
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
}

io.sockets.on('connection', function (socket) {
  /*socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log('from: my other event');
    console.log(data);
  });*/
  socket.on('declare-type', function (data) {
    if (data == 'input') {
      inputSockets.push(socket);
      newInputSocket(socket);
    } else if (data == 'output') {
      outputSockets.push(socket);
    }
    console.log(data);
    console.log(inputSockets);
    console.log(outputSockets);
  });
});


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