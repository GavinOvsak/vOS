var app = {};
app.setUpKeyboard = function(keyboard) {
/*	var right = new VRK.Button(8, 1, 2, 1);
	keyboard.add(right);
	right.onClick(function() { 
		console.log('right click');
	});*/
}
app.name = 'Bubbles Demo';
app.icon = 'http://msfastro.net/Images/galaxy_icon.gif';

var clock = new THREE.Clock();

var imagePrefix = "images/dawnmountain-";
var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
var imageSuffix = ".png";
var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );        

var urls = [];
for (var i = 0; i < 6; i++)
        urls.push( imagePrefix + directions[i] + imageSuffix );

var materialArray = [];
for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.BackSide
        }));
var skyMaterial = new THREE.MeshFaceMaterial( materialArray );

var axisMin = -5;
var axisMax =  5;
var axisRange = axisMax - axisMin;

var size  = 30; 
var size2 = size*size; 
var size3 = size*size*size;

var points = [];

// generate the list of 3D points
for (var k = 0; k < size; k++)
for (var j = 0; j < size; j++)
for (var i = 0; i < size; i++)
{
        var x = axisMin + axisRange * i / (size - 1);
        var y = axisMin + axisRange * j / (size - 1);
        var z = axisMin + axisRange * k / (size - 1);
        points.push( new THREE.Vector3(x,y,z) );
}
    
var values = [];
// initialize values
for (var i = 0; i < size3; i++) 
        values[i] = 0;
 
// resetValues();
addBall( points, values, new THREE.Vector3(0,3.5,0) );
addBall( points, values, new THREE.Vector3(0,0,0) );
addBall( points, values, new THREE.Vector3(-1,-1,0) );

// isolevel = 0.5;
var geometry = marchingCubes( points, values, 0.5 );

// release the bubbles!
var textureCube = THREE.ImageUtils.loadTextureCube( urls );
textureCube.format = THREE.RGBFormat;
var fShader = THREE.FresnelShader;
var fresnelUniforms = 
{
        "mRefractionRatio": { type: "f", value: 1.02 },
        "mFresnelBias":         { type: "f", value: 0.1 },
        "mFresnelPower":         { type: "f", value: 2.0 },
        "mFresnelScale":         { type: "f", value: 1.0 },
        "tCube":                         { type: "t", value: textureCube }
};        
// create custom material for the shader
var customMaterial = new THREE.ShaderMaterial( 
{
    uniforms:                 fresnelUniforms,
        vertexShader:   fShader.vertexShader,
        fragmentShader: fShader.fragmentShader
}   );

// bubbles like to move around
var ballUpdate = function(t, scene)
{
        resetValues( values );
        addBall( points, values, new THREE.Vector3( 2.0 * Math.cos(1.1 * t), 1.5 * Math.sin(1.6 * t), 3.0 * Math.sin(1.0 * t) ) );
        addBall( points, values, new THREE.Vector3( 2.4 * Math.sin(1.8 * t), 1.5 * Math.sin(1.3 * t), 1.9 * Math.cos(1.9 * t) ) );
        addBall( points, values, new THREE.Vector3( 3.0 * Math.cos(1.5 * t), 2.5 * Math.cos(1.2 * t), 2.1 * Math.sin(1.7 * t) ) );
                
        scene.remove( mesh );
        var newGeometry = marchingCubes( points, values, 0.5 );
        mesh = new THREE.Mesh( newGeometry, customMaterial );
        scene.add( mesh );
}

app.drawFront = function(scene) {
    var light = new THREE.PointLight(0xff0000);
    light.position.set(10,0,0);
    scene.add(light);
    var light = new THREE.PointLight(0x00cc00);
    light.position.set(0,10,0);
    scene.add(light);
    var light = new THREE.PointLight(0x0000ff);
    light.position.set(0,0,10);
    scene.add(light);
    var light = new THREE.PointLight(0x333333);
    light.position.set(-10,-10,-10);
    scene.add(light);
    
    // SKYBOX
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );
    
    var mesh = new THREE.Mesh( geometry, customMaterial );
    scene.add(mesh);

    var t = clock.getElapsedTime();
    ballUpdate(0.5 * t, scene);
};

var exports = app;