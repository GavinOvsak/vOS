// ----- Utility Functions -------

var eccentricity = 80/30;
var makeCircle = function(amplitude) {
	var circle_resolution = 40;
	var greenLine = new THREE.LineBasicMaterial({color: 0x999999});
	var circle_geometry = new THREE.Geometry();
	for(var j = 0; j <= circle_resolution; j++) {
		var theta = (j / circle_resolution) * Math.PI * 2;
		circle_geometry.vertices.push( new THREE.Vector3(amplitude * Math.cos(theta), amplitude * Math.sin(theta)* eccentricity, 0));
	}
	return new THREE.Line(circle_geometry, greenLine);
};

var makeFullCircle = function(amplitude) {

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

var setKeyboardPosition = function(board, Mesh, x_disp, y_disp, z_disp){
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

var rectContains = function(point, x, y, width, height) {
	return point.x > x && point.x < x + width && point.y > y && point.y < y + height;
};

var vector = function(a, b) {
	return {x: b.x-a.x, y: b.y-a.y};
};

var dot = function(a, b) {
	return a.x*b.x+a.y*b.y;
};

var length = function(a) {
	return Math.sqrt(a.x*a.x+a.y*a.y);
};

var distance = function(a, b) {
	return length(vector(a,b));
};

var angle = function(a, b) {
	return Math.acos(dot(a,b)/(length(a)*length(b)));
};

var rotate = function(a, theta) {
	return {
		x: a.x * Math.cos(theta) - a.y * Math.sin(theta),
		y: a.x * Math.sin(theta) + a.y * Math.cos(theta)
	};
};

var add = function(a, b) {
	return {
		x: a.x+b.x, 
		y: a.y+b.y
	};
};

var scale = function(a, x_scale, y_scale) {
	return {
		x: a.x*x_scale,
		y: a.y*y_scale
	};
};

var VRK = {};

var makeText = function(text, px, width, height) {
	var canvas1 = document.createElement('canvas');
	canvas1.height = px+10;
	canvas1.width = width * 700;
    var context1 = canvas1.getContext('2d');
    context1.font = "Bold " + px + "px Arial";
    context1.fillStyle = "rgba(255,255,255,0.95)";
    context1.fillText(" " + text, 0, px);
    var texture1 = new THREE.Texture(canvas1) 
    texture1.needsUpdate = true;
    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
    material1.transparent = true;
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material1);
};


VRK.Object = function(x, y, width, height, options) {
	//has defaults
	options.text
	options.textSize
	options.image
	this.updateOptions = function(options) {

	};
	this.setX
	this.setY
	this.setWidth
	this.setHeight
};

VRK.Button = function(x, y, width, height, text, text_size, opt_image) {
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.text = text || '';
	this.image = opt_image;
	if (text_size != undefined) {
		this.px = text_size;
	} else {
		this.px = 30;
	}
	this.width = width * unitWidth;
	this.height = height * unitHeight;
	this.available = true;
	this.threshold_distance = 0.1;
	this.initGrab = {
		x: 0,
		y: 0
	};
	this.point = undefined;
	this.contains = function(x, y) {
		return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
	};
	this.onClick_callback = function(){};
	this.click = function(){
		this.onClick_callback();
	};
	this.onClick = function(callback) {
		this.onClick_callback = callback;
	};
	this.release = function(x, y) {
		if (this.dragDistance() > this.threshold_distance) {
			this.click();
		}
		this.available = true;
		this.point = undefined;
	};
	this.dragDistance = function() {
		if(this.point != undefined) {
			return distance(this.point, this.initGrab);
		}
		return 0;
	};
	this.registerPoint = function(point) {
		this.initGrab.x = point.x;
		this.initGrab.y = point.y;
		this.point = point;
		point.onRelease(this.release.bind(this));
		this.available = false;
	};
	this.draw = function(scene, board) {
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

		setKeyboardPosition(board, buttonMesh, this.x, this.y, 0.1);

		scene.add(buttonMesh);

		var canvas1 = document.createElement('canvas');
		
		if (this.text != '') {
			var contentMesh = makeText(this.text, this.px, this.width, this.height);
		    setKeyboardPosition(board, contentMesh, this.x, this.y, 0.2);
	        scene.add( contentMesh );
		} else if (this.image != undefined) {
	        canvas1.height = 200;
			canvas1.width = 200;
        	var context1 = canvas1.getContext('2d');
       		var texture1 = new THREE.Texture(canvas1) 
			var imageObj = new Image();
	        imageObj.src = this.image;
	        imageObj.onload = function()
	        {
	        	/*
	            context1.drawImage(imageObj, 0, 0);
	            if ( texture1 ) {
	                texture1.needsUpdate = true;
				    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
				    material1.transparent = true;
				    var contentMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material1);
				    setKeyboardPosition(board, contentMesh, this.x, this.y, 0.2);
			        scene.add( contentMesh );
			    }*/
	        };  
		}
	}
};

VRK.LinearSlider = function(x, y, width, height, returnsToCenter, direction, initProgress) {
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.width = width * unitWidth;
	this.height = height * unitHeight;
	this.direction = direction;
	if (this.direction == undefined) {
		this.direction = VRK.LinearSlider.direction.VERTICAL;
	}
	if (this.direction == VRK.LinearSlider.direction.VERTICAL) {
		this.line_width = 0.1 * unitWidth;
		this.grip_width = width * unitWidth;
		this.grip_height = 0.5 * unitHeight;
	} else if (this.direction == VRK.LinearSlider.direction.HORIZONTAL) {
		this.line_width = 0.1 * unitHeight;
		this.grip_width = height * unitHeight;
		this.grip_height = 0.5 * unitWidth;
	}

	if (initProgress != undefined) {
		this.progress = initProgress;
	} else {
		this.progress = 0.5;
	}

	this.returnsToCenter = returnsToCenter;

	this.initGrab = {
		x: 0,
		y: 0,
		progress: 0
	};

	this.available = true;
	this.point = undefined;
	this.getProgress = function() {
		if (this.point != null) {
			if (this.direction == VRK.LinearSlider.direction.VERTICAL) {
				this.progress = this.initGrab.progress + (this.point.y - this.initGrab.y)/(this.height - this.grip_height);
			} else if(this.direction == VRK.LinearSlider.direction.HORIZONTAL) {
				this.progress = this.initGrab.progress + (this.point.x - this.initGrab.x)/(this.width - this.grip_height);
			}
		}
		this.progress = Math.max(Math.min(this.progress, 1), 0);
		return this.progress;
	}
	this.contains = function(x, y) {
		if (this.direction == VRK.LinearSlider.direction.VERTICAL) {
			return x > this.x && x < this.x + this.grip_width && 
				y > this.y + (this.height - this.grip_height) * this.progress && 
				y < this.y + (this.height - this.grip_height) * this.progress + this.grip_height;
		} else if (this.direction == VRK.LinearSlider.direction.HORIZONTAL) {
			return y > this.y && y < this.y + this.grip_width && 
				x > this.x + (this.width - this.grip_height) * this.progress && 
				x < this.x + (this.width - this.grip_height) * this.progress + this.grip_height;
		}
	};
	this.onRelease_callback = function(progress) {};
	this.onRelease = function(callback) {
		this.onRelease_callback = callback;
	};
	this.setProgress = function(progress) {
		this.progress = progress;
	};
	this.release = function(x, y) {
		this.onRelease_callback(this.getProgress());
		if (this.returnsToCenter) {
			this.progress = 0.5;
		}
		this.available = true;
		this.point = undefined;
	}
	this.onMove_callback = function(progress) {};
	this.onMove = function(callback) {
		this.onMove_callback = callback;
	}
	this.move = function(x, y) {
		this.onMove_callback(this.getProgress());
	}
	this.registerPoint = function(point) {
		this.initGrab.x = point.x;
		this.initGrab.y = point.y;
		this.initGrab.progress = this.progress;
		this.point = point;
		point.onRelease(this.release.bind(this));
		point.onMove(this.move.bind(this));
		this.available = false;
	};
	this.draw = function(scene, board) {
		//Draw line and then draw grip on top.
		var line_material = new THREE.MeshBasicMaterial({color: 0x222222});
		var grip_material = new THREE.MeshBasicMaterial({color: 0x224222});

		if (this.direction == VRK.LinearSlider.direction.VERTICAL) {
			var line = new THREE.Mesh(
				new THREE.PlaneGeometry(this.line_width, this.height), line_material);
			setKeyboardPosition(board, line, this.x + (this.width - this.line_width)/2, this.y, 0.1);
			var gripMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.grip_width, this.grip_height), grip_material);
			setKeyboardPosition(board, gripMesh, this.x + (this.width - this.grip_width)/2, this.y + (this.height - this.grip_height) * this.progress, 0.11);
		} else if (this.direction == VRK.LinearSlider.direction.HORIZONTAL) {
			var line = new THREE.Mesh(
				new THREE.PlaneGeometry(this.width, this.line_width), line_material);
			setKeyboardPosition(board, line, this.x, this.y + (this.height - this.line_width)/2, 0.1);
			var gripMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.grip_height, this.grip_width), grip_material);
			setKeyboardPosition(board, gripMesh, this.x + (this.width - this.grip_height) * this.progress, this.y + (this.height - this.grip_width)/2, 0.11);
		}
		scene.add(line);
		scene.add(gripMesh);
	};
};

