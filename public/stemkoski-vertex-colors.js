var app = {};
var kb;

var mode = 2;//1 or 2. 1 = sliders, 2 = treadmills

var back_position = {
	x: 0,
	y: -50,
	z: 0,
	theta: 0,
	phi: 0,
    delta: {
        x: 0,
        y: 0,
        z: 0,
        theta: 0
    }
};

var front_position = {
	zoom: 1,
	theta: 0,
	phi: 0
};

var rotationSlider, zoomSlider, tiltSlider, rotateAndZoom, translation, 
	viewpoint, zSlider, fineMotion, zTreadmill;

var saved_front_y = 0;
var saved_front_phi = 0;

var setFrontKeyboard = function(keyboard) {
	if (mode == 1) {
		if (rotationSlider == undefined)
			rotationSlider = new VRK.ArcSlider(2,1,1,10, false, VRK.LinearSlider.direction.HORIZONTAL);
		if (zoomSlider == undefined)
			zoomSlider = new VRK.LinearSlider(4,3,1,4, false, VRK.LinearSlider.direction.VERTICAL);
		if (tiltSlider == undefined)
			tiltSlider = new VRK.LinearSlider(8,3,1,4, false, VRK.LinearSlider.direction.VERTICAL);
        var modeSwitch = new VRK.Button(0,6,1,1,'Mode 2',15);
        modeSwitch.onClick(function() {
            mode = 2;
            setFrontKeyboard(kb);
        });
        keyboard.set([rotationSlider, zoomSlider, tiltSlider, modeSwitch]);
	} else if(mode == 2) {
		//set up treadmill front
		if (rotateAndZoom == undefined)
			rotateAndZoom = new VRK.Treadmill(4,2,5,5,[VRK.Treadmill.option.X, VRK.Treadmill.option.Y, VRK.Treadmill.option.Zoom]);
        //Not average Treadmill, more like gesture pad
        //want angle separate from position
        //want max y
        rotateAndZoom.onMove(function(x, y, theta, zoom) {
            front_position.theta = -1 * (x % 100) * 2 * Math.PI;
            front_position.phi = Math.max(Math.min(saved_front_phi + (y - saved_front_y)*Math.PI, Math.PI/2), -Math.PI/2);
            front_position.zoom = zoom;
        });
        rotateAndZoom.onRelease(function(x, y, theta, zoom) {
            saved_front_y = y;
            saved_front_phi = front_position.phi;
        });
        var modeSwitch = new VRK.Button(0,6,1,1,'Mode 1',15);
        modeSwitch.onClick(function() {
            mode = 1;
            setFrontKeyboard(kb);
        });
		keyboard.set([rotateAndZoom, modeSwitch]);
	}
};

var xy_scaling = 300;
var z_scaling = 50;

