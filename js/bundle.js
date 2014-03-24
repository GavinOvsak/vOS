(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var appSwitcher = exports;

appSwitcher.setUp = function(state, util, controls) {
	state.notificationPanel = new controls.Panel();
	state.appSwitcherPanel = new controls.Panel();

	state.notificationPanel.objects = [state.topBar];
	state.appSwitcherPanel.objects = [state.topBar];

	var update = function() {
		var row = 0;
		var column = 0;
		var index = 0;
		var app;

		for (var i = 0; i < state.apps.length; i++) {
			app = state.apps[i];
			
			var icon = new controls.Button(2 + row * 2, 6 - 2 * column, 1, 1, {
				text: ' ' + i,
				text_size: 15, 
				icon: app.icon
			});
			icon.onClick((function(index){
				return function(){
					state.open(state.apps[index]);
				};
			})(i));
			state.appSwitcherPanel.add(icon);
			if (row >= 4) {
				row = 0;
				column++;
			} else {
				row++;
			}
		}
	};
	update();
	state.onAppListUpdate(update);
};



},{}],2:[function(require,module,exports){
var eccentricity = 80/30;
if (exports == undefined) {
	var controlObjects = {};
	var exports = controlObjects;
}

//Sign In Fix
//CORS Pictures

exports.setUp = function(state, util) {
	var controls = {};

	controls.Object = function(x, y, width, height, options) {
		this.x = (x || 0) * state.unitWidth;
		this.y = (y || 0) * state.unitHeight;
		this.width = (width || 1) * state.unitWidth;
		this.height = (height || 1) * state.unitHeight;
		this.options = options || {};
	};

	controls.Object.prototype = {
		setX: function(x) {this.x = x;},
		setY: function(y) {this.y = y;},
		setWidth: function(width) {this.width = width;},
		setHeight: function(height) {this.height = height;},
		updateOptions: function(options) {
			for (option in options) {
				this.options[option] = options[option];
			}
		}
	};

	controls.Button = function() {
		controls.Object.apply(this, arguments);
		this.applyDefaults();
	};

	controls.Button.prototype = {
		applyDefaults: function() {
			var defaultOptions = {
				text_size: 30,
				text: ''
			};

			this.options = this.options || {};
			for (var key in defaultOptions) {
				this.options[key] = this.options[key] || defaultOptions[key];
			}

			this.initGrab = {
				x: 0,
				y: 0
			};
		},
		available: true,
		point: undefined,
		threshold_distance: 0.1,		
		contains: function(x, y) {
			return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
		},
		onClick_callback: function(){},
		click: function(){
			this.onClick_callback();
		},
		onClick: function(callback) {
			this.onClick_callback = callback;
		},
		release: function(x, y) {
			if (this.dragDistance() > this.threshold_distance) {
				this.click();
			}
			this.available = true;
			this.point = undefined;
		},
		dragDistance: function() {
			if(this.point != undefined) {
				return util.distance(this.point, this.initGrab);
			}
			return 0;
		},
		registerPoint: function(point) {
			this.initGrab.x = point.x;
			this.initGrab.y = point.y;
			this.point = point;
			point.onRelease(this.release.bind(this));
			this.available = false;
		},
		draw: function(scene, panelMesh) {
			//change color based on distance
			var distance = this.dragDistance();
			var percentClicked = Math.min(distance/this.threshold_distance, 1);

			var materialOptions = {};
			if (this.point != null) {
				materialOptions.color = (0 << 16) + (200*(1-percentClicked) << 8) + percentClicked*255;
			} else {
				materialOptions.color = (0 << 16) + (200 << 8) + 0;
			}

			var material = new THREE.MeshBasicMaterial(materialOptions);

			buttonMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.width, this.height),
				material);

			util.setPanelPosition(panelMesh, buttonMesh, this.x, this.y, 0.1);

			scene.add(buttonMesh);

			var canvas1 = document.createElement('canvas');
			
			var px = this.options.text_size || 30;
			if (this.options.text != '') {
				var contentMesh = util.makeText(this.options.text, px, this.width, this.height);
			    util.setPanelPosition(panelMesh, contentMesh, this.x, this.y, 0.2);
		        scene.add( contentMesh );
			} else if (this.options.image != undefined) {
		        canvas1.height = 200;
				canvas1.width = 200;
	        	var context1 = canvas1.getContext('2d');
	       		var texture1 = new THREE.Texture(canvas1) 
				var imageObj = new Image();
		        imageObj.src = this.options.image;
		        imageObj.onload = function()
		        {
		        	/*
		            context1.drawImage(imageObj, 0, 0);
		            if ( texture1 ) {
		                texture1.needsUpdate = true;
					    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
					    material1.transparent = true;
					    var contentMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material1);
					    util.setPanelPosition(panelMesh, contentMesh, this.x, this.y, 0.2);
				        scene.add( contentMesh );
				    }*/
		        };  
			}
		}
	}

	controls.LinearSlider = function() {
		controls.Object.apply(this, arguments);
		this.applyDefaults();
	};
	controls.LinearSlider.direction = {
		VERTICAL: 'vertical',
		HORIZONTAL: 'horizontal'
	};

	controls.LinearSlider.prototype = {
		applyDefaults: function() {
			var defaultOptions = {
				direction: controls.LinearSlider.direction.VERTICAL,
				returnsToCenter: false,
				initProgress: 0.5
			};

			this.options = this.options || {};
			for (var key in defaultOptions) {
				this.options[key] = this.options[key] || defaultOptions[key];
			}

			this.line_width = 0.1;
			this.grip_height = 0.5;

			this.progress = this.options.initProgress;

			this.initGrab = {
				x: 0,
				y: 0,
				progress: 0
			};
		},
		available: true,
		point: undefined,
		getProgress: function() {
			if (this.progress == undefined) {
				this.progress = this.options.initProgress || 0.5;
			} 

			if (this.point != null) {
				if (this.options.direction == controls.LinearSlider.direction.VERTICAL) {
					this.progress = this.initGrab.progress + (this.point.y - this.initGrab.y)/(this.height - this.grip_height * state.unitHeight);
				} else if(this.options.direction == controls.LinearSlider.direction.HORIZONTAL) {
					this.progress = this.initGrab.progress + (this.point.x - this.initGrab.x)/(this.width - this.grip_height * state.unitWidth);
				}
			}
			this.progress = Math.max(Math.min(this.progress, 1), 0);
			return this.progress;
		},
		contains: function(x, y) {
			if (this.options.direction == controls.LinearSlider.direction.VERTICAL) {
				return x > this.x && x < this.x + this.width && 
					y > this.y + (this.height - this.grip_height * state.unitHeight) * this.progress && 
					y < this.y + (this.height - this.grip_height * state.unitHeight) * this.progress + this.grip_height * state.unitHeight;
			} else if (this.options.direction == controls.LinearSlider.direction.HORIZONTAL) {
				return y > this.y && y < this.y + this.height && 
					x > this.x + (this.width - this.grip_height * state.unitWidth) * this.progress && 
					x < this.x + (this.width - this.grip_height * state.unitWidth) * this.progress + this.grip_height * state.unitWidth;
			}
		},
		onRelease_callback: function(progress) {},
		onRelease: function(callback) {
			this.onRelease_callback = callback;
		},
		setProgress: function(progress) {
			this.progress = progress;
		},
		release: function(x, y) {
			this.onRelease_callback(this.getProgress());
			if (this.options.returnsToCenter) {
				this.progress = 0.5;
			}
			this.available = true;
			this.point = undefined;
		},
		onMove_callback: function(progress) {},
		onMove: function(callback) {
			this.onMove_callback = callback;
		},
		move: function(x, y) {
			this.onMove_callback(this.getProgress());
		},
		registerPoint: function(point) {
			this.initGrab.x = point.x;
			this.initGrab.y = point.y;
			this.initGrab.progress = this.progress;
			this.point = point;
			point.onRelease(this.release.bind(this));
			point.onMove(this.move.bind(this));
			this.available = false;
		},
		draw: function(scene, panelMesh) {
			//Draw line and then draw grip on top.
			var line_material = new THREE.MeshBasicMaterial({color: 0x222222});
			var grip_material = new THREE.MeshBasicMaterial({color: 0x224222});

			if (this.options.direction == controls.LinearSlider.direction.VERTICAL) {
				var line = new THREE.Mesh(
					new THREE.PlaneGeometry(this.line_width * state.unitWidth, this.height), line_material);
				util.setPanelPosition(panelMesh, line, this.x + (this.width - this.line_width * state.unitWidth)/2, this.y, 0.1);
				var gripMesh = new THREE.Mesh(
					new THREE.PlaneGeometry(this.width, this.grip_height * state.unitHeight), grip_material);
				util.setPanelPosition(panelMesh, gripMesh, this.x, this.y + (this.height - this.grip_height * state.unitHeight) * this.progress, 0.11);
			} else if (this.options.direction == controls.LinearSlider.direction.HORIZONTAL) {
				var line = new THREE.Mesh(
					new THREE.PlaneGeometry(this.width, this.line_width * state.unitHeight), line_material);
				util.setPanelPosition(panelMesh, line, this.x, this.y + (this.height - this.line_width * state.unitHeight)/2, 0.1);
				var gripMesh = new THREE.Mesh(
					new THREE.PlaneGeometry(this.grip_height * state.unitWidth, this.height), grip_material);
				util.setPanelPosition(panelMesh, gripMesh, this.x + (this.width - this.grip_height * state.unitWidth) * this.progress, this.y, 0.11);
			}
			scene.add(line);
			scene.add(gripMesh);
		}
	};

	controls.Treadmill = function() {
		controls.Object.apply(this, arguments);
		this.applyDefaults();
	};

	controls.Treadmill.prototype = {
		applyDefaults: function() {
			var defaultOptions = {
				x: false,
				y: false,
				rotate: false,
				zoom: false,
				zoomIn: false,
				zoomOut: false
			};

			this.options = this.options || {};
			for (var key in defaultOptions) {
				this.options[key] = this.options[key] || defaultOptions[key];
			}
		},
		available: true,
		max_fingers: 2,//Could modify later to handle more

		state: {
			x: 0,
			y: 0,
			angle: 0,
			zoom: 1
		},
		startState: {
			x: 0,
			y: 0,
			angle: 0,
			zoom: 1
		},
		grabInfo: {
			x: 0,
			y: 0,
			angle: 0,
			zoom: 1
		},
		points: {},
		cloneState: function(state) {
			return {
				x: state.x,
				y: state.y,
				angle: state.angle,
				zoom: state.zoom,
			};
		},
		contains: function(x, y) {
			return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
		},
		onRelease_callback: function(x, y, angle, zoom) {},
		onRelease: function(callback) {
			this.onRelease_callback = callback;
		},
		release: function(x, y, i) {
			this.onRelease_callback(this.state.x, this.state.y, this.state.angle, this.state.zoom);
			this.available = true;
			this.startState = {
				x: this.state.x,
				y: this.state.y,
				angle: this.state.angle,
				zoom: this.state.zoom
			};
			delete this.points[i];
			this.setGrabInfo();
		},
		getTouchAngle: function() {
			if (Object.keys(this.points).length < 2) {
				return 0;
			} else if (this.points[0] != undefined && this.points[1] != undefined){
				return Math.atan2(this.points[0].x - this.points[1].x, this.points[0].y - this.points[1].y);
			}
			return 0;
		},
		getTouchCenter: function() {
			var x = 0;
			var y = 0;

			for (i in this.points) {
				if (this.points[i] != undefined) {
					x += this.points[i].x;
					y += this.points[i].y;
				}
			}
			return {
				x: x/Math.max(1, Object.keys(this.points).length),
				y: y/Math.max(1, Object.keys(this.points).length)		
			};
		},
		getTouchSeparation: function() {
			if (Object.keys(this.points).length < 2) {
				return 1;
			} else if (this.points[0] != undefined && this.points[1] != undefined) {
				return util.distance(this.points[0], this.points[1]);
			}
		},
		setGrabInfo: function() {
			var center = this.getTouchCenter();
			this.grabInfo = {
				x: center.x,
				y: center.y,
				angle: this.getTouchAngle(),
				zoom: this.getTouchSeparation()
			};
		},
		registerPoint: function(point) {
			this.startState = this.cloneState(this.state);
			this.points[point.i] = point;
			this.setGrabInfo();
			point.onRelease(this.release.bind(this));
			point.onMove(this.move.bind(this));
			if (Object.keys(this.points).length >= this.max_fingers)
				this.available = false;
		},
		getNewState: function() {
			var newState = this.cloneState(this.startState);
			if (this.options.rotate) {
				newState.angle = this.startState.angle + this.getTouchAngle() - this.grabInfo.angle;
			}
			var disp = util.vector(this.getTouchCenter(), this.grabInfo);
			if (this.options.x) {
				newState.x = this.startState.x + disp.x * Math.cos(newState.angle) - disp.y * Math.sin(newState.angle);
			}
			if (this.options.y) {
				newState.y = this.startState.y + disp.x * Math.sin(newState.angle) + disp.y * Math.cos(newState.angle);
			}
			if (this.options.zoom || 
				(this.options.zoomIn && this.grabInfo.zoom > this.getTouchSeparation()) ||
				(this.options.zoomOut && this.grabInfo.zoom < this.getTouchSeparation())) {
				newState.zoom = this.startState.zoom * this.grabInfo.zoom / this.getTouchSeparation();
			}
			return newState;
		},
		onMove_callback: function(x, y, angle, zoom) {},
		onMove: function(callback) {
			this.onMove_callback = callback;
		},
		move: function(x, y, angle, zoom) {
			this.state = this.getNewState();
			this.onMove_callback(this.state.x, this.state.y, this.state.angle, this.state.zoom);
		},
		draw: function(scene, panelMesh) {
			var material = new THREE.MeshBasicMaterial({color: 0x222222});
			treadMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.width, this.height),
				material);
			util.setPanelPosition(panelMesh, treadMesh, this.x, this.y, 0.1);
			scene.add(treadMesh);

			//Draw Lines to show movement
			//start with vertical lines. Ideally would draw only what is needed. Use modulus.

			//Shift then rotate?

			//Line is a point and a direction. Write function to take it in along with bounds to crop.
		}
	};

	controls.Label = function() {
		controls.Object.apply(this, arguments);
		this.applyDefaults();
	};

	controls.Label.prototype = {
		available: false,
		applyDefaults: function() {
			var defaultOptions = {
				text: '',
				px: 30
			};
			this.options = this.options || {};
			for (var key in defaultOptions) {
				this.options[key] = this.options[key] || defaultOptions[key];
			}
		},
		contains: function(x, y) {
			return false;
		},
		draw: function(scene, panelMesh) {
			var material = new THREE.MeshBasicMaterial({color: 0x222222});

			buttonMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.width, this.height), material);

			util.setPanelPosition(panelMesh, buttonMesh, this.x, this.y, 0.1);

			scene.add(buttonMesh);
			
			var canvas1 = document.createElement('canvas');
			canvas1.height = this.options.px;
			canvas1.width = 100;
	        var context1 = canvas1.getContext('2d');
	        context1.font = "Bold " + this.options.px + "px Arial";
	        context1.fillStyle = "rgba(255,255,255,0.95)";
		    context1.fillText(this.options.text, 0, this.options.px);
	        var texture1 = new THREE.Texture(canvas1) 
	        texture1.needsUpdate = true;
		    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
		    material1.transparent = true;
		    var textmesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material1);
		    
		    util.setPanelPosition(panelMesh, textmesh, this.x, this.y, 0.2);
	        scene.add(textmesh);
		}
	};

	controls.Keyboard = function() {
		controls.Object.apply(this, arguments);
		this.applyDefaults();
	};

	controls.Keyboard.prototype = {
		available: true,
		applyDefaults: function() {
			var defaultOptions = {};

			this.options = this.options || {};
			for (var key in defaultOptions) {
				this.options[key] = this.options[key] || defaultOptions[key];
			}
		},
		contains: function(x, y) {
			return false;
		},
		draw: function(scene, panelMesh) {
			var material = new THREE.MeshBasicMaterial({color: 0x222222});

			buttonMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.width, this.height),
				material);

			util.setPanelPosition(panelMesh, buttonMesh, this.x, this.y, 0.1);

		}
	};

	controls.Joystick = function() {
		controls.Object.apply(this, arguments);
		this.applyDefaults();
	};

	controls.Joystick.prototype = {
		applyDefaults: function() {
			if (this.options.radius != undefined) {
				this.max_drag = this.options.radius * state.unitWidth;
			} else {
				this.max_drag = 1/4;
			}

			var defaultOptions = {
				returnsToCenter: true
			};

			this.options = this.options || {};
			for (var key in defaultOptions) {
				this.options[key] = this.options[key] || defaultOptions[key];
			}
			this.initGrab = {
				x: 0,
				y: 0
			};
		},		
		radius: 0.04,
		available: true,
		point: undefined,
		contains: function(x, y) {
			//handle not alway going back to center
			return Math.sqrt(Math.pow(x - this.x,2) + Math.pow((y - this.y) / eccentricity,2)) < this.radius;
		},
		release: function(x, y) {
			this.available = true;
			this.onRelease_callback(x - this.x, y - this.y);
			this.point = undefined;
		},
		onRelease_callback: function(x, y) {},
		onRelease: function(callback) {
			this.onRelease_callback = callback;
		},
		onMove_callback: function(x, y) {},
		move: function(x, y){
			var scaling_factor_x = 1;
			var scaling_factor_y = 1;
			x_shift = this.point.x - this.initGrab.x;
			y_shift = this.point.y - this.initGrab.y;
			var dist = util.length({x:(this.point.x - this.x), y:(this.point.y - this.y) / eccentricity});
			if (dist > this.max_drag) {
				scaling_factor_x = this.max_drag / dist;
				scaling_factor_y = this.max_drag / dist;
			}
			this.onMove_callback(x_shift * scaling_factor_x, y_shift * scaling_factor_y);
		},
		onMove: function(callback) {
			this.onMove_callback = callback;
		},
		registerPoint: function(point) {
			this.initGrab.x = point.x;
			this.initGrab.y = point.y;
			this.point = point;
			point.onRelease(this.release.bind(this));
			point.onMove(this.move.bind(this));
			this.available = false;
		},
		dragDistance: function() {
			if(this.point != undefined) {
				return util.distance(this.point, this.initGrab);
			}
			return 0;
		},
		draw: function(scene, panelMesh) {
			var grab = util.makeFullCircle(this.radius);
			
			var x_shift = 0;
			var y_shift = 0;
			var scaling_factor_x = 1;
			var scaling_factor_y = 1;
			if(this.point != undefined) {
				x_shift = this.point.x - this.initGrab.x;
				y_shift = this.point.y - this.initGrab.y;
				var dist = util.length({x:(this.point.x - this.x), y:(this.point.y - this.y) / eccentricity});
				if (dist > this.max_drag) {
					scaling_factor_x = this.max_drag / dist;
					scaling_factor_y = this.max_drag / dist;
				}
			}

			util.setPanelPosition(panelMesh, grab, this.x + x_shift * scaling_factor_x, this.y + y_shift * scaling_factor_y, 0.12);

			scene.add(grab);
		}
	};

	//Panel is an 8 x 12 grid
	controls.Panel = function() {
	//	this.objects = [state.topBar];
		this.add = function(object){
			this.objects.push(object);
		};
		this.set = function(array){
			this.objects = array;
	//		this.objects.push(state.topBar);
		};
	};

	state.topBar = {
		x: 0,
		y: 1 - state.unitHeight,
		width: 1,
		height: state.unitHeight,
		buttonPosition: {
			'inClose': 0 * state.unitWidth,
			'inNotifications': 1 * state.unitWidth,
			'inAppSwitch': 10 * state.unitWidth,
			'inMaxMin': 11 * state.unitWidth
		},
		initGrab: {
			x: 0,
			y: 0
		},
		available: true,
		point: undefined,
		buttonSelected: undefined,
		contains: function(x, y) {
			var which = this.whichButton(x, y);
			return which != 'none';
		},
		moving: false,
		threshold_distance: 0.1,
		whichButton: function(x,y) {
			if (state.hidden) {
				return 'hideBar';
			} else {
				if (y > this.y) {
					if (x > 2 * state.unitWidth && x < 10 * state.unitWidth) {
						return 'hideBar';
					}
					for (option in this.buttonPosition) {
						if (x > this.buttonPosition[option] && x < this.buttonPosition[option] + state.unitWidth) {
							switch (option) {
								case 'inClose':
									if (state.getPanelApp()) {
										return option;
									}
									break;
								case 'inNotifications':
									return option;
									break;
								case 'inAppSwitch':
									return option;
									break;
								case 'inMaxMin':
									if (state.canMinimize() || state.canMaximize()) {
										return option;
									}
									break;
							}
						}
					}
				}
				return 'none';
			}
		},
		dragDistance: function() {
			if(this.point != undefined) {
				return util.distance(this.point, this.initGrab);
			}
			return 0;
		},
		release: function(x, y) {
			//if far enough, click.
			if (this.buttonPosition[this.buttonSelected] != undefined && this.dragDistance() > this.threshold_distance) {
				this.click(this.buttonSelected);
			} else if (this.buttonSelected == 'hideBar') {
				if (y > 0.5) {
					state.hidden = false;
				} else {
					state.hidden = true;
				}
			}
			this.available = true;
			this.point = undefined;
			this.moving = false;
			this.buttonSelected = 'none';
		},
		click: function(buttonName){
			switch(buttonName) {
				case 'inClose':
					if (state.mode == state.modes.Normal) {
						state.close();
					} else {
						state.mode = state.modes.Normal;
					}
					break;
				case 'inNotifications':
					state.mode = state.modes.Notifications;
					break;
				case 'inAppSwitch':
					state.mode = state.modes.AppSwitch;
					break;
				case 'inMaxMin':
					state.toggleMaxMin();
					break;
			}
		},
		dragDistance: function() {
			if(this.point != undefined) {
				return util.distance(this.point, this.initGrab);
			}
			return 0;
		},
		registerPoint: function(point) {
			this.initGrab.x = point.x;
			this.initGrab.y = point.y;
			this.buttonSelected = this.whichButton(point.x, point.y);
			if (this.buttonSelected == 'hideBar') {
				this.moving = true;
			}
			this.point = point;
			point.onRelease(this.release.bind(this));
			this.available = false;
		},
		draw: function(scene, board) {
			var distance = this.dragDistance(util);
			var percentClicked = Math.min(distance/this.threshold_distance, 1);

			if (!state.hidden || this.buttonSelected == 'hideBar') {
				var barMaterial = new THREE.MeshBasicMaterial({color: 0x00CC00});

				var barMesh = new THREE.Mesh(
					new THREE.PlaneGeometry(this.width, this.height), barMaterial);
				
				var adjusted_y = this.y;
				if (state.hidden) {
					adjusted_y = 0;
					if (this.point != undefined) {
						adjusted_y = this.point.y - this.initGrab.y;
					}
				} else {
					if (this.point != undefined && this.buttonSelected == 'hideBar') {
						adjusted_y = this.y + (this.point.y - this.initGrab.y);
					}
				}

				util.setPanelPosition(board, barMesh, this.x, adjusted_y, 0.1);
				scene.add(barMesh);

				if (this.buttonSelected != 'none' && this.buttonSelected != 'hideBar') {
					//change color based on distance
					util.setPanelPosition(board, barMesh, this.x, adjusted_y, 0.1);
					var materialOptions = {color: 0x00CC00};
					if (this.point != null) {
						materialOptions.color = (0 << 16) + (200 * (1 - percentClicked) << 8) + percentClicked * 255;
					}

					var buttonMaterial = new THREE.MeshBasicMaterial(materialOptions);
					var buttonMesh = new THREE.Mesh(
						new THREE.PlaneGeometry(state.unitWidth, state.unitHeight), buttonMaterial);

					util.setPanelPosition(board, buttonMesh, this.x + this.buttonPosition[this.buttonSelected], adjusted_y, 0.11);
					scene.add(buttonMesh);
				}

				if (state.mode == state.modes.Normal) {
					var closeMesh = util.makeText(' X', 30, state.unitWidth, state.unitHeight);
					util.setPanelPosition(board, closeMesh, this.x + this.buttonPosition['inClose'], adjusted_y, 0.12);
					scene.add(closeMesh);

					if (state.canMaximize()) {
						var maxMinMesh = util.makeText(' +', 30, state.unitWidth, state.unitHeight);
						util.setPanelPosition(board, maxMinMesh, this.x + this.buttonPosition['inMaxMin'], adjusted_y, 0.12);
						scene.add(maxMinMesh);
					} else if (state.canMinimize()) {
						var maxMinMesh = util.makeText(' -', 30, state.unitWidth, state.unitHeight);
						util.setPanelPosition(board, maxMinMesh, this.x + this.buttonPosition['inMaxMin'], adjusted_y, 0.12);
						scene.add(maxMinMesh);
					}
				} else {
					if (state.getPanelApp() != null) {
						var maxMinMesh = util.makeText(' <', 30, state.unitWidth, state.unitHeight);
						util.setPanelPosition(board, maxMinMesh, this.x + this.buttonPosition['inClose'], adjusted_y, 0.12);
						scene.add(maxMinMesh);
					}
				}

				var notificationText = ' !';
				var notifyMesh = util.makeText(notificationText, 30, state.unitWidth, state.unitHeight);
				util.setPanelPosition(board, notifyMesh, this.x + this.buttonPosition['inNotifications'], adjusted_y, 0.12);
				scene.add(notifyMesh);

				var appSwitchText = '<->';
				var appSwitchMesh = util.makeText(appSwitchText, 30, state.unitWidth, state.unitHeight);
				util.setPanelPosition(board, appSwitchMesh, this.x + this.buttonPosition['inAppSwitch'], adjusted_y, 0.12);
				scene.add(appSwitchMesh);

				var title = '';
				if (state.mode == state.modes.Normal && state.getPanelApp() != null) {
					title = state.getPanelApp().name;
				} else if (state.mode == state.modes.AppSwitch) {
					title = 'App Switcher';
				} else if (state.mode == state.modes.Notifications) {
					title = 'Notifications';
				}

				var titleMesh = util.makeText(title, 30, state.unitWidth*8, state.unitHeight);
				util.setPanelPosition(board, titleMesh, 2 * state.unitWidth, adjusted_y, 0.12);
				scene.add(titleMesh);
			}
		}
	};

	return controls;
}

},{}],3:[function(require,module,exports){
var deviceInputs = exports;

var MOUSE_SPEED = 0.005;
var USE_TRACKER = false;

deviceInputs.setUp = function(state, util) {
  var bridge = new OculusBridge({
      "onConnect" : function() { 
          //console.log("we are connected!");
      },
      "onDisconnect" : function() {
          //console.log("good bye Oculus.");
      },
      "onOrientationUpdate" : function(quatValues) {
          HMDRotation.x = quatValues.x;
          HMDRotation.y = quatValues.y;
          HMDRotation.z = quatValues.z;
          HMDRotation.w = quatValues.w;
          state.lastUpdate = Date.now();
      }
  });

  bridge.connect();

  document.addEventListener("keydown", function(e) {
    if (e.keyCode == 32) {
      util.toggleFullScreen();
    }
  }, false);

  // Mouse
  // ---------------------------------------
  var viewer = $('#viewer'),
      mouseButtonDown = false,
      lastClientX = 0,
      lastClientY = 0;

  viewer.mousedown(function(event) {
    mouseButtonDown = true;
    lastClientX = event.clientX;
    lastClientY = event.clientY;
  });

  $(document).mouseup(function() {
    mouseButtonDown = false;
  });

  viewer.mousemove(function(event) {
    if (mouseButtonDown) {
      var enableX = (USE_TRACKER || state.vr !== null) ? 0 : 1;
      state.BaseRotationEuler.set(
        util.angleRangeRad(state.BaseRotationEuler.x + (event.clientY - lastClientY) * MOUSE_SPEED * enableX),
        util.angleRangeRad(state.BaseRotationEuler.y + (event.clientX - lastClientX) * MOUSE_SPEED),
        0.0
      );
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      state.BaseRotation.setFromEuler(state.BaseRotationEuler, 'YZX');
    }
  });
};

},{}],4:[function(require,module,exports){
var display = exports;
display.start = function(state, util, controls) {

	var VIEW_ANGLE = 45,
	  ASPECT = state.width / state.height,
	  NEAR = 0.1,
	  FAR = 10000;

	var $viewer = $('#viewer');

	state.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

	state.camera.rotation.x = Math.PI/2;
	state.camera.position.y = -200;
	state.camera.position.z = 10;
	state.camera.useQuaternion = true;

	try {
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	}
	catch(e){
		alert('This application needs WebGL enabled!');
		return false;
	}
	
	renderer.autoClearColor = true;
	renderer.setSize(state.width, state.height);
	$viewer.append(renderer.domElement);

	var pointLight = new THREE.PointLight(0xFFFFFF);

	pointLight.position.x = 50;
	pointLight.position.y = 50;
	pointLight.position.z = 300;

	var directLight = new THREE.DirectionalLight(0xFFFFFF);

	directLight.position.x = 0;
	directLight.position.y = 0;
	directLight.position.z = 1;

	//var QUALITY = 3;
	//var DEFAULT_LOCATION = { lat:44.301945982379095,  lng:9.211585521697998 };
	//var WEBSOCKET_ADDR = "ws://127.0.0.1:1981";
	var USE_TRACKER = false;
	//var MOUSE_SPEED = 0.005;
	//var KEYBOARD_SPEED = 0.02;
	//var GAMEPAD_SPEED = 0.04;
	//var DEADZONE = 0.2;
	//var SHOW_SETTINGS = true;
	//var NAV_DELTA = 45;
	//var USE_DEPTH = true;
	var WORLD_FACTOR = 1.0;
	var OculusRift = {
	  // Parameters from the Oculus Rift DK1
	  hResolution: 1280,
	  vResolution: 800,
	  hScreenSize: 0.14976,
	  vScreenSize: 0.0936,
	  interpupillaryDistance: 0.064,
	  lensSeparationDistance: 0.064,
	  eyeToScreenDistance: 0.041,
	  distortionK : [1.0, 0.22, 0.24, 0.0],
	  chromaAbParameter: [ 0.996, -0.004, 1.014, 0.0]
	};


	var currHeading = 0;
	var centerHeading = 0;
	var navList = [];

	var headingVector = new THREE.Vector3();
	var moveVector = new THREE.Vector3();
	var keyboardMoveVector = new THREE.Vector3();
	var HMDRotation = new THREE.Quaternion();
//	var BaseRotation = new THREE.Quaternion();
//	var BaseRotationEuler = new THREE.Vector3();

	
	// Set the window resolution of the rift in case of not native
	OculusRift.hResolution = state.width;
	OculusRift.vResolution = state.height;

	effect = new THREE.OculusRiftEffect( renderer, {HMD:OculusRift, worldFactor:WORLD_FACTOR} );
	effect.setSize(state.width, state.height );

	function resize( event ) {
	  state.width = window.innerWidth;
	  state.height = window.innerHeight;
	  setUiSize();

	  OculusRift.hResolution = state.width,
	  OculusRift.vResolution = state.height,
	  effect.setHMD(OculusRift);

	  renderer.setSize( state.width, state.height );
	  state.camera.projectionMatrix.makePerspective( VIEW_ANGLE, ASPECT, NEAR, FAR );
	}
	  window.addEventListener( 'resize', resize, false );

	function setUiSize() {
	  var width = window.innerWidth, hwidth = width/2,
	      height = window.innerHeight;
	}

	var projGeo = new THREE.SphereGeometry( 5000, 512, 256 );
	var projMaterial = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('static/placeholder.png'), side: THREE.DoubleSide});

	var wasUsingRift = false;

	var render = function() {

		requestAnimationFrame( render );

		// Compute move vector
		moveVector.add(keyboardMoveVector);//, gamepadMoveVector);

		// Disable X movement HMD tracking is enabled
		if (USE_TRACKER || state.vr !== null) {
			moveVector.x = 0;
		}

		// Apply movement
		state.BaseRotationEuler.set( 0.0, util.angleRangeRad(state.BaseRotationEuler.y + moveVector.y), 0.0 );
		state.BaseRotation.setFromEuler(state.BaseRotationEuler, 'YZX');

		var matr = new THREE.Matrix4();
		matr.makeRotationFromQuaternion(state.BaseRotation);

		var tilt = new THREE.Matrix4();
		tilt.makeRotationX(Math.PI/2);
		matr.multiplyMatrices(tilt, matr);
		state.BaseRotation.setFromRotationMatrix(matr);

		//Use quarternion variable for HMDRotation
		var adjustedHMDQuarternion = new THREE.Quaternion();
		adjustedHMDQuarternion.x = HMDRotation.x;
		adjustedHMDQuarternion.y = HMDRotation.y;
		adjustedHMDQuarternion.z = HMDRotation.z;
		adjustedHMDQuarternion.w = HMDRotation.w;

		var matr2 = new THREE.Matrix4();
		matr2.makeRotationFromQuaternion(adjustedHMDQuarternion);

		var tilt2 = new THREE.Matrix4();
		tilt2.makeRotationX(0*Math.PI/2);
		matr2.multiplyMatrices(tilt2, matr2);
		adjustedHMDQuarternion.setFromRotationMatrix(matr2);

		// Update camera rotation
		state.camera.quaternion.multiplyQuaternions(state.BaseRotation, adjustedHMDQuarternion);

		// Compute heading
		headingVector.setEulerFromQuaternion(state.camera.quaternion, 'YZX');
		currHeading = util.angleRangeDeg(THREE.Math.radToDeg(-headingVector.y));

		scene = new THREE.Scene();

		if(state.front_and_back != null) {
			(function() {
				state.front_and_back.external.drawImmersive(scene);
			})();
		} else {
			if (state.front != null) {
				(function() {
					//debugger;
					state.front.external.drawContained(scene);
				})();
			}
			if (state.back != null) {
				(function() {
					state.back.external.drawImmersiveBackground(scene);
				})();
			}
		}
		state.drawPanel(scene, util);

		scene.add(state.camera);
		scene.add(directLight);

		//renderer.clear();
		if (Date.now() - state.lastUpdate < 100) {
		  effect.render(scene, state.camera);
		  wasUsingRift = true;
		} else {
		  HMDRotation.x = 0;
		  HMDRotation.y = 0;
		  HMDRotation.z = 0;
		  HMDRotation.w = 1;
		  if (wasUsingRift) {
		    state.BaseRotationEuler.y = 0;
		  }
		  renderer.setViewport(0, 0, state.width, state.height);
		  renderer.render(scene, state.camera);
		  wasUsingRift = false;
		}
	};

  setUiSize();
  render();
};

},{}],5:[function(require,module,exports){
$(document).ready(function() {
	var state = require('./state');
	var util = require('./util');
	var controls = require('./controls').setUp(state, util);

	require('./remoteController').setUp(state, util);
	require('./deviceInputs').setUp(state, util);
	require('./appSwitcher').setUp(state, util, controls);
	require('./params').check(state, util, controls);
	require('./display').start(state, util, controls);
});

},{"./appSwitcher":1,"./controls":2,"./deviceInputs":3,"./display":4,"./params":6,"./remoteController":7,"./state":8,"./util":9}],6:[function(require,module,exports){
var params = exports;

params.check = function(state, util, controls) {
  var params = {};
  var items = window.location.search.substring(1).split("&");
  for (var i=0; i<items.length; i++) {
    var kvpair = items[i].split("=");
    params[kvpair[0]] = unescape(kvpair[1]);
  }

  state.mode = state.modes.AppSwitch;
  recentApps.map(function(appID) {
    $.get('/appInfo?app_id=' + appID, function(data){
      (function(state, controls, data){
        window.module = {};
        window.module.exports = {};
        window.exports = window.module.exports;
        window.Controls = controls;
        $.getScript(data.url, function() {
          //eval(data.contents);
          //console.log(data);
          var app = window.module.exports;
          if (app != undefined) {
            state.add(app, controls);
          } else {
            console.log('App from ' + data.url + ' Failed To Load');
          }
        });
      })(state, controls, data);
    });
  });

  (function(state, controls, appQueryURL){
    window.module = {};
    window.module.exports = {};
    window.exports = window.module.exports;
    window.Controls = controls;
    $.getScript(appQueryURL, function() {
      //eval(data.contents);
      var app = window.module.exports;
      if (app != undefined) {
        state.open(state.add(app, controls));
      } else {
        console.log('App from ' + appQueryURL + ' Failed To Load');
      }
    });
  })(state, controls, appQueryURL);
};

},{}],7:[function(require,module,exports){
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
			window.location = "/";
		}
	});

	socket.emit('declare-type', {
		type: 'output',
		session_id: sessionId
	});

	socket.on('error', function(result) {
		if (sessionId != 'debug') {
			window.location = "/";
		}
	});

	socket.on('size', function (data) {
		state.deviceDimensions = {
			width: JSON.parse(data).width,
			height: JSON.parse(data).height
		};
	});

	socket.on('quarternion', function (data) {
		state.quarternion = JSON.parse(data);
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
},{}],8:[function(require,module,exports){
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
		if (app.external.drawFront != null) {
			//if front and back app has back, push to back
			if (state.front_and_back != null && state.front_and_back.external.drawBack != null) {
				state.back = state.front_and_back;
			}
			state.front_and_back = null;
			state.front = app;
		} else if(app.external.drawFrontAndBack) {
			state.front = null;
			state.back = null;
			state.front_and_back = app;
		} else if(app.external.drawBack) {
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
		userID: '1'
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
	return state.front != null && state.front.external.drawFrontAndBack != null;
};

state.canMinimize = function() {
	return state.front_and_back != null && state.front_and_back.external.drawFront != null;
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
		if (state.back != null && state.back.external.drawFrontAndBack != null) {
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

},{}],9:[function(require,module,exports){
var util = exports;

var eccentricity = 80/30;
util.makeCircle = function(amplitude) {
	var circle_resolution = 40;
	var greenLine = new THREE.LineBasicMaterial({color: 0x999999});
	var circle_geometry = new THREE.Geometry();
	for(var j = 0; j <= circle_resolution; j++) {
		var theta = (j / circle_resolution) * Math.PI * 2;
		circle_geometry.vertices.push( new THREE.Vector3(amplitude * Math.cos(theta), amplitude * Math.sin(theta)* eccentricity, 0));
	}
	return new THREE.Line(circle_geometry, greenLine);
};

util.makeFullCircle = function(amplitude) {

	var circle_resolution = 40;
	var green = new THREE.LineBasicMaterial({color: 0x333333});
	var circle = new THREE.Shape();

	for(var j = 0; j <= circle_resolution; j++) {
		var theta = (j / circle_resolution) * Math.PI * 2;
		var x = amplitude * Math.cos(theta);
		var y = amplitude * Math.sin(theta) * eccentricity;
		if (j== 0) {
		    circle.moveTo(x, y);
		} else {
		    circle.lineTo(x, y);
		}
	}

	var geometry = circle.makeGeometry();
	return new THREE.Mesh(geometry, green);
};

util.makeText = function(text, px, width, height) {
	var canvas1 = document.createElement('canvas');
	canvas1.height = px + 10;
	canvas1.width = width * 700;
    var context1 = canvas1.getContext('2d');
    context1.font = "Bold " + px + "px Arial";
    context1.fillStyle = "rgba(255,255,255,0.95)";
    context1.fillText(" " + text, 0, px);
    var texture1 = new THREE.Texture(canvas1) 
    texture1.needsUpdate = true;
    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side: THREE.DoubleSide } );
    material1.transparent = true;
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material1);
};


util.setPanelPosition = function(board, Mesh, x_disp, y_disp, z_disp){
	var width = 0,
		height = 0;
	if (Mesh.geometry.width) {
		width = Mesh.geometry.width * board.geometry.width;
	}
	if (Mesh.geometry.height) {
		height = Mesh.geometry.height * board.geometry.height;
	}
	Mesh.scale.x = board.geometry.width;
	Mesh.scale.y = board.geometry.height;
	
	var adjusted_x_disp = board.geometry.width * (x_disp - 0.5) + width/2;
	var adjusted_y_disp = board.geometry.height * (y_disp - 0.5) + height/2;

	Mesh.position.x = board.position.x + adjusted_x_disp;
	Mesh.position.y = board.position.y + adjusted_y_disp * Math.cos(board.rotation.x) - z_disp * Math.sin(board.rotation.x);
	Mesh.position.z = board.position.z + adjusted_y_disp * Math.sin(board.rotation.x) + z_disp * Math.cos(board.rotation.x);

	Mesh.rotation.x = board.rotation.x;
};

util.rectContains = function(point, x, y, width, height) {
	return point.x > x && point.x < x + width && point.y > y && point.y < y + height;
};

util.vector = function(a, b) {
	return {x: b.x-a.x, y: b.y-a.y};
};

util.dot = function(a, b) {
	return a.x*b.x+a.y*b.y;
};

util.length = function(a) {
	return Math.sqrt(a.x*a.x+a.y*a.y);
};

util.distance = function(a, b) {
	return util.length(util.vector(a,b));
};

util.angle = function(a, b) {
	return Math.acos(util.dot(a,b)/(util.length(a)*util.length(b)));
};

util.rotate = function(a, theta) {
	return {
		x: a.x * Math.cos(theta) - a.y * Math.sin(theta),
		y: a.x * Math.sin(theta) + a.y * Math.cos(theta)
	};
};

util.add = function(a, b) {
	return {
		x: a.x+b.x, 
		y: a.y+b.y
	};
};

util.scale = function(a, x_scale, y_scale) {
	return {
		x: a.x*x_scale,
		y: a.y*y_scale
	};
};

util.angleRangeDeg = function(angle) {
  angle %= 360;
  if (angle < 0) angle += 360;
  return angle;
};

util.angleRangeRad = function(angle) {
  angle %= 2*Math.PI;
  if (angle < 0) angle += 2*Math.PI;
  return angle;
};

util.deltaAngleDeg = function(a,b) {
  return Math.min(360-(Math.abs(a-b)%360),Math.abs(a-b)%360);
};

util.toggleFullScreen = function() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
      (!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
};


},{}]},{},[5])