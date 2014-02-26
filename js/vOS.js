var camera_start = {
	x: Math.PI/2,
	y: -200,
	z: 10
};

var connect_code = '';

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

var kM = {
	apps: [],
	front: null,
	back: null,
	hidden: false,
	front_and_back: null,
	points: []
};

kM.topBar = new VRK.SystemBar(0, 8 + 1/2, 12, 1);

//keyboard is an 8 x 12 grid
VRK.Keyboard = function() {
	this.objects = [kM.topBar];
	this.add = function(object){
		this.objects.push(object);
	};
	this.set = function(array){
		this.objects = array;
		this.objects.push(kM.topBar);
	};
};

var apps = appList;
/*[
	'/stemkoski-vertex-colors.js'
//	,'/stemkoski-Textures.js'
//	,'/stemkoski-Skybox.js'
//	,'/stemkoski-Reflection.js'
//	,'/galaxy.js',
	,'/chess.js'
];*/

var WIDTH = 1200,
  HEIGHT = 800;

var VIEW_ANGLE = 45,
  ASPECT = WIDTH / HEIGHT,
  NEAR = 0.1,
  FAR = 10000;

var $viewer = $('#viewer');

var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
//THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
//if ( Detector.webgl )
var renderer = new THREE.WebGLRenderer( {antialias:true} );
//else
//    var renderer = new THREE.CanvasRenderer(); 

var camera_start = {
	x: Math.PI/2,
	y: -200,
	z: 10
};

camera.rotation.x = camera_start.x;
camera.position.y = camera_start.y;
camera.position.z = camera_start.z;

/*$viewer.mousemove(function(event) {
	camera.position.x = -1 * (event.pageX - 300) / 30;
	camera.position.z = (event.pageY - 200) / 30;
});*/

renderer.setSize(WIDTH, HEIGHT);
$viewer.append(renderer.domElement);

var pointLight = new THREE.PointLight(0xFFFFFF);

pointLight.position.x = 50;
pointLight.position.y = 50;
pointLight.position.z = 300;

var directLight = new THREE.DirectionalLight(0xFFFFFF);

directLight.position.x = 0;
directLight.position.y = 0;
directLight.position.z = 1;

//var ambientLight =
//  new THREE.AmbientLight(0xCC0000);

var checkGrab = function(point) {
	var keyboardApp = kM.getKeyboardApp();
	if (!kM.topBar.moving) {
		var objects = [];
		switch(kM.state) {
			case kM.State.Normal:
				objects = keyboardApp.keyboard.objects;
				break;
			case kM.State.AppSwitch:
				objects = kM.appSwitcherKeyboard.objects;
				break;
			case kM.State.Notifications:
				objects = kM.notificationKeyboard.objects;
				break;
		}
		objects.map(function(object) {
			if (object.available && object.contains(point.x, point.y)) {
				object.registerPoint(point);
				point.taken = true;
			}
		});
	}
	if (kM.hidden && kM.topBar.available && !point.taken) {
		kM.topBar.registerPoint(point);
		point.taken = true;
	}
}

//var scene = new THREE.Scene();

kM.State = {
	Normal: 'normal',
	AppSwitch: 'app-switch',
	Notifications: 'notifications'
};
kM.notificationKeyboard = new VRK.Keyboard();
kM.appSwitcherKeyboard = new VRK.Keyboard();

var setUpNotifications = function() {
	kM.appSwitcherKeyboard.objects = [kM.topBar];
};
setUpNotifications();

var setUpAppSwitcher = function() {
	kM.appSwitcherKeyboard.objects = [kM.topBar];
	var row = 0;
	var column = 0;
	var index = 0;
	var app;

	var codeLabel = new VRK.Label(3, 7, 2, 1, 'Code:  ' + connect_code, 15);
	kM.appSwitcherKeyboard.add(codeLabel);
	for (var i = 0; i < kM.apps.length; i++) {
		app = kM.apps[i];
		
		var icon = new VRK.Button(2 + row * 2, 6 - 2 * column, 1, 1, ' '+i, 15, app.icon);
		icon.onClick((function(index){
			return function(){
				kM.open(kM.apps[index]);
			};
		})(i));
		kM.appSwitcherKeyboard.add(icon);
		if (row >= 4) {
			row = 0;
			column++;
		} else {
			row++;
		}
	}
};
setUpAppSwitcher();

kM.state = kM.State.AppSwitch;


var device_width = WIDTH;
var device_height = HEIGHT;
var quarternion = {
	w: 1,
	x: 0,
	y: 0,
	z: 0
};