var setFrontAndBackKeyboard = function(keyboard) {
	if (mode == 1) {
		//set up slider front
		translation = new VRK.Joystick(3, 5, 1.5);
        translation.onMove(function(x,y){
            back_position.delta.x = x * 10;
            back_position.delta.y = y * 10;
        });
        translation.onRelease(function(x,y){
            back_position.delta.x = 0;
            back_position.delta.y = 0;
        });

		viewpoint = new VRK.Joystick(9, 5, 1.5);
        viewpoint.onMove(function(x, y) {
            back_position.delta.theta = x * -0.1;
            back_position.phi = y * 2;
        });
        viewpoint.onRelease(function(x, y) {
            back_position.delta.theta = 0;
            back_position.phi = 0;
        });

		zSlider = new VRK.LinearSlider(11,2,1,5, true, VRK.LinearSlider.direction.VERTICAL);
        zSlider.onMove(function(progress) {
            back_position.delta.z = (progress - 0.5) * 2;
        });
        zSlider.onRelease(function(progress) {
            back_position.delta.z = 0;
        });
        var modeSwitch = new VRK.Button(0,6,1,1,'Mode 2',15);
        modeSwitch.onClick(function() {
            mode = 2;
            setFrontAndBackKeyboard(kb);
        });
        keyboard.set([translation, viewpoint, zSlider, modeSwitch]);
	} else if(mode == 2) {
		//set up treadmill front
		if (fineMotion == undefined)
			fineMotion = new VRK.Treadmill(2,2,5,5, [VRK.Treadmill.option.X, VRK.Treadmill.option.Y, VRK.Treadmill.option.Rotate]);
		if (zTreadmill == undefined)
			zTreadmill = new VRK.Treadmill(9,2,1,5, [VRK.Treadmill.option.Y]);
        fineMotion.onMove(function(x, y, theta, zoom) {
            back_position.x = x * xy_scaling;
            back_position.y = y * xy_scaling;
            back_position.theta = theta;
        });

        zTreadmill.onMove(function(x, y, theta, zoom) {
            back_position.z = y * z_scaling;
        });

        var modeSwitch = new VRK.Button(0,6,1,1,'Mode 1',15);
        modeSwitch.onClick(function() {
            mode = 1;
            setFrontAndBackKeyboard(kb);
        });
        keyboard.set([fineMotion, zTreadmill, modeSwitch]);
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

var set_back_control = function(mesh, no_translate) {
    if (no_translate == undefined)
        no_translate = false;

    var translation = new THREE.Matrix4().makeTranslation(
        mesh.position.x, mesh.position.y, mesh.position.z);
    if (!no_translate) {
        translation.makeTranslation(mesh.position.x - back_position.x, 
            mesh.position.y - back_position.y, 
            mesh.position.z - back_position.z);
    }

    var x_tilt = new THREE.Matrix4();
    x_tilt.makeRotationX(-1 * back_position.phi);

    var o_tilt = new THREE.Matrix4();
    o_tilt.multiplyMatrices(o_tilt, new THREE.Matrix4().makeRotationX(mesh.rotation.x));
    o_tilt.multiplyMatrices(o_tilt, new THREE.Matrix4().makeRotationY(mesh.rotation.y));
    o_tilt.multiplyMatrices(o_tilt, new THREE.Matrix4().makeRotationZ(mesh.rotation.z));

    var rotation = new THREE.Matrix4();
    rotation.makeRotationZ(-1 * back_position.theta);

    var product = new THREE.Matrix4();
    product.multiplyMatrices(x_tilt, rotation);
    product.multiplyMatrices(product, translation);
    product.multiplyMatrices(product, o_tilt);

    mesh.applyMatrix(product);
    mesh.geometry.verticesNeedUpdate = true;
};

var set_front_control = function(mesh) {
    var translation = new THREE.Matrix4().makeTranslation(
        mesh.position.x / front_position.zoom, 
        mesh.position.y / front_position.zoom, 
        mesh.position.z / front_position.zoom);

    var x_tilt = new THREE.Matrix4();
    x_tilt.makeRotationX(front_position.phi);

    var o_tilt = new THREE.Matrix4();
    o_tilt.multiplyMatrices(o_tilt, new THREE.Matrix4().makeRotationX(mesh.rotation.x));
    o_tilt.multiplyMatrices(o_tilt, new THREE.Matrix4().makeRotationY(mesh.rotation.y));
    o_tilt.multiplyMatrices(o_tilt, new THREE.Matrix4().makeRotationZ(mesh.rotation.z));

    var rotation = new THREE.Matrix4();
    rotation.makeRotationZ(front_position.theta);

    var product = new THREE.Matrix4();
    product.multiplyMatrices(x_tilt, rotation);
    product.multiplyMatrices(product, translation);
    product.multiplyMatrices(product, o_tilt);

    mesh.applyMatrix(product);
    mesh.geometry.verticesNeedUpdate = true;
    mesh.scale.x = 1/front_position.zoom;
    mesh.scale.y = 1/front_position.zoom;
    mesh.scale.z = 1/front_position.zoom;
};

app.drawFrontAndBack = function(scene) {
	if (state != 'FB') {
		//set keyboard to immersive controls
		setFrontAndBackKeyboard(kb);
		state = 'FB';
	}

    back_position.x += back_position.delta.x * Math.cos(back_position.theta) - back_position.delta.y * Math.sin(back_position.theta);
    back_position.y += back_position.delta.x * Math.sin(back_position.theta) + back_position.delta.y * Math.cos(back_position.theta);
    back_position.z += back_position.delta.z;
    back_position.theta += back_position.delta.theta;

	var light = new THREE.PointLight(0xffffff);
    light.position.set(0,0,250);
    scene.add(light);

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.z = -30;
    set_back_control(floor);
    scene.add(floor);

    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    skyBox.rotation.x = Math.PI/2;
    set_back_control(skyBox, true);
    scene.add( skyBox );

    scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
    
    var cube = new THREE.Mesh( cubeGeometries[0], cubeMaterials[0] );
    cube.position.x = -100;
    cube.position.z = 50;
    set_back_control(cube);
    scene.add(cube);

    cube = new THREE.Mesh( cubeGeometries[1], cubeMaterials[1] );
    cube.position.x = 0;
    cube.position.z = 50;
    set_back_control(cube);
    scene.add(cube);

    cube = new THREE.Mesh( cubeGeometries[2], cubeMaterials[1] );
    cube.position.x = 100;
    cube.position.z = 50;
    set_back_control(cube);
    scene.add(cube);
};

app.drawBack = function(scene) {
	app.drawFrontAndBack(scene);
};
    
var size = 20;

var smCubeGeometries = [];
smCubeGeometries[0] = new THREE.CubeGeometry( size, size, size, 3, 3, 3 );
for ( var i = 0; i < smCubeGeometries[0].faces.length; i++ ) 
{
    face  = smCubeGeometries[0].faces[ i ];
    face.color.setRGB( Math.random(), Math.random(), Math.random() );                
}

var color, face, numberOfSides, vertexIndex;


smCubeGeometries[1] = new THREE.CubeGeometry( size, size, size, 3, 3, 3 );
for ( var i = 0; i < smCubeGeometries[1].faces.length; i++ ) 
{
    face  = smCubeGeometries[1].faces[ i ];        

    numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;

    for( var j = 0; j < numberOfSides; j++ ) 
    {
        vertexIndex = face[ faceIndices[ j ] ];

        color = new THREE.Color( 0xffffff );
        color.setHex( Math.random() * 0xffffff );
        face.vertexColors[ j ] = color;
    }
}

var point;
smCubeGeometries[2] = new THREE.CubeGeometry( size, size, size, 1, 1, 1 );
for ( var i = 0; i < smCubeGeometries[2].faces.length; i++ ) 
{
    face = smCubeGeometries[2].faces[ i ];
    numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
    for( var j = 0; j < numberOfSides; j++ ) 
    {
            vertexIndex = face[ faceIndices[ j ] ];
            point = smCubeGeometries[2].vertices[ vertexIndex ];
            color = new THREE.Color( 0xffffff );
            color.setRGB( 0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size );
            face.vertexColors[ j ] = color;
    }
}

app.drawFront = function(scene) {
	if (state != 'F') {
		//set keyboard to contained controls
		setFrontKeyboard(kb);
		state = 'F';
	}

    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,0,250);
    scene.add(light);

    //Shrink
    var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    set_front_control(floor);
    scene.add(floor);

    //Shrink
    var cube = new THREE.Mesh( smCubeGeometries[0], cubeMaterials[0] );
    cube.position.x = -30;
    cube.position.z = 15;
    set_front_control(cube);
    scene.add(cube);

    cube = new THREE.Mesh( smCubeGeometries[1], cubeMaterials[1] );
    cube.position.z = 15;
    set_front_control(cube);
    scene.add(cube);

    cube = new THREE.Mesh( smCubeGeometries[2], cubeMaterials[1] );
    cube.position.x = 30;
    cube.position.z = 15;
    set_front_control(cube);
    scene.add(cube);
};

var exports = app;
