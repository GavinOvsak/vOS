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