VRK.LinearSlider.direction = {
	VERTICAL: 'vertical',
	HORIZONTAL: 'horizontal'
};

VRK.Treadmill = function(x, y, width, height, options){
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.options = options; //Array of strings

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.width = width * unitWidth;
	this.height = height * unitHeight;
	this.available = true;
	this.max_fingers = 2;//Could modify later to handle more

	this.state = {
		x: 0,
		y: 0,
		angle: 0,
		zoom: 1
	};
	this.startState = {
		x: 0,
		y: 0,
		angle: 0,
		zoom: 1
	};
	this.grabInfo = {
		x: 0,
		y: 0,
		angle: 0,
		zoom: 1
	};
	this.points = {};
	this.cloneState = function(state) {
		return {
			x: state.x,
			y: state.y,
			angle: state.angle,
			zoom: state.zoom,
		};
	};
	this.contains = function(x, y) {
		return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
	};
	this.onRelease_callback = function(progress) {};
	this.onRelease = function(callback) {
		this.onRelease_callback = callback;
	};
	this.release = function(x, y, i) {
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
	};
	this.getTouchAngle = function() {
		if (Object.keys(this.points).length < 2) {
			return 0;
		} else if (this.points[0] != undefined && this.points[1] != undefined){
			return Math.atan2(this.points[0].x - this.points[1].x, this.points[0].y - this.points[1].y);
		}
		return 0;
	};
	this.getTouchCenter = function() {
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
	};
	this.getTouchSeparation = function() {
		if (Object.keys(this.points).length < 2) {
			return 1;
		} else if (this.points[0] != undefined && this.points[1] != undefined) {
			return distance(this.points[0], this.points[1]);
		}
	};
	this.setGrabInfo = function() {
		var center = this.getTouchCenter();
		this.grabInfo = {
			x: center.x,
			y: center.y,
			angle: this.getTouchAngle(),
			zoom: this.getTouchSeparation()
		};
	};
	this.registerPoint = function(point) {
		this.startState = this.cloneState(this.state);
		this.points[point.i] = point;
		this.setGrabInfo();
		point.onRelease(this.release.bind(this));
		point.onMove(this.move.bind(this));
		if (Object.keys(this.points).length >= this.max_fingers)
			this.available = false;
	};
	this.getNewState = function() {
		var isContained = function(array, item) {
			return array.indexOf(item) >= 0;
		}
		var options = VRK.Treadmill.option;
		var newState = this.cloneState(this.startState);
		if (isContained(this.options, options.Rotate)) {
			newState.angle = this.startState.angle + this.getTouchAngle() - this.grabInfo.angle;
		}
		var disp = vector(this.getTouchCenter(), this.grabInfo);
		if (isContained(this.options, options.X)) {
			newState.x = this.startState.x + disp.x * Math.cos(newState.angle) - disp.y * Math.sin(newState.angle);
		}
		if (isContained(this.options, options.Y)) {
			newState.y = this.startState.y + disp.x * Math.sin(newState.angle) + disp.y * Math.cos(newState.angle);
		}
		if (isContained(this.options, options.Zoom) >= 0 || 
			(isContained(this.options, options.ZoomIn) >= 0 && this.grabInfo.zoom > this.getTouchSeparation()) ||
			(isContained(this.options, options.ZoomOut) >= 0 && this.grabInfo.zoom < this.getTouchSeparation())) {
			newState.zoom = this.startState.zoom * this.grabInfo.zoom / this.getTouchSeparation();
		}
		return newState;
	};
	this.onMove_callback = function(x, y, angle, zoom) {};
	this.onMove = function(callback) {
		this.onMove_callback = callback;
	};
	this.move = function(x, y, angle, zoom) {
		this.state = this.getNewState();
		this.onMove_callback(this.state.x, this.state.y, this.state.angle, this.state.zoom);
	};
	this.draw = function(scene, board) {
		var material = new THREE.MeshBasicMaterial({color: 0x222222});
		treadMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(this.width, this.height),
			material);
		setKeyboardPosition(board, treadMesh, this.x, this.y, 0.1);
		scene.add(treadMesh);


		//Draw Lines to show movement
		//start with vertical lines. Ideally would draw only what is needed. Use modulus.

		//Shift then rotate?

		//Line is a point and a direction. Write function to take it in along with bounds to crop.

	};
};

