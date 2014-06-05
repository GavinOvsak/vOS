var state = exports;

// ------- Variables --------

state.apps = [];
state.front = undefined;
state.back = undefined;
state.hidden = false;
state.front_and_back = undefined;
state.points = [];
state.width = window.innerWidth;//1200
state.height = window.innerHeight;//800;
state.camera = undefined;

state.modes = {
	Normal: 'normal',
	AppSwitch: 'app-switch',
	Notifications: 'notifications'
};
state.notificationPanel = undefined;
state.appSwitcherPanel = undefined;
state.topBar = undefined//new VRK.SystemBar(0, 8 + 1/2, 12, 1);

var numColumns = 12;
var numRows = 8;
state.unitWidth = 1/numColumns;
state.unitHeight = 1/(numRows + 1); //Leave space for top bar
state.oldState = state.modes.Normal;
state.lastUpdate = 0;
state.BaseRotationEuler = new THREE.Vector3();
state.BaseRotation = new THREE.Quaternion();

// ----- Functions -------

state.open = function(app) {
	//if is already in front+back or back, go to front+back. If is already in front go to front
	if (state.back != null && state.back.index == app.index) {
		state.back = null;
		state.front_and_back = app;
	} else if (state.front_and_back == null || state.front_and_back.index != app.index) {
		if (app.external.drawContained != null) {
			//if front and back app has back, push to back
			if (state.front_and_back != null && state.front_and_back.external.drawImmersiveBackground != null) {
				state.back = state.front_and_back;
			}
			state.front_and_back = null;
			state.front = app;
		} else if(app.external.drawImmersive) {
			state.front = null;
			state.back = null;
			state.front_and_back = app;
		} else if(app.external.drawImmersiveBackground) {
			state.front_and_back = null;
			state.back = app;
		}
	}
	state.mode = state.modes.Normal;
};


state.onAppListUpdate = function(func) {
	state.onAppListUpdate.listeners.push(func);
};
state.onAppListUpdate.listeners = [];

state.fromURL = "/";

state.add = function(extern, controls) {
	var app = {};
	app.external = extern;
	app.panel = new controls.Panel(app);
	app.name = extern.name;
	app.icon = extern.icon;
	app.index = state.apps.length;
	state.apps.push(app);

	var appData = {
		panel: app.panel, 
		user: {
			id: '1'
		}
	};

	(function(data){
		app.external.setUp(data);
	})(appData);

	for (listener in state.onAppListUpdate.listeners) {
		state.onAppListUpdate.listeners[listener]();
	}
	return app;
	//state.open(app);
};

state.canMaximize = function() {
	return state.front != null && state.front.external.drawImmersive != null;
};

state.canMinimize = function() {
	return state.front_and_back != null && state.front_and_back.external.drawContained != null;
};

state.getPanelApp = function() {
	if (state.front != null) {
		return state.front;
	} else if (state.front_and_back != null) {
		return state.front_and_back;
	} 
	return null;
}

state.minimize = function() {
	if (state.canMinimize()) {
		state.front = state.front_and_back;
		state.front_and_back = null;
	}
};

state.maximize = function() {
	if (state.canMaximize()) {
		state.front_and_back = state.front;
		state.front = null;
		state.back = null;
	}
};

state.toggleMaxMin = function() {
	if (state.front != null) {
		state.maximize();
	} else if(state.front_and_back != null) {
		state.minimize();
	}
};

state.close = function() {
	if (state.front != null) {
		if (state.back != null && state.back.external.drawImmersive != null) {
			state.front_and_back = state.back;
			state.back = null;
		}
		state.front = null;
	} else if (state.front_and_back != null) {
		state.front_and_back = null;
	} else if (state.back != null) {
		state.back = null;
	}
	if (state.front == null && state.front_and_back == null) {
		state.mode = state.modes.AppSwitch;
	}
}

state.drawPanel = function(scene, util) {
	var redLambert = new THREE.MeshLambertMaterial({ color: 0xCC0000 });

	var panelMesh = new THREE.Mesh(
		new THREE.PlaneGeometry(80, 30),
		redLambert);

	panelMesh.position.x = state.camera.position.x + 0;
	panelMesh.position.y = state.camera.position.y + 80;
	panelMesh.position.z = state.camera.position.z - 20;

	panelMesh.rotation.x = -1.1 + Math.PI/2;

	var panelApp = state.getPanelApp();

	if (state.hidden) {
		//To unhide, drag up at least a threshold and show bar rising from bottom. Jump on let go.
		state.topBar.draw(scene, panelMesh);
	} else {
		if (state.topBar.moving) {
			state.topBar.draw(scene, panelMesh);
		} else {
			var objects = [state.topBar];
			switch(state.mode) {
				case state.modes.Normal:
					if (panelApp != null) {
						objects = objects.concat(panelApp.panel.objects);
					}
					break;
				case state.modes.Notifications:
					if (state.oldState != state.mode) {
						//setUpNotifications();
					}
					objects = objects.concat(state.notificationPanel.objects);
					break;
				case state.modes.AppSwitch:
					if (state.oldState != state.mode) {
						//setUpAppSwitcher();
					}
					objects = objects.concat(state.appSwitcherPanel.objects);
					break;
			}
			state.oldState = state.mode;
			objects.map(function(object) {
				object.draw(scene, panelMesh);
			});

			scene.add(panelMesh);
			var circle_amplitude = 0.01;
			for (var i = 0; i < state.points.length; i++) {
				if (state.points[i] != null && state.points[i].x != undefined && state.points[i].y != undefined ) {
					var circle = util.makeCircle(circle_amplitude);
					util.setPanelPosition(panelMesh, circle, state.points[i].x, state.points[i].y, 0.15);
					scene.add(circle);
				}
			}
		}
	}
};

$.ajax({
	url: 'http://vos.jit.su/static/wordlist.txt',
	success: function(wordlist) {
		state.wordlist = wordlist.split('\r\n');
	}
});

