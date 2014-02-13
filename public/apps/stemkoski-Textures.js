var app = {};
app.setUpKeyboard = function(keyboard) {
/*	var right = new VRK.Button(8, 1, 2, 1);
	keyboard.add(right);
	right.onClick(function() {
		console.log('right click');
	});*/
};
app.name = 'Textures Demo';
app.icon = 'http://msfastro.net/Images/galaxy_icon.gif';

var cubeMaterials = [];
var cubeGeometries = [];

var floorMaterial, 
    floorGeometry,
    skyBoxGeometry,
    floorMaterial,
    moonMaterial1,
    moonMaterial2,
    moonMaterial3,
    crateMaterial,
    DiceBlueMaterial;

var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set( 10, 10 );
floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);

var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );

var moonTexture = THREE.ImageUtils.loadTexture( 'images/moon.jpg' );
moonMaterial1 = new THREE.MeshBasicMaterial( { map: moonTexture } );
moonMaterial2 = new THREE.MeshLambertMaterial( { map: moonTexture } );
moonMaterial3 = new THREE.MeshLambertMaterial( { map: moonTexture, color: 0xff8800, ambient: 0x0000ff } );
      
var crateTexture = new THREE.ImageUtils.loadTexture( 'images/crate.gif' );
crateMaterial = new THREE.MeshBasicMaterial( { map: crateTexture } );

var materialArray = [];
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-1.png' ) }));
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-6.png' ) }));
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-2.png' ) }));
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-5.png' ) }));
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-3.png' ) }));
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/Dice-Blue-4.png' ) }));
DiceBlueMaterial = new THREE.MeshFaceMaterial(materialArray);

var cubeGeometry = new THREE.CubeGeometry( 85, 85, 85 );
var sphereGeom =  new THREE.SphereGeometry( 40, 32, 16 ); 


app.drawFront = function(scene) {
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,150,100);
    scene.add(light);

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    
    var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    scene.add(skyBox);
    scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );

    var light2 = new THREE.AmbientLight(0x444444);
    scene.add(light2);

    var moon = new THREE.Mesh( sphereGeom.clone(), moonMaterial1 );
    moon.position.set(-100, 50, 0);
    scene.add( moon );        
    
    var moon = new THREE.Mesh( sphereGeom.clone(), moonMaterial2 );
    moon.position.set(0, 50, 0);
    scene.add( moon );                
    
    var moon = new THREE.Mesh( sphereGeom.clone(), moonMaterial3 );
    moon.position.set(100, 50, 0);
    scene.add( moon );     

    var lightbulb = new THREE.Mesh( 
            new THREE.SphereGeometry( 10, 16, 8 ), 
            new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
    );
    lightbulb.position = light.position;
    scene.add( lightbulb );
    
    var crate = new THREE.Mesh( cubeGeometry.clone(), crateMaterial );
    crate.position.set(-60, 50, -100);
    scene.add( crate );

    var DiceBlueGeom = new THREE.CubeGeometry( 85, 85, 85, 1, 1, 1 );
    var DiceBlue = new THREE.Mesh( DiceBlueGeom, DiceBlueMaterial );
    DiceBlue.position.set(60, 50, -100);
    scene.add( DiceBlue );
};

var exports = app;