VRK.Treadmill.option = {
	X: 'x',
	Y: 'y',
	Rotate: 'rotate',
	Zoom: 'Zoom',
	ZoomIn: 'Zoom In',
	ZoomOut: 'Zoom Out'
};

VRK.Label = function(x, y, width, height, text, px){
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.width = width/12;
	this.height = height/9;
	this.text = text;
	this.px = px || 30;
	this.contains = function(x, y) {
		return false;
	};
	this.draw = function(scene, board) {
		var material = new THREE.MeshBasicMaterial({color: 0x222222});

		buttonMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(this.width, this.height), material);

		setKeyboardPosition(board, buttonMesh, this.x, this.y, 0.1);

		scene.add(buttonMesh);
		
		var canvas1 = document.createElement('canvas');
		canvas1.height = this.px;
		canvas1.width = 100;
        var context1 = canvas1.getContext('2d');
        context1.font = "Bold " + this.px + "px Arial";
        context1.fillStyle = "rgba(255,255,255,0.95)";
	    context1.fillText(this.text, 0, this.px);
        var texture1 = new THREE.Texture(canvas1) 
        texture1.needsUpdate = true;
	    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
	    material1.transparent = true;
	    var textmesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material1);
	    
	    setKeyboardPosition(board, textmesh, this.x, this.y, 0.2);
        scene.add(textmesh);
	};
};

