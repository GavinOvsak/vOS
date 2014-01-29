var app = {};
app.setUpKeyboard = function(keyboard) {
/*	var right = new VRK.Button(8, 1, 2, 1);
	keyboard.add(right);
	right.onClick(function() {
		console.log('right click');
	});*/
}
app.name = 'Reflection Demo';
app.icon = 'http://msfastro.net/Images/galaxy_icon.gif';

var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set( 10, 10 );
var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side:THREE.BackSide } );
var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);

var materialArray = [];
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-xpos.png' ) }));
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-xneg.png' ) }));
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-ypos.png' ) }));
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-yneg.png' ) }));
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-zpos.png' ) }));
materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-zneg.png' ) }));
for (var i = 0; i < 6; i++)
   materialArray[i].side = THREE.BackSide;
var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
var skyboxGeom = new THREE.CubeGeometry( 5000, 5000, 5000, 1, 1, 1 );

var cubeGeom = new THREE.CubeGeometry(100, 100, 10, 1, 1, 1);
var sphereGeom =  new THREE.SphereGeometry( 50, 32, 16 ); // radius, segmentsWidth, segmentsHeight

var mirrorCubeCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
var mirrorCubeMaterial = new THREE.MeshBasicMaterial( { envMap: mirrorCubeCamera.renderTarget } );

app.drawFront = function(scene) {
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,250,0);
    scene.add(light);

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    
    var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
    scene.add( skybox );

    // mirrorCubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    scene.add( mirrorCubeCamera );
    mirrorCube = new THREE.Mesh( cubeGeom, mirrorCubeMaterial );
    mirrorCube.position.set(-75,50,0);
    mirrorCubeCamera.position = mirrorCube.position;
    scene.add(mirrorCube);        
    
    var mirrorSphereCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
    // mirrorCubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    scene.add( mirrorSphereCamera );
    var mirrorSphereMaterial = new THREE.MeshBasicMaterial( { envMap: mirrorSphereCamera.renderTarget } );
    mirrorSphere = new THREE.Mesh( sphereGeom, mirrorSphereMaterial );
    mirrorSphere.position.set(75,50,0);
    mirrorSphereCamera.position = mirrorSphere.position;
    scene.add(mirrorSphere);
};

var exports = app;
