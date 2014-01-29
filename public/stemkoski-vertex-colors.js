var app = {};
app.setUpKeyboard = function(keyboard) {
/*	var right = new VRK.Button(8, 1, 2, 1);
	keyboard.add(right);
	right.onClick(function() {
		console.log('right click');
	});*/
}
app.name = 'Vertex Colors Demo';
app.icon = 'http://msfastro.net/Images/galaxy_icon.gif';

var cubes = [];

app.drawFront = function(scene) {
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,250,0);
    scene.add(light);

    var floorTexture = new THREE.ImageUtils.loadTexture( 'http://stemkoski.github.io/Three.js/images/checkerboard.jpg' );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
    floorTexture.repeat.set( 10, 10 );
    var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
    var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );

    scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
    
    if (cubes[0] == undefined) {
	    var cubeMaterial = new THREE.MeshBasicMaterial( 
	    { color: 0xffffff, vertexColors: THREE.FaceColors } );
	    
	    var cubeGeometry = new THREE.CubeGeometry( 80, 80, 80, 3, 3, 3 );
	    for ( var i = 0; i < cubeGeometry.faces.length; i++ ) 
	    {
	            face  = cubeGeometry.faces[ i ];
	            face.color.setRGB( Math.random(), Math.random(), Math.random() );                
	    }
	    cubes[0] = new THREE.Mesh( cubeGeometry, cubeMaterial );
	    cubes[0].position.set(-100, 50, 0);
    }
    scene.add(cubes[0]);

    if (cubes[1] == undefined) {
	    var cubeMaterial = new THREE.MeshBasicMaterial( 
	    { color: 0xffffff, vertexColors: THREE.VertexColors } );
	    
	    var color, face, numberOfSides, vertexIndex;
	    
	    var faceIndices = [ 'a', 'b', 'c', 'd' ];
	    
	    var cubeGeometry = new THREE.CubeGeometry( 80, 80, 80, 3, 3, 3 );
	    for ( var i = 0; i < cubeGeometry.faces.length; i++ ) 
	    {
	            face  = cubeGeometry.faces[ i ];        

	            numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;

	            for( var j = 0; j < numberOfSides; j++ ) 
	            {
	                    vertexIndex = face[ faceIndices[ j ] ];

	                    color = new THREE.Color( 0xffffff );
	                    color.setHex( Math.random() * 0xffffff );
	                    face.vertexColors[ j ] = color;
	            }
	    }
	    cubes[1] = new THREE.Mesh( cubeGeometry, cubeMaterial );
	    cubes[1].position.set(0, 50, 0);
	}
    scene.add(cubes[1]);

    if (cubes[2] == undefined) {
	    var size = 80;
	    var point;
	    var cubeGeometry = new THREE.CubeGeometry( size, size, size, 1, 1, 1 );
	    for ( var i = 0; i < cubeGeometry.faces.length; i++ ) 
	    {
	            face = cubeGeometry.faces[ i ];
	            numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
	            for( var j = 0; j < numberOfSides; j++ ) 
	            {
	                    vertexIndex = face[ faceIndices[ j ] ];
	                    point = cubeGeometry.vertices[ vertexIndex ];
	                    color = new THREE.Color( 0xffffff );
	                    color.setRGB( 0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size );
	                    face.vertexColors[ j ] = color;
	            }
	    }
	    cubes[2] = new THREE.Mesh( cubeGeometry, cubeMaterial );
	    cubes[2].position.set( 100, 50, 0 );
    }
    scene.add(cubes[2]);
};

var exports = app;

/*

<script src="js/Detector.js"></script>
<script src="js/Stats.js"></script>
<script src="js/OrbitControls.js"></script>
<script src="js/THREEx.KeyboardState.js"></script>
<script src="js/THREEx.FullScreen.js"></script>
<script src="js/THREEx.WindowResize.js"></script>


var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var cube;

init();
animate();

// FUNCTIONS                 
function init() 
{
        // CAMERA
/*        var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
        var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
        camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
        scene.add(camera);
        camera.position.set(0,150,400);
        camera.lookAt(scene.position);        */
        // RENDERER
/*        if ( Detector.webgl )
                renderer = new THREE.WebGLRenderer( {antialias:true} );
        else
                renderer = new THREE.CanvasRenderer(); 
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        container = document.getElementById( 'ThreeJS' );
        container.appendChild( renderer.domElement );*/
        // EVENTS
//        THREEx.WindowResize(renderer, camera);
//        THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
        // CONTROLS
//        controls = new THREE.OrbitControls( camera, renderer.domElement );
        // STATS
/*        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        stats.domElement.style.zIndex = 100;
        container.appendChild( stats.domElement );*//*
        // LIGHT

        
}

function animate() 
{
    requestAnimationFrame( animate );
        render();                
        update();
}

function update()
{
        if ( keyboard.pressed("z") ) 
        { 
                // do something
        }
        
        controls.update();
        stats.update();
}

function render() 
{
        renderer.render( scene, camera );
}

</script>

</body>
</html>
*/