VRK.KeyboardObject = function(x, y, width, height){
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.width = width;
	this.height = height;
	this.contains = function(x, y) {
		return false;
	};
	this.draw = function(scene, board) {
		var material = new THREE.MeshBasicMaterial({color: 0x222222});

		buttonMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(this.width, this.height),
			material);

		setKeyboardPosition(board, buttonMesh, this.x, this.y, 0.1);

		scene.add(buttonMesh);
	};
};

//moves whole keyboard down when dragged. When buttons are pressed, changes state
VRK.SystemBar = function(x, y, width, height){
	var unitWidth = 1/12;
	var unitHeight = 1/9;

	this.x = x * unitWidth;
	this.y = y * unitHeight;
	this.width = width * unitWidth;
	this.height = height * unitHeight;
	this.buttonPosition = {
		'inClose': 0 * unitWidth,
		'inNotifications': 1 * unitWidth,
		'inAppSwitch': 10 * unitWidth,
		'inMaxMin': 11 * unitWidth
	};
	this.initGrab = {
		x: 0,
		y: 0
	};
	this.available = true;
	this.point = undefined;
	this.buttonSelected = undefined;
	this.contains = function(x, y) {
		var which = this.whichButton(x, y);
		return which != 'none';
	};
	this.moving = false;
	this.threshold_distance = 0.1;
	this.whichButton = function(x,y) {
		if (kM.hidden) {
			return 'hideBar';
		} else {
			if (y > this.y) {
				if (x > 2 * unitWidth && x < 10 * unitWidth) {
					return 'hideBar';
				}
				for (state in this.buttonPosition) {
					if (x > this.buttonPosition[state] && x < this.buttonPosition[state] + unitWidth) {
						switch (state) {
							case 'inClose':
								if (kM.getKeyboardApp()) {
									return state;
								}
								break;
							case 'inNotifications':
								return state;
								break;
							case 'inAppSwitch':
								return state;
								break;
							case 'inMaxMin':
								if (kM.canMinimize() || kM.canMaximize()) {
									return state;
								}
								break;
						}
					}
				}
			}
			return 'none';
		}
	}
	this.dragDistance = function() {
		if(this.point != undefined) {
			return distance(this.point, this.initGrab);
		}
		return 0;
	};
	this.release = function(x, y) {
		//if far enough, click.
		if (this.buttonPosition[this.buttonSelected] != undefined && this.dragDistance() > this.threshold_distance) {
			this.click(this.buttonSelected);
		} else if (this.buttonSelected == 'hideBar') {
			if (y > 0.5) {
				kM.hidden = false;
			} else {
				kM.hidden = true;
			}
		}
		this.available = true;
		this.point = undefined;
		this.moving = false;
		this.buttonSelected = 'none';
	};
	this.click = function(buttonName){
		switch(buttonName) {
			case 'inClose':
				if (kM.state == kM.State.Normal) {
					kM.close();
				} else {
					kM.state = kM.State.Normal;
				}
				break;
			case 'inNotifications':
				kM.state = kM.State.Notifications;
				break;
			case 'inAppSwitch':
				kM.state = kM.State.AppSwitch;
				break;
			case 'inMaxMin':
				kM.toggleMaxMin();
				break;
		}
	};
	this.dragDistance = function() {
		if(this.point != undefined) {
			return distance(this.point, this.initGrab);
		}
		return 0;
	};
	this.registerPoint = function(point) {
		this.initGrab.x = point.x;
		this.initGrab.y = point.y;
		this.buttonSelected = this.whichButton(point.x, point.y);
		if (this.buttonSelected == 'hideBar') {
			this.moving = true;
		}
		this.point = point;
		point.onRelease(this.release.bind(this));
		this.available = false;
	};
	this.draw = function(scene, board) {
		var distance = this.dragDistance();
		var percentClicked = Math.min(distance/this.threshold_distance, 1);

		if (!kM.hidden || this.buttonSelected == 'hideBar') {
			var barMaterial = new THREE.MeshBasicMaterial({color: 0x00CC00});

			var barMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(this.width, this.height), barMaterial);
			
			var adjusted_y = this.y;
			if (kM.hidden) {
				adjusted_y = 0;
				if (this.point != undefined) {
					adjusted_y = this.point.y - this.initGrab.y;
				}
			} else {
				if (this.point != undefined && this.buttonSelected == 'hideBar') {
					adjusted_y = this.y + (this.point.y - this.initGrab.y);
				}
			}

			setKeyboardPosition(board, barMesh, this.x, adjusted_y, 0.1);
			scene.add(barMesh);

			if (this.buttonSelected != 'none' && this.buttonSelected != 'hideBar') {
				//change color based on distance
				setKeyboardPosition(board, barMesh, this.x, adjusted_y, 0.1);
				var materialOptions = {color: 0x00CC00};
				if (this.point != null) {
					materialOptions.color = (0 << 16) + (200 * (1 - percentClicked) << 8) + percentClicked * 255;
				}

				var buttonMaterial = new THREE.MeshBasicMaterial(materialOptions);
				var buttonMesh = new THREE.Mesh(
					new THREE.PlaneGeometry(unitWidth, unitHeight), buttonMaterial);

				setKeyboardPosition(board, buttonMesh, this.x + this.buttonPosition[this.buttonSelected], adjusted_y, 0.11);
				scene.add(buttonMesh);
			}

			if (kM.state == kM.State.Normal) {
				var closeMesh = makeText(' X', 30, unitWidth, unitHeight);
				setKeyboardPosition(board, closeMesh, this.x + this.buttonPosition['inClose'], adjusted_y, 0.12);
				scene.add(closeMesh);

				if (kM.canMaximize()) {
					var maxMinMesh = makeText(' +', 30, unitWidth, unitHeight);
					setKeyboardPosition(board, maxMinMesh, this.x + this.buttonPosition['inMaxMin'], adjusted_y, 0.12);
					scene.add(maxMinMesh);
				} else if (kM.canMinimize()) {
					var maxMinMesh = makeText(' -', 30, unitWidth, unitHeight);
					setKeyboardPosition(board, maxMinMesh, this.x + this.buttonPosition['inMaxMin'], adjusted_y, 0.12);
					scene.add(maxMinMesh);
				}
			} else {
				if (kM.getKeyboardApp() != null) {
					var maxMinMesh = makeText(' <', 30, unitWidth, unitHeight);
					setKeyboardPosition(board, maxMinMesh, this.x + this.buttonPosition['inClose'], adjusted_y, 0.12);
					scene.add(maxMinMesh);
				}
			}
	
			var notificationText = ' !';
			var notifyMesh = makeText(notificationText, 30, unitWidth, unitHeight);
			setKeyboardPosition(board, notifyMesh, this.x + this.buttonPosition['inNotifications'], adjusted_y, 0.12);
			scene.add(notifyMesh);
	
			var appSwitchText = '<->';
			var appSwitchMesh = makeText(appSwitchText, 30, unitWidth, unitHeight);
			setKeyboardPosition(board, appSwitchMesh, this.x + this.buttonPosition['inAppSwitch'], adjusted_y, 0.12);
			scene.add(appSwitchMesh);

			var title = '';
			if (kM.state == kM.State.Normal && kM.getKeyboardApp() != null) {
				title = kM.getKeyboardApp().name;
			} else if (kM.state == kM.State.AppSwitch) {
				title = 'App Switcher';
			} else if (kM.state == kM.State.Notifications) {
				title = 'Notifications';
			}

			var titleMesh = makeText(title, 30, unitWidth*8, unitHeight);
			setKeyboardPosition(board, titleMesh, 2*unitWidth, adjusted_y, 0.12);
			scene.add(titleMesh);
		}
	}
};

