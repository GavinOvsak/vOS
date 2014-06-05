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
	  ASPECT = state.width / state.height;

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
