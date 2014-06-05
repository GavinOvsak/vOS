var vOSdiv = document.getElementById('vOS-embed');

if (vOSdiv.getAttribute('data-app')) {
	var vOSsocket = io.connect('http://vos.jit.su/');
	var anchor = document.createElement('a');
	anchor.setAttribute('id', 'vOS-code');
	anchor.setAttribute('href', 'http://vos.jit.su/app?app_id=' + vOSdiv.getAttribute('data-app'))

	vOSdiv.appendChild(anchor);

	anchor.innerHTML = 'Download vOS';

	vOSsocket.on('code', function(data) {
		anchor.innerHTML = 'vOS Pair Code: ' + data.code;
	});
	vOSsocket.on('session_id', function(data) {
		window.location = "http://vos.jit.su/enter?session_id=" + data.id + "&app_id=" + vOSdiv.getAttribute('data-app') + "&from=" + encodeURIComponent(window.location.href);
	});
	vOSsocket.emit('declare-type', {type: 'page', name: 'embed'});
}
