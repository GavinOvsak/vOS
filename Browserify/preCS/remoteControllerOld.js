var remoteController = exports;

remoteController.setUp = function(state, util) {
	var Point = function(x, y, i) {
		this.start = {
			x: x,
			y: y
		}
		this.x = x;
		this.y = y;
		this.i = i;
		this.taken = false;
		this.onRelease_callback = function() {};
		this.release = function(x, y, i) {
			this.onRelease_callback(x, y, i);
		};
		this.onRelease = function(callback) {
			this.onRelease_callback = callback;
		}
		this.onMove_callback = function(x, y, i) {};
		this.move = function(x, y, i) {
			this.x = x;
			this.y = y;
			this.onMove_callback(x, y, i);
		};
		this.onMove = function(callback) {
			this.onMove_callback = callback;
		}
	};

	var checkGrab = function(point) {
		var panelApp = state.getPanelApp();
		if (!state.topBar.moving && !state.hidden) {
			var objects = [state.topBar];
			switch(state.mode) {
				case state.modes.Normal:
					objects = objects.concat(panelApp.panel.objects);
					break;
				case state.modes.AppSwitch:
					objects = objects.concat(state.appSwitcherPanel.objects);
					break;
				case state.modes.Notifications:
					objects = objects.concat(state.notificationPanel.objects);
					break;
			}
			objects.map(function(object) {
				if (object.available && object.contains(point.x, point.y)) {
					object.registerPoint(point);
					point.taken = true;
				}
			});
		}
		if (state.hidden && state.topBar.available && !point.taken) {
			state.topBar.registerPoint(point);
			point.taken = true;
		}
	};

	var socket = io.connect('/');
	socket.on('disconnect', function() {
	  	if (sessionId != 'debug') {
			window.location = state.fromURL;
		}
	});

	socket.emit('declare-type', {
		type: 'output',
		session_id: sessionId
	});

	socket.on('error', function(result) {
		if (sessionId != 'debug') {
			window.location = state.fromURL;
		}
	});

	socket.on('size', function (data) {
		state.deviceDimensions = {
			width: JSON.parse(data).width,
			height: JSON.parse(data).height
		};
	});

	socket.on('start', function (data) {
		var parsed = JSON.parse(data);
		var point = new Point(parsed.x, parsed.y, parsed.i);
		state.points[parsed.i] = point;
		checkGrab(point);
	});

	socket.on('move', function (data) {
		var parsed = JSON.parse(data);
		var point = state.points[parsed.i];
		point.move(parsed.x, parsed.y, parsed.i);
		if (!point.taken) {
			checkGrab(point);
		}
	});

	socket.on('end', function (data) {
		var parsed = JSON.parse(data);
		state.points[parsed.i].release(parsed.x, parsed.y, parsed.i);
		state.points[parsed.i] = {};
	});
};