VRK.Joystick = function(x, y, radius, returnsToCenter) {
	var unitWidth = 1/12;
	var unitHeight = 1/9;
	
	this.x = x * unitWidth;
	this.y = y * unitHeight;

	this.returnsToCenter = returnsToCenter;
	this.initGrab = {
		x: 0,
		y: 0
	};
	this.radius = 0.04;
	this.available = true;
	this.point = undefined;
	if (radius != undefined) {
		this.max_drag = radius * unitWidth;
	} else {
		this.max_drag = 1/4;
	}
	this.contains = function(x, y) {
		//handle not alway going back to center
		return Math.sqrt(Math.pow(x - this.x,2) + Math.pow((y - this.y) / eccentricity,2)) < this.radius;
	};
	this.release = function(x, y) {
		this.available = true;
		this.onRelease_callback(x - this.x, y - this.y);
		this.point = undefined;
	};
	this.onRelease_callback = function(x, y) {};
	this.onRelease = function(callback) {
		this.onRelease_callback = callback;
	}
	this.onMove_callback = function(x, y) {};
	this.move = function(x, y){
		var scaling_factor_x = 1;
		var scaling_factor_y = 1;
		x_shift = this.point.x - this.initGrab.x;
		y_shift = this.point.y - this.initGrab.y;
		var dist = length({x:(this.point.x - this.x), y:(this.point.y - this.y) / eccentricity});
		if (dist > this.max_drag) {
			scaling_factor_x = this.max_drag / dist;
			scaling_factor_y = this.max_drag / dist;
		}
		this.onMove_callback(x_shift * scaling_factor_x, y_shift * scaling_factor_y);
	};
	this.onMove = function(callback) {
		this.onMove_callback = callback;
	};
	this.registerPoint = function(point) {
		this.initGrab.x = point.x;
		this.initGrab.y = point.y;
		this.point = point;
		point.onRelease(this.release.bind(this));
		point.onMove(this.move.bind(this));
		this.available = false;
	};
	this.dragDistance = function() {
		if(this.point != undefined) {
			return distance(this.point, this.initGrab);
		}
		return 0;
	};
	this.draw = function(scene, board) {
		var grab = makeFullCircle(this.radius);
		
		var x_shift = 0;
		var y_shift = 0;
		var scaling_factor_x = 1;
		var scaling_factor_y = 1;
		if(this.point != undefined) {
			x_shift = this.point.x - this.initGrab.x;
			y_shift = this.point.y - this.initGrab.y;
			var dist = length({x:(this.point.x - this.x), y:(this.point.y - this.y) / eccentricity});
			if (dist > this.max_drag) {
				scaling_factor_x = this.max_drag / dist;
				scaling_factor_y = this.max_drag / dist;
			}
		}

		setKeyboardPosition(board, grab, this.x + x_shift * scaling_factor_x, this.y + y_shift * scaling_factor_y, 0.12);

		scene.add(grab);
	};
};

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