kM.open = function(app) {
	//if is already in front+back or back, go to front+back. If is already in front go to front
	if (kM.back != null && kM.back.index == app.index) {
		kM.back = null;
		kM.front_and_back = app;
	} else if (kM.front_and_back == null || kM.front_and_back.index != app.index) {
		if (app.external.drawFront != null) {
			//if front and back app has back, push to back
			if (kM.front_and_back != null && kM.front_and_back.external.drawBack != null) {
				kM.back = kM.front_and_back;
			}
			kM.front_and_back = null;
			kM.front = app;
		} else if(app.external.drawFrontAndBack) {
			kM.front = null;
			kM.back = null;
			kM.front_and_back = app;
		} else if(app.external.drawBack) {
			kM.front_and_back = null;
			kM.back = app;
		}
	}
	kM.state = kM.State.Normal;
};

kM.add = function(extern) {
	var app = {};
	app.external = extern;
	app.keyboard = new VRK.Keyboard(app);
	app.name = extern.name;
	app.icon = extern.icon;
	app.index = kM.apps.length;
	kM.apps.push(app);
	app.external.setUpKeyboard(app.keyboard);
	setUpAppSwitcher();
	//kM.open(app);
};

kM.canMaximize = function() {
	return kM.front != null && kM.front.external.drawFrontAndBack != null;
};

kM.canMinimize = function() {
	return kM.front_and_back != null && kM.front_and_back.external.drawFront != null;
};

kM.getKeyboardApp = function() {
	if (kM.front != null) {
		return kM.front;
	} else if (kM.front_and_back != null) {
		return kM.front_and_back;
	} 
	return null;
}

kM.minimize = function() {
	if (kM.canMinimize()) {
		kM.front = kM.front_and_back;
		kM.front_and_back = null;
	}
};

kM.maximize = function() {
	if (kM.canMaximize()) {
		kM.front_and_back = kM.front;
		kM.front = null;
		kM.back = null;
	}
};

kM.toggleMaxMin = function() {
	if (kM.front != null) {
		kM.maximize();
	} else if(kM.front_and_back != null) {
		kM.minimize();
	}
};

kM.close = function() {
	if (kM.front != null) {
		if (kM.back != null && kM.back.external.drawFrontAndBack != null) {
			kM.front_and_back = kM.back;
			kM.back = null;
		}
		kM.front = null;
	} else if (kM.front_and_back != null) {
		kM.front_and_back = null;
	} else if (kM.back != null) {
		kM.back = null;
	}
	if (kM.front == null && kM.front_and_back == null) {
		kM.state = kM.State.AppSwitch;
	}
}


/*

Apps can have any set of the three functions f, b, f_b

New apps open at f, if no f, go to fb, if no fb, go to b. Doesn't depend on existing apps.
If existing app conflicts, close, unless was at fb, then go to b if doesn't conflict.

Only can control with keyboard in f and f_b. Maximize and minimize goes between them. App can control this. If you maximize and then minimize, it closes any background app.

Only way to get background app if to be in f_b and open a new f.

=> If you have a b, you must have an fb.

*/

var oldState = kM.State.Normal;

kM.drawKeyboard = function(scene) {
	var redLambert = new THREE.MeshLambertMaterial({ color: 0xCC0000 });

	var board = new THREE.Mesh(
		new THREE.PlaneGeometry(80, 30),
		redLambert);

	board.position.x = camera_start.x + 0;
	board.position.y = camera_start.y + 80;
	board.position.z = camera_start.z - 20;

	board.rotation.x = -1.1 + Math.PI/2;

	var unitWidth = 1/12;
	var unitHeight = 1/9;

	var keyboardApp = kM.getKeyboardApp();

	if (kM.hidden) {
		//To unhide, drag up at least a threshold and show bar rising from bottom. Jump on let go.
		kM.topBar.draw(scene, board);
	} else {
		if (kM.topBar.moving) {
			kM.topBar.draw(scene, board);
		} else {
			var objects = [];
			switch(kM.state) {
				case kM.State.Normal:
					if (keyboardApp != null) {
						objects = keyboardApp.keyboard.objects;
					}
					break;
				case kM.State.Notifications:
					if (oldState != kM.state) {
						setUpNotifications();
					}
					objects = kM.notificationKeyboard.objects;
					break;
				case kM.State.AppSwitch:
					if (oldState != kM.state) {
						setUpAppSwitcher();
					}
					objects = kM.appSwitcherKeyboard.objects;
					break;
			}
			oldState = kM.state;
			objects.map(function(object) {
				object.draw(scene, board);
			});

			scene.add(board);
			var circle_amplitude = 0.01;
			for (var i = 0; i < kM.points.length; i++) {
				if (kM.points[i] != null && kM.points[i].x != undefined && kM.points[i].y != undefined ) {
					var circle = makeCircle(circle_amplitude);
					setKeyboardPosition(board, circle, kM.points[i].x, kM.points[i].y, 0.15);
					scene.add(circle);
				}
			}
		}
	}
};

apps.map(function(appURL) {
	//var url = 'http://whateverorigin.org/get?url=' + encodeURIComponent(appURL) + '&callback=?';
/*	$.getJSON(url, function(data){
		eval(data.contents); //Find way to sanitize this.
		kM.add(exports);
	});*/

	$.getScript(appURL, function() {
		//eval(data.contents);
		kM.add(exports);
	});
});
