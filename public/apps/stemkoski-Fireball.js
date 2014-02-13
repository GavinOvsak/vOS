var app = {};
app.setUpKeyboard = function(keyboard) {
/*	var right = new VRK.Button(8, 1, 2, 1);
	keyboard.add(right);
	right.onClick(function() { 
		console.log('right click');
	});*/
}
app.name = 'Fireball Demo';
app.icon = 'http://msfastro.net/Images/galaxy_icon.gif';

var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set( 10, 10 );
var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);

var lavaTexture = new THREE.ImageUtils.loadTexture( 'images/lava.jpg');
lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping; 
// multiplier for distortion speed                 
var baseSpeed = 0.02;
// number of times to repeat texture in each direction
var repeatS = repeatT = 4.0;

// texture used to generate "randomness", distort all other textures
var noiseTexture = new THREE.ImageUtils.loadTexture( 'images/cloud.png' );
noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 

// magnitude of noise effect
var noiseScale = 0.5;

// texture to additively blend with base image texture
var blendTexture = new THREE.ImageUtils.loadTexture( 'images/lava.jpg' );
blendTexture.wrapS = blendTexture.wrapT = THREE.RepeatWrapping; 
// multiplier for distortion speed 
var blendSpeed = 0.01;
// adjust lightness/darkness of blended texture
var blendOffset = 0.25;

// texture to determine normal displacement
var bumpTexture = noiseTexture;
bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 
// multiplier for distortion speed                 
var bumpSpeed   = 0.15;
// magnitude of normal displacement
var bumpScale   = 40.0;

// use "this." to create global object
this.customUniforms = {
        baseTexture:         { type: "t", value: lavaTexture },
        baseSpeed:                { type: "f", value: baseSpeed },
        repeatS:                { type: "f", value: repeatS },
        repeatT:                { type: "f", value: repeatT },
        noiseTexture:        { type: "t", value: noiseTexture },
        noiseScale:                { type: "f", value: noiseScale },
        blendTexture:        { type: "t", value: blendTexture },
        blendSpeed:         { type: "f", value: blendSpeed },
        blendOffset:         { type: "f", value: blendOffset },
        bumpTexture:        { type: "t", value: bumpTexture },
        bumpSpeed:                 { type: "f", value: bumpSpeed },
        bumpScale:                 { type: "f", value: bumpScale },
        alpha:                         { type: "f", value: 1.0 },
        time:                         { type: "f", value: 1.0 }
};

// create custom material from the shader code above
//   that is within specially labeled script tags
var customMaterial = new THREE.ShaderMaterial( 
{
    uniforms: customUniforms,
        vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent
}   );
        
var ballGeometry = new THREE.SphereGeometry( 60, 64, 64 );

app.drawFront = function(scene) {
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,250,0);
    scene.add(light);
    // FLOOR
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    // SKYBOX/FOG
    scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );

    var ball = new THREE.Mesh(        ballGeometry, customMaterial );
    ball.position.set(0, 65, 160);
    scene.add( ball );
};

var exports = app;