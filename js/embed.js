(function() {
var vOSdiv = document.getElementById('vOS-embed');

$.getScript('http://vos.jit.su/socket.io/socket.io.js', function(data) {
	var vOSsocket = io.connect('http://vos.jit.su/');
	var anchor = document.createElement('a');
	anchor.setAttribute('id', 'vOS-code');

	if (vOSdiv.getAttribute('data-app')) {
		anchor.setAttribute('href', 'http://vos.jit.su/app?app_id=' + vOSdiv.getAttribute('data-app'))
	} else {
		anchor.setAttribute('href', 'http://vos.jit.su')
	}

	vOSdiv.appendChild(anchor);

	anchor.innerHTML = 'vOS Pair Code: ...';

	//debugger
	vOSsocket.on('code', function(data) {
		anchor.innerHTML = 'vOS Pair Code: ' + data.code;
	});
	vOSsocket.on('session_id', function(data) {
		var appField = (vOSdiv.getAttribute('data-app') != null)? "&app_id=" + vOSdiv.getAttribute('data-app') : "";
		var domain = (vOSdiv.getAttribute('data-cardboard') != null)? "http://vos.jit.su/enterCardboard" : "http://vos.jit.su/enter";

		window.location = domain + "?session_id=" + data.id + appField + "&from=" + encodeURIComponent(window.location.href);
	});
	vOSsocket.emit('declare-type', {type: 'page', name: 'embed'});
});

})()