var apps = [];//appList;

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
	return app;
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

recentApps.map(function(appID) {
  $.get('/appInfo?app_id=' + appID, function(data){
    (function(kM){
      $.getScript(data.url, function() {
        //eval(data.contents);
        console.log(data);
        kM.add(exports);
      });
    })(kM);
  });
});

(function(kM){
  $.getScript(appQueryURL, function() {
    //eval(data.contents);
    console.log(appQueryURL);
    kM.open(kM.add(exports));
  });
})(kM);

/*$.get('/appList', function(data) {
  console.log(data);
  appList = data;
  data.map(function(appURL) {
    $.getScript(appURL, function() {
      //eval(data.contents);
      kM.add(exports);
    });
  });
});*/

console.log(appQueryURL);
console.log(recentApps);
</script>
<script>
function toggleFullScreen() {
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
}

var QUALITY = 3;
var DEFAULT_LOCATION = { lat:44.301945982379095,  lng:9.211585521697998 };
var WEBSOCKET_ADDR = "ws://127.0.0.1:1981";
var USE_TRACKER = false;
var MOUSE_SPEED = 0.005;
var KEYBOARD_SPEED = 0.02;
var GAMEPAD_SPEED = 0.04;
var DEADZONE = 0.2;
var SHOW_SETTINGS = true;
var NAV_DELTA = 45;
var FAR = 5000;
var USE_DEPTH = true;
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

var lastUpdate = 0;

var socket = io.connect('/');
socket.on('disconnect', function() {
  window.location = "/";
});

socket.emit('declare-type', {
	type: 'output',
	session_id: <%= session_id %>
});

socket.on('error', function(result) {
	window.location = "/";
});

socket.on('size', function (data) {
	device_width = JSON.parse(data).width;
	device_height = JSON.parse(data).height;
});

socket.on('quarternion', function (data) {
	quarternion = JSON.parse(data);
});

/&
socket.on('code', function (code) {
	connect_code = code;
	setUpAppSwitcher();
	screen_code = document.getElementById( 'code' );
	screen_code.innerText = 'Use this code to connect: ' + code;
});
*/

socket.on('start', function (data) {
	var parsed = JSON.parse(data);
	var point = new Point(parsed.x, parsed.y, parsed.i);
	kM.points[parsed.i] = point;
	checkGrab(point);
});

socket.on('move', function (data) {
	var parsed = JSON.parse(data);
	var point = kM.points[parsed.i];
	point.move(parsed.x, parsed.y, parsed.i);
	if (!point.taken) {
		checkGrab(point);
	}
});

socket.on('end', function (data) {
	var parsed = JSON.parse(data);
	kM.points[parsed.i].release(parsed.x, parsed.y, parsed.i);
	kM.points[parsed.i] = {};
});


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
        lastUpdate = Date.now();
    }
});

bridge.connect();

document.addEventListener("keydown", function(e) {
  if (e.keyCode == 32) {
    toggleFullScreen();
  }
}, false);

var BaseRotation = new THREE.Quaternion();
var BaseRotationEuler = new THREE.Vector3();

var VRState = null;

// Utility function
// ----------------------------------------------
function angleRangeDeg(angle) {
  angle %= 360;
  if (angle < 0) angle += 360;
  return angle;
}

function angleRangeRad(angle) {
  angle %= 2*Math.PI;
  if (angle < 0) angle += 2*Math.PI;
  return angle;
}

function deltaAngleDeg(a,b) {
  return Math.min(360-(Math.abs(a-b)%360),Math.abs(a-b)%360);
}

