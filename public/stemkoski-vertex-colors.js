var app = {};
var kb;

var mode = 2;//1 or 2. 1 = sliders, 2 = treadmills

var back_position = {
	x: 0,
	y: 0,
	z: 0,
	theta: 0,
	phi: 0
};

var front_position = {
	zoom: 1,
	theta: 0,
	phi: 0
};

var rotationSlider, zoomSlider, tiltSlider, rotateAndZoom, translation, 
	viewpoint, zSlider, fineMotion, zTreadmill;

var setFrontKeyboard = function(keyboard) {
	if (mode == 1) {
		if (rotationSlider == undefined)
			rotationSlider = new VRK.ArcSlider();
		if (zoomSlider == undefined)
			zoomSlider = new VRK.LinearSlider();
		if (tiltSlider == undefined)
			tiltSlider = new VRK.LinearSlider();
		keyboard.set([rotationSlider, zoomSlider, tiltSlider]);
	} else if(mode == 2) {
		//set up treadmill front
		if (rotateAndZoom == undefined)
			rotateAndZoom = new VRK.Treadmill();
		keyboard.set([rotateAndZoom]);
	}
};

var xy_scaling = 1000;

var setFrontAndBackKeyboard = function(keyboard) {
	if (mode == 1) {
		//set up slider front
		translation = new VRK.Joystick();
		viewpoint = new VRK.Joystick();
		zSlider = new VRK.LinearSlider();
	} else if(mode == 2) {
		//set up treadmill front
		if (fineMotion == undefined)
			fineMotion = new VRK.Treadmill(2,2,5,5);
		if (zTreadmill == undefined)
			zTreadmill = new VRK.Treadmill(9,2,1,5);
        fineMotion.onMove(function(x, y, angle, zoom) {
            back_position.x = x * xy_scaling;
            back_position.y = y * xy_scaling;
            back_position.angle = angle;
        });

		keyboard.set([fineMotion, zTreadmill]);
	}
};

app.setUpKeyboard = function(keyboard) {
	kb = keyboard;
	setFrontKeyboard(keyboard);
}
app.name = 'Vertex Colors Demo';
app.icon = 'http://msfastro.net/Images/galaxy_icon.gif';

var cubeMaterials = [];
var cubeGeometries = [];

cubeMaterials[0] = new THREE.MeshBasicMaterial( 
{ color: 0xffffff, vertexColors: THREE.FaceColors } );

cubeGeometries[0] = new THREE.CubeGeometry( 80, 80, 80, 3, 3, 3 );
for ( var i = 0; i < cubeGeometries[0].faces.length; i++ ) 
{
    face  = cubeGeometries[0].faces[ i ];
    face.color.setRGB( Math.random(), Math.random(), Math.random() );                
}

cubeMaterials[1] = new THREE.MeshBasicMaterial( 
{ color: 0xffffff, vertexColors: THREE.VertexColors } );

var color, face, numberOfSides, vertexIndex;

var faceIndices = [ 'a', 'b', 'c', 'd' ];

cubeGeometries[1] = new THREE.CubeGeometry( 80, 80, 80, 3, 3, 3 );
for ( var i = 0; i < cubeGeometries[1].faces.length; i++ ) 
{
    face  = cubeGeometries[1].faces[ i ];        

    numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;

    for( var j = 0; j < numberOfSides; j++ ) 
    {
        vertexIndex = face[ faceIndices[ j ] ];

        color = new THREE.Color( 0xffffff );
        color.setHex( Math.random() * 0xffffff );
        face.vertexColors[ j ] = color;
    }
}

var size = 80;
var point;
cubeGeometries[2] = new THREE.CubeGeometry( size, size, size, 1, 1, 1 );
for ( var i = 0; i < cubeGeometries[2].faces.length; i++ ) 
{
    face = cubeGeometries[2].faces[ i ];
    numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
    for( var j = 0; j < numberOfSides; j++ ) 
    {
            vertexIndex = face[ faceIndices[ j ] ];
            point = cubeGeometries[2].vertices[ vertexIndex ];
            color = new THREE.Color( 0xffffff );
            color.setRGB( 0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size );
            face.vertexColors[ j ] = color;
    }
}

var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set( 10, 10 );
var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);

var imagePrefix = "images/dawnmountain-";
var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
var imageSuffix = ".png";

var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );        
var materialArray = [];
for (var i = 0; i < 6; i++) {
    materialArray.push( new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
            side: THREE.BackSide
    }));
}
var skyMaterial = new THREE.MeshFaceMaterial( materialArray );

var state = '';

app.drawFrontAndBack = function(scene) {
	if (state != 'FB') {
		//set keyboard to immersive controls
		setFrontAndBackKeyboard(kb);
		state = 'FB';
	}

	var light = new THREE.PointLight(0xffffff);
    light.position.set(0,250,0);
    scene.add(light);

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.z = -25.5;
    floor.position.x = 0 - back_position.x;
    floor.position.y = 0 - back_position.y;
    scene.add(floor);

    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    skyBox.rotation.x = Math.PI/2;
    scene.add( skyBox );

    scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
    
    var cube = new THREE.Mesh( cubeGeometries[0], cubeMaterials[0] );
    cube.position.set(-100 - back_position.x, 0 - back_position.y, 50);
    scene.add(cube);

    cube = new THREE.Mesh( cubeGeometries[1], cubeMaterials[1] );
    cube.position.set(0 - back_position.x, 0 - back_position.y, 50);
    scene.add(cube);

    cube = new THREE.Mesh( cubeGeometries[2], cubeMaterials[1] );
    cube.position.set( 100 - back_position.x, 0 - back_position.y, 50);
    scene.add(cube);
};

app.drawBack = function(scene) {
	app.drawFrontAndBack(scene);
};
    
app.drawFront = function(scene) {
	if (state != 'F') {
		//set keyboard to contained controls
		setFrontKeyboard(kb);
		state = 'F';
	}

    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,250,0);
    scene.add(light);

    //Shrink
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.z = -25.5;
    scene.add(floor);

    //Shrink
    var cube = new THREE.Mesh( cubeGeometries[0], cubeMaterials[0] );
    cube.position.set(-100, 0, 50);
    scene.add(cube);

    cube = new THREE.Mesh( cubeGeometries[1], cubeMaterials[1] );
    cube.position.set(0, 0, 50);
    scene.add(cube);

    cube = new THREE.Mesh( cubeGeometries[2], cubeMaterials[1] );
    cube.position.set( 100, 0, 50 );
    scene.add(cube);
};

var exports = app;
