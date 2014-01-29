var app = {};
app.setUpKeyboard = function(keyboard) {
/*	var right = new VRK.Button(8, 1, 2, 1);
	keyboard.add(right);
	right.onClick(function() { 
		console.log('right click');
	});*/
}
app.name = 'Skybox Demo';
app.icon = 'http://msfastro.net/Images/galaxy_icon.gif';

var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set( 10, 10 );
var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);

var imagePrefix = "images/dawnmountain-";
var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
var imageSuffix = ".png";

var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );        
var materialArray = [];
for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.BackSide
        }));
var skyMaterial = new THREE.MeshFaceMaterial( materialArray );

app.drawFront = function(scene) {
    debugger;
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,250,0);
    scene.add(light);

    // FLOOR
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    
    // axes
    var axes = new THREE.AxisHelper(100);
    scene.add( axes );
    
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );
};

var exports = app;