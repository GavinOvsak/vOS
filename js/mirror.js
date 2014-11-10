var socket = io.connect('/');//Need a different code
/*
socket.on('code', function(data) {
  if (data.name == 'appSpecific') {
    $('#directCode').text(data.code);
  }
});
socket.on('session_id', function(data) {
  console.log(data.id);
  if (data.name == 'appSpecific') {
    window.location = "/enter?session_id=" + data.id + "&app_id=<%= displayApp._id %>&from=" + encodeURIComponent(window.location.href);
  }
});*/
socket.emit('declare-type', {type: 'mirror', view: view, token: token, session_id: sessionId});
socket.on('mirror', function(data) {
	console.log('got image!');
	var image = data.image;
	if (image != null) {
		$('#viewer').attr('src', image);
	}
});
socket.emit('mirror-data', {
	pose: {phi: 0, theta: 0, yaw: 0}
});
