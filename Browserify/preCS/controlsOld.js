var eccentricity = 80/30;
if (exports == undefined) {
	var controlObjects = {};
	var exports = controlObjects;
}

exports.setUp = function(state, util) {
	var controls = {};


	controls.Object = function(x, y, width, height, options) {
		this.x = (x || 0) * state.unitWidth;
		this.y = (y || 0) * state.unitHeight;
		this.width = (width || 1) * state.unitWidth;
		this.height = (height || 1) * state.unitHeight;
		this.options = options || {};

		for (method in controls.Object.prototype) {
			this[method] = controls.Object.prototype[method];
		}
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
				text: '',
				toggle: false
			};

			this.options = this.options || {};
			for (var key in defaultOptions) {
				this.options[key] = this.options[key] || defaultOptions[key];
			}

			this.initGrab = {
				x: 0,
				y: 0
			};
			this.point = undefined;
			this.isOn = false;
		},
		available: true,
		contains: function(x, y) {
			return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
		},
		onClick_callback: function(isOn){},
		click: function(isOn){
			this.onClick_callback(isOn);
		},
		onClick: function(callback) {
			this.onClick_callback = callback;
		},
		release: function(x, y) {
			this.available = true;
			if (this.contains(this.point.x, this.point.y)) {
				this.click(!this.isOn);
				if (this.options.toggle) {
					this.isOn = !this.isOn;
				}
			}
			this.point = undefined;
		},