var initWebGL = function() {

	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera.rotation.x = camera_start.x;
	camera.position.y = camera_start.y;
	camera.position.z = camera_start.z;
	camera.useQuaternion = true;

	// Create render
	try {
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	}
	catch(e){
		alert('This application needs WebGL enabled!');
		return false;
	}

	renderer.autoClearColor = true;
	renderer.setSize(WIDTH, HEIGHT);

	// Set the window resolution of the rift in case of not native
	OculusRift.hResolution = WIDTH;
  OculusRift.vResolution = HEIGHT;

	effect = new THREE.OculusRiftEffect( renderer, {HMD:OculusRift, worldFactor:WORLD_FACTOR} );
	effect.setSize(WIDTH, HEIGHT );

	var $viewer = $('#viewer');
	$viewer.append(renderer.domElement);
}


function initControls() {
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

  viewer.mouseup(function() {
    mouseButtonDown = false;
  });

  viewer.mousemove(function(event) {
    if (mouseButtonDown) {
      var enableX = (USE_TRACKER || VRState !== null) ? 0 : 1;
      BaseRotationEuler.set(
        angleRangeRad(BaseRotationEuler.x + (event.clientY - lastClientY) * MOUSE_SPEED * enableX),
        angleRangeRad(BaseRotationEuler.y + (event.clientX - lastClientX) * MOUSE_SPEED),
        0.0
      );
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      BaseRotation.setFromEuler(BaseRotationEuler, 'YZX');
    }
  });
}



function initGui()
{
  $('#extt-left').prop('checked', USE_TRACKER);
  $('#extt-right').prop('checked', USE_TRACKER);


  $('#extt-left').change(function(event) {
    USE_TRACKER = $('#extt-left').is(':checked');
    if (USE_TRACKER) {
      WEBSOCKET_ADDR = $('#wsock-left').val();
      initWebSocket();
      BaseRotationEuler.x = 0.0;
      VRState = null;
    }
    else {
      if (connection) connection.close();
      initVR();
    }
    $('#extt-right').prop('checked', USE_TRACKER);
  });

  $('#extt-right').change(function(event) {
    USE_TRACKER = $('#extt-right').is(':checked');
    if (USE_TRACKER) {
      WEBSOCKET_ADDR = $('#wsock-right').val();
      initWebSocket();
      BaseRotationEuler.x = 0.0;
      VRState = null;
    }
    else {
      if (connection) connection.close();
      initVR();
    }
    $('#extt-left').prop('checked', USE_TRACKER);
  });

  $('#wsock-left').change(function(event) {
    WEBSOCKET_ADDR = $('#wsock-left').val();
    if (USE_TRACKER) {
      if (connection) connection.close();
      initWebSocket();
    }
  });

  $('#wsock-right').change(function(event) {
    WEBSOCKET_ADDR = $('#wsock-right').val();
    if (USE_TRACKER) {
      if (connection) connection.close();
      initWebSocket();
    }
  });

  $('#wsock-left').keyup(function() {
      $('#wsock-right').prop('value', $('#wsock-left').val() );
  });

  $('#wsock-right').keyup(function() {
      $('#wsock-left').prop('value', $('#wsock-right').val() );
  });

  $('#depth-left').change(function(event) {
    USE_DEPTH = $('#depth-left').is(':checked');
    $('#depth-right').prop('checked', USE_DEPTH);
    setSphereGeometry();
  });

  $('#depth-right').change(function(event) {
    USE_DEPTH = $('#depth-right').is(':checked');
    $('#depth-left').prop('checked', USE_DEPTH);
    setSphereGeometry();
  });

  window.addEventListener( 'resize', resize, false );

}

function setSphereGeometry() {
  var geom = projSphere.geometry;
  var depthMap = panoDepthLoader.depthMap.depthMap;
  var y, x, u, v, radius, i=0;
  for ( y = 0; y <= geom.heightSegments; y ++ ) {
    for ( x = 0; x <= geom.widthSegments; x ++ ) {
      u = x / geom.widthSegments;
      v = y / geom.heightSegments;

      radius = (USE_DEPTH ? Math.min(depthMap[y*512 + x], FAR) : 500)*10;

      var vertex = geom.vertices[i];
      vertex.x = - radius * Math.cos( geom.phiStart + u * geom.phiLength ) * Math.sin( geom.thetaStart + v * geom.thetaLength );
      vertex.z = radius * Math.cos( geom.thetaStart + v * geom.thetaLength );
      vertex.y = -radius * Math.sin( geom.phiStart + u * geom.phiLength ) * Math.sin( geom.thetaStart + v * geom.thetaLength );
      i++;
    }
  }
  geom.verticesNeedUpdate = true;
}

function initGoogleMap() {
  currentLocation = new google.maps.LatLng( DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng );
}


function initVR() {
  vr.load(function(error) {
    if (error) {
      //console.warn('VR error: ' + error.toString());
      return;
    }

    VRState = new vr.State();
    if (!vr.pollState(VRState)) {
      //console.warn('NPVR plugin not found/error polling');
      VRState = null;
      return;
    }

    if (!VRState.hmd.present) {
      //console.warn('oculus rift not detected');
      VRState = null;
      return;
    }
    BaseRotationEuler.x = 0.0;
  });
}