/*		dragDistance: function() {
			if(this.point != undefined) {
				return util.distance(this.point, this.initGrab);
			}
			return 0;
		},*/
		registerPoint: function(point) {
			this.initGrab.x = point.x;
			this.initGrab.y = point.y;
			this.point = point;
			point.onRelease(this.release.bind(this));
			this.available = false;
		},
		draw: function(scene, panelMesh) {
			//change color based on distance

			var materialOptions = {};

			if (this.isOn) {
				if (this.point != undefined) {
					if (this.contains(this.point.x, this.point.y)) {
						materialOptions.color = 200;
					} else {
						materialOptions.color = (100 << 16) + (100 << 8) + 100;
					}
				} else {
					materialOptions.color = (200 << 8);
				}
			} else {
				if (this.point != undefined) {
					if (this.contains(this.point.x, this.point.y)) {
						materialOptions.color = (200 << 8);
					} else {
						materialOptions.color = (100 << 16) + (100 << 8) + 100;
					}
				} else {
					materialOptions.color = 200;
				}
			}


			var material = new THREE.MeshBasicMaterial(materialOptions);

			buttonMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.width, this.height),
				material);

			util.setPanelPosition(panelMesh, buttonMesh, this.x, this.y, 0.1);

			scene.add(buttonMesh);

			var canvas1 = document.createElement('canvas');
			
			var px = this.options.text_size;
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

			if (this.point != undefined) {
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
			this.points[i] = undefined;
			this.setGrabInfo();
		},
		getTouchAngle: function() {
			if (this.getNumPoints() < 2) {
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
				if (this.points[i]) {
					x += this.points[i].x;
					y += this.points[i].y;
				}
			}
			return {
				x: x/Math.max(1, this.getNumPoints()),
				y: y/Math.max(1, this.getNumPoints())		
			};
		},
		getNumPoints: function() {
			var counter = 0;
			for (key in this.points) {
				counter += (this.points[key]) ? 1 : 0;
			}
			return counter;
		},
		getTouchSeparation: function() {
			if (this.getNumPoints() < 2) {
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
			if (this.getNumPoints() >= this.max_fingers)
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
				if (!newState.zoom) {
					debugger;
				}
			}
			return newState;
		},
		onMove_callback: function(x, y, angle, zoom) {},
		onMove: function(callback) {
			this.onMove_callback = callback;
		},
		move: function(x, y, i) {
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

			var textmesh = util.makeText(this.options.text, this.options.px, this.width, this.height);

			/*
			var canvas1 = document.createElement('canvas');
			canvas1.height = this.options.px;
			canvas1.width = this.options.px * this.width / this.height;
	        var context1 = canvas1.getContext('2d');
	        context1.font = "Bold " + this.options.px + "px Arial";
	        context1.fillStyle = "rgba(255,255,255,0.95)";
		    context1.fillText(this.options.text, 0, this.options.px);
	        var texture1 = new THREE.Texture(canvas1) 
	        texture1.needsUpdate = true;
		    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
		    material1.transparent = true;
		    var textmesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material1);
		    */
		    
		    util.setPanelPosition(panelMesh, textmesh, this.x, this.y, 0.2);
	        scene.add(textmesh);
		}
	};

	controls.Keyboard = function() {
		controls.Object.apply(this, arguments);
		this.applyDefaults();
	};

	//Number of cursors.. Do like android. Many cursors, one line.

	controls.Keyboard.prototype = {
		gestureThresholdDistance: 0.2,
		available: true,
		applyDefaults: function() {
			var defaultOptions = {
				startText: ''
			};

			this.points = [];
			this.text = '';
			this.gesturePoint = undefined;

			this.makeKeys();

			this.options = this.options || {};
			for (var key in defaultOptions) {
				this.options[key] = this.options[key] || defaultOptions[key];
			}
		},
		makeKey: function(char, x, y, width, height, apply) {
			keyboard = this;
			return {
				apply: apply,
				char: char,
				x: x,
				y: y,
				width: width,
				height: height,
				toString: function() {
					return this.char;
				},
				contains: function(x, y) {
					if (this.char == 'M') {
						//debugger;
						//console.log(util.rectContains(0.6510417, 0.2777778, 0.6466, 0.26071, 0.075, 0.17777))
						/*
						heigh: 0.17777777777777778
						keyx: 0.6466
						keyy: 0.2607111111111111
						letter: "M"
						wid: 0.075
						x: 0.6510417
						y: 0.2777778*/
/*
						console.log({
							x: x,
							y: y,
							keyx: this.x * keyboard.width + keyboard.x,
							keyy: this.y * keyboard.height + keyboard.y,
							wid: this.width * keyboard.width,
							heigh: this.height * keyboard.height,
							letter: this.char,
							bool: util.rectContains(x, y, 
							this.x * keyboard.width + keyboard.x, 
							this.y * keyboard.height + keyboard.y, 
							this.width * keyboard.width, this.height * keyboard.height)
						})*/
					}
					return util.rectContains({x: x, y: y}, 
						this.x * keyboard.width + keyboard.x, 
						this.y * keyboard.height + keyboard.y, 
						this.width * keyboard.width, this.height * keyboard.height);
				}
			}
		},
		initPoint: function(point) {
			var initKey = this.getKey(point.x, point.y);
			this.points[point.i] = {
				key: undefined,
				gesturing: false,
				trail: [],
				keyTrail: [],
				dragDist: function() {
					//should be total length
					if (this.initGrab)
						return util.distance(this, this.initGrab);
					else
						return 0;
				},
				update: function(x, y, key) {
					if (key && !this.initGrab) {
						this.initGrab = {
							x: x,
							y: y,
							key: key
						};
					}
					if (this.x != x || this.y != y) {
						this.x = x;
						this.y = y;
						this.trail.push({
							x: this.x, 
							y: this.y
						});
						if (this.key != key) {
							if (this.keyTrail.length != 0) {
								this.keyTrail[this.keyTrail.length - 1].trailEnd = this.trail.length;
							}
							if (key) {
								this.keyTrail.push({key: key, trailStart: this.trail.length});
							}
						}
						this.key = key;
					}
				}
			};
			this.points[point.i].update(point.x, point.y, initKey);
			if (initKey) {
				this.points[point.i].initGrab = {
					x: point.x,
					y: point.y,
					key: initKey
				};
			}
		},

		//this.x/1200, 1 - (this.y + this.height)/600, this.width/1200, this.height/600

/*
makeKeys: function() {
	this.keys = [
		this.makeKey('Q', 10, 10, 90, 120, function(text){ return text + 'Q';}),
		this.makeKey('W', 117, 10, 90, 120, function(text){ return text + 'W';}),
		this.makeKey('E', 224, 9, 90, 120, function(text){ return text + 'E';}),
		this.makeKey('R', 333, 9, 90, 120, function(text){ return text + 'R';}),
		this.makeKey('T', 440, 9, 90, 120, function(text){ return text + 'T';}),
		this.makeKey('Y', 548, 10, 90, 120, function(text){ return text + 'Y';}),
		this.makeKey('U', 656, 9, 90, 120, function(text){ return text + 'U';}),
		this.makeKey('I', 765, 9, 90, 120, function(text){ return text + 'I';}),
		this.makeKey('O', 872, 9, 90, 120, function(text){ return text + 'O';}),
		this.makeKey('P', 980, 10, 90, 120, function(text){ return text + 'P';}),
		this.makeKey('A', 62, 158, 90, 120, function(text){ return text + 'A';}),
		this.makeKey('S', 170, 158, 90, 120, function(text){ return text + 'S';}),
		this.makeKey('D', 279, 158, 90, 120, function(text){ return text + 'D';}),
		this.makeKey('F', 387, 158, 90, 120, function(text){ return text + 'F';}),
		this.makeKey('G', 494, 158, 90, 120, function(text){ return text + 'G';}),
		this.makeKey('H', 602, 158, 90, 120, function(text){ return text + 'H';}),
		this.makeKey('J', 710, 158, 90, 120, function(text){ return text + 'J';}),
		this.makeKey('K', 819, 156, 90, 120, function(text){ return text + 'K';}),
		this.makeKey('L', 927, 158, 90, 120, function(text){ return text + 'L';}),
		this.makeKey('Z', 128, 304, 90, 120, function(text){ return text + 'Z';}),
		this.makeKey('X', 236, 304, 90, 120, function(text){ return text + 'X';}),
		this.makeKey('C', 344, 304, 90, 120, function(text){ return text + 'C';}),
		this.makeKey('V', 452, 304, 90, 120, function(text){ return text + 'V';}),
		this.makeKey('B', 561, 304, 90, 120, function(text){ return text + 'B';}),
		this.makeKey('N', 669, 304, 90, 120, function(text){ return text + 'N';}),
		this.makeKey('M', 776, 304, 90, 120, function(text){ return text + 'M';}),
		this.makeKey('Space', 344, 453, 522, 120, function(text){ return text + ' ';}),
		this.makeKey('<-', 1086, 10, 100, 120, function(text){ return (text.length > 0) ? text.substring(0, text.length - 1) : text;})
	];
},
*/

		makeKeys: function() {
			this.keys = [
				this.makeKey('Q', 0.0083, 0.785, 0.075, 0.2, function(text){ return text + 'Q';}),
				this.makeKey('W', 0.0975, 0.785, 0.075, 0.2, function(text){ return text + 'W';}),
				this.makeKey('E', 0.1866, 0.785, 0.075, 0.2, function(text){ return text + 'E';}),
				this.makeKey('R', 0.2775, 0.785, 0.075, 0.2, function(text){ return text + 'R';}),
				this.makeKey('T', 0.3666, 0.785, 0.075, 0.2, function(text){ return text + 'T';}),
				this.makeKey('Y', 0.4566, 0.785, 0.075, 0.2, function(text){ return text + 'Y';}),
				this.makeKey('U', 0.5466, 0.785, 0.075, 0.2, function(text){ return text + 'U';}),
				this.makeKey('I', 0.6375, 0.785, 0.075, 0.2, function(text){ return text + 'I';}),
				this.makeKey('O', 0.7266, 0.785, 0.075, 0.2, function(text){ return text + 'O';}),
				this.makeKey('P', 0.8166, 0.785, 0.075, 0.2, function(text){ return text + 'P';}),
				this.makeKey('A', 0.0516, 0.5366, 0.075, 0.2, function(text){ return text + 'A';}),
				this.makeKey('S', 0.1416, 0.5366, 0.075, 0.2, function(text){ return text + 'S';}),
				this.makeKey('D', 0.2325, 0.5366, 0.075, 0.2, function(text){ return text + 'D';}),
				this.makeKey('F', 0.3225, 0.5366, 0.075, 0.2, function(text){ return text + 'F';}),
				this.makeKey('G', 0.4116, 0.5366, 0.075, 0.2, function(text){ return text + 'G';}),
				this.makeKey('H', 0.5016, 0.5366, 0.075, 0.2, function(text){ return text + 'H';}),
				this.makeKey('J', 0.5916, 0.5366, 0.075, 0.2, function(text){ return text + 'J';}),
				this.makeKey('K', 0.6825, 0.5366, 0.075, 0.2, function(text){ return text + 'K';}),
				this.makeKey('L', 0.7725, 0.5366, 0.075, 0.2, function(text){ return text + 'L';}),
				this.makeKey('Z', 0.1066, 0.2933, 0.075, 0.2, function(text){ return text + 'Z';}),
				this.makeKey('X', 0.1966, 0.2933, 0.075, 0.2, function(text){ return text + 'X';}),
				this.makeKey('C', 0.2866, 0.2933, 0.075, 0.2, function(text){ return text + 'C';}),
				this.makeKey('V', 0.3766, 0.2933, 0.075, 0.2, function(text){ return text + 'V';}),
				this.makeKey('B', 0.4675, 0.2933, 0.075, 0.2, function(text){ return text + 'B';}),
				this.makeKey('N', 0.5575, 0.2933, 0.075, 0.2, function(text){ return text + 'N';}),
				this.makeKey('M', 0.6466, 0.2933, 0.075, 0.2, function(text){ return text + 'M';}),
				this.makeKey('Space', 0.2866, 0.045, 0.435, 0.2, function(text){ return text + ' ';}),
				this.makeKey('<-', 0.905, 0.7833, 0.0833, 0.2, function(text){ return (text.length > 0) ? text.substring(0, text.length - 1) : text;})
			];
		},
		getKey: function(x, y) {
			for (var i in this.keys) {
				if (this.keys[i].contains(x, y)) {
					return this.keys[i];
				}
			}
		},
		contains: function(x, y) {
			return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
		},
		getText: function() {
			return this.options.text;
		},
		setText: function(text) {
			if (Object.prototype.toString.call(text) == '[object String]') //check if is string
				this.options.text = text;
			return this.options.text;
		},
		registerPoint: function(point) {
			this.initPoint(point);
			point.onRelease(this.release.bind(this));
			point.onMove(this.move.bind(this));
		},
		release: function(x, y, i) {
			if (this.gesturePoint == this.points[i]) {
				//Implement epic gesture algorithm, plain for now

				var keySequence = '';
				var curvatures = [];
				//console.log(this.gesturePoint.keyTrail);
				for (index in this.gesturePoint.keyTrail) {
					var trailStart = this.gesturePoint.keyTrail[index].trailStart;
					var trailEnd = this.gesturePoint.keyTrail[index].trailEnd;
					var segment = this.gesturePoint.trail.slice(trailStart, trailEnd);
					keySequence += this.gesturePoint.keyTrail[index].key.char;
					var data = segment.map(function(n){
						return [n.x, n.y];
					});
					curvatures.push(1/ss.r_squared(data, ss.linear_regression().data(data).line()));
				}
				//console.log(keySequence);
				//console.log(curvatures);

				//Find Possible Words

			    suggestions = util.get_suggestion(state, keySequence, curvatures);
			    console.log(suggestions);

			    var bestWord = '';
			    var bestScore = 0;
			    for (var i = 0; i < suggestions.length; i++) {
			    	if (suggestions[i].score > bestScore) {
			    		bestScore = suggestions[i].score;
			    		bestWord = suggestions[i].word;
			    	}
			    }

			    //console.log(bestWord);
			    this.text = this.text + ' ' + bestWord;
				//this.text = this.points[i].initGrab.key.apply(this.text);
				this.onTextUpdate_callback(this.text);
				this.gesturePoint = undefined;
			} else if (this.getKey(x,y)) {
				this.text = this.getKey(x,y).apply(this.text);
				this.onTextUpdate_callback(this.text);
			}

			console.log(this.text);
			this.points[i] = undefined;

			if (this.points.length == 0) {
				this.gesturePoint = undefined;
			}
		},
		move: function(x, y, i) {
			//console.log(this.getKey(x, y));
			this.points[i].update(x, y, this.getKey(x, y));
			if (!this.gesturePoint && this.points[i].dragDist() > this.gestureThresholdDistance) {
				this.gesturePoint = this.points[i];
				this.gesturePoint.gesturing = true;
			}
		},
		onTextUpdate_callback: function(text) {},
		onTextUpdate: function(callback) {
			this.onTextUpdate_callback = callback;
		},
		draw: function(scene, panelMesh) {
			var material = new THREE.MeshBasicMaterial({color: 0x222222});

/*			var progress = {};
			for (i in this.points) {
				if (this.points[i] && this.points[i].initGrab && this.points[i] != this.gesturePoint)
					progress[this.points[i].initGrab.key] = Math.min(this.points[i].dragDist()/this.thresholdDistance, 1);
			}*/

			var keyMaterialOptions;

			for (i in this.keys) {
				keyMaterialOptions = {color: 0x222222};
				/*if (progress[this.keys[i].char]) {
					keyMaterialOptions.color = (34 << 16) + (200 * 0 << 8) + (1 - progress[this.keys[i].char]) * 255;
				}*/

				var keyMaterial = new THREE.MeshBasicMaterial(keyMaterialOptions);
				keyMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.keys[i].width * this.width, this.keys[i].height * this.height), keyMaterial);
				util.setPanelPosition(panelMesh, keyMesh, this.keys[i].x * this.width + this.x, this.keys[i].y * this.height + this.y, 0.01);
				scene.add(keyMesh);

				//Draw The Letters
				var contentMesh = util.makeText(this.keys[i].char, 30, this.keys[i].width * this.width, this.keys[i].height * this.height);
			    util.setPanelPosition(panelMesh, contentMesh, this.keys[i].x * this.width + this.x, this.keys[i].y * this.height + this.y, 0.02);
		        scene.add( contentMesh );
			}

			if (this.gesturePoint) {
				var greyLine = new THREE.LineBasicMaterial({color: 0x999999, linewidth: 2, });
				var gestureGeometry = new THREE.Geometry();
				for (i in this.gesturePoint.trail) {
					gestureGeometry.vertices.push( new THREE.Vector3(this.gesturePoint.trail[i].x, this.gesturePoint.trail[i].y, 0));
				}
				var gestureLine = new THREE.Line(gestureGeometry, greyLine);
				util.setPanelPosition(panelMesh, gestureLine, this.x, this.y, 0.02);
				scene.add(gestureLine);
			}
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
		this.objects = [];
		this.add = function(object){
			this.objects.push(object);
		};
		this.set = function(array){
			this.objects = array;
		};
	};

	state.topBar = {
		x: 0,
		y: 1 - state.unitHeight,
		width: 1,
		height: state.unitHeight,
		buttonPosition: {
			'inClose': 0 * state.unitWidth,
			'inSettings': 1 * state.unitWidth,
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
								case 'inSettings':
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
			if (this.buttonPosition[this.buttonSelected] != undefined && 
				util.rectContains(this.point, this.buttonPosition[this.buttonSelected], this.y, 1, this.height)) {
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
				case 'inSettings':
					state.mode = state.modes.Settings;
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
					if (this.point != undefined) {
						if (util.rectContains(this.point, this.buttonPosition[this.buttonSelected], this.y, 1, this.height)) {
							materialOptions.color = 255;
						} else {
							materialOptions.color = (100 << 16) + (100 << 8) + 100;
						}
//						materialOptions.color = (0 << 16) + (200 * (1 - percentClicked) << 8) + percentClicked * 255;
					} else {
						materialOptions.color = 200 << 8;
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
					if (state.getPanelApp() != undefined) {
						var maxMinMesh = util.makeText(' <', 30, state.unitWidth, state.unitHeight);
						util.setPanelPosition(board, maxMinMesh, this.x + this.buttonPosition['inClose'], adjusted_y, 0.12);
						scene.add(maxMinMesh);
					}
				}

				var notificationText = ' *';
				var notifyMesh = util.makeText(notificationText, 30, state.unitWidth, state.unitHeight);
				util.setPanelPosition(board, notifyMesh, this.x + this.buttonPosition['inSettings'], adjusted_y, 0.12);
				scene.add(notifyMesh);

				var appSwitchText = '<->';
				var appSwitchMesh = util.makeText(appSwitchText, 30, state.unitWidth, state.unitHeight);
				util.setPanelPosition(board, appSwitchMesh, this.x + this.buttonPosition['inAppSwitch'], adjusted_y, 0.12);
				scene.add(appSwitchMesh);

				var title = '';
				if (state.mode == state.modes.Normal && state.getPanelApp() != undefined) {
					title = state.getPanelApp().name;
				} else if (state.mode == state.modes.AppSwitch) {
					title = 'App Switcher';
				} else if (state.mode == state.modes.Settings) {
					title = 'Settings';
				}

				var titleMesh = util.makeText(title, 30, state.unitWidth*8, state.unitHeight);
				util.setPanelPosition(board, titleMesh, 2 * state.unitWidth, adjusted_y, 0.12);
				scene.add(titleMesh);
			}
		}
	};

	return controls;
}