function setUiSize() {
  var width = window.innerWidth, hwidth = width/2,
      height = window.innerHeight;
}

function resize( event ) {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  setUiSize();

  OculusRift.hResolution = WIDTH,
  OculusRift.vResolution = HEIGHT,
  effect.setHMD(OculusRift);

  renderer.setSize( WIDTH, HEIGHT );
  camera.projectionMatrix.makePerspective( VIEW_ANGLE, ASPECT, NEAR, FAR );
}

function getParams() {
  var params = {};
  var items = window.location.search.substring(1).split("&");
  for (var i=0;i<items.length;i++) {
    var kvpair = items[i].split("=");
    params[kvpair[0]] = unescape(kvpair[1]);
  }
  return params;
}

var pointLight = new THREE.PointLight(0xFFFFFF);

pointLight.position.x = 50;
pointLight.position.y = 50;
pointLight.position.z = 300;

var directLight = new THREE.DirectionalLight(0xFFFFFF);

directLight.position.x = 0;
directLight.position.y = 0;
directLight.position.z = 1;

var projGeo = new THREE.SphereGeometry( 5000, 512, 256 );
var projMaterial = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('static/placeholder.png'), side: THREE.DoubleSide});

var wasUsingRift = false;

var render = function() {

	requestAnimationFrame( render );

	if (!USE_TRACKER && VRState !== null) {
		if (vr.pollState(VRState)) {
			HMDRotation.set(VRState.hmd.rotation[0], VRState.hmd.rotation[1], VRState.hmd.rotation[2], VRState.hmd.rotation[3]);
		}
	}

	// Compute move vector
	moveVector.add(keyboardMoveVector);//, gamepadMoveVector);

	// Disable X movement HMD tracking is enabled
	if (USE_TRACKER || VRState !== null) {
		moveVector.x = 0;
	}

	// Apply movement
	BaseRotationEuler.set( 0.0/*angleRangeRad(BaseRotationEuler.x + moveVector.x)*/, angleRangeRad(BaseRotationEuler.y + moveVector.y), 0.0 );
	BaseRotation.setFromEuler(BaseRotationEuler, 'YZX');

	var matr = new THREE.Matrix4();
	matr.makeRotationFromQuaternion(BaseRotation);

	var tilt = new THREE.Matrix4();
	tilt.makeRotationX(Math.PI/2);
	matr.multiplyMatrices(tilt, matr);
	BaseRotation.setFromRotationMatrix(matr);

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
	camera.quaternion.multiplyQuaternions(BaseRotation, adjustedHMDQuarternion);

	// Compute heading
	headingVector.setEulerFromQuaternion(camera.quaternion, 'YZX');
	currHeading = angleRangeDeg(THREE.Math.radToDeg(-headingVector.y));

	scene = new THREE.Scene();

	if(kM.front_and_back != null) {
		kM.front_and_back.external.drawFrontAndBack(scene);
	} else {
		if (kM.front != null) {
			kM.front.external.drawFront(scene);
		}
		if (kM.back != null) {
			kM.back.external.drawBack(scene);
		}
	}
	kM.drawKeyboard(scene);

	scene.add(camera);
	scene.add(directLight);

	//renderer.clear();
  if (Date.now() - lastUpdate < 100) {
    effect.render(scene, camera);
    wasUsingRift = true;
  } else {
    HMDRotation.x = 0;
    HMDRotation.y = 0;
    HMDRotation.z = 0;
    HMDRotation.w = 1;
    if (wasUsingRift) {
      BaseRotationEuler.y = 0;
    }
    renderer.setViewport(0, 0, WIDTH, HEIGHT);
    renderer.render(scene, camera);
    wasUsingRift = false;
  }
};

$(document).ready(function() {

  // Read parameters
  params = getParams();
  if (params.lat !== undefined) DEFAULT_LOCATION.lat = params.lat;
  if (params.lng !== undefined) DEFAULT_LOCATION.lng = params.lng;
  if (params.sock !== undefined) {WEBSOCKET_ADDR = 'ws://'+params.sock; USE_TRACKER = true;}
  if (params.q !== undefined) QUALITY = params.q;
  if (params.s !== undefined) SHOW_SETTINGS = params.s !== "false";
  if (params.heading !== undefined) {
    BaseRotationEuler.set(0.0, angleRangeRad(THREE.Math.degToRad(-parseFloat(params.heading))) , 0.0 );
    BaseRotation.setFromEuler(BaseRotationEuler, 'YZX');
  }
  if (params.depth !== undefined) USE_DEPTH = params.depth !== "false";
  if (params.wf !== undefined) WORLD_FACTOR = parseFloat(params.wf);

  WIDTH = window.innerWidth; HEIGHT = window.innerHeight;

  setUiSize();

  initWebGL();
  initControls();
  initGui();
  if (USE_TRACKER) initWebSocket();
  else initVR();

  render();
});

