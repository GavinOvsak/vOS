var app = {};
app.setUpKeyboard = function(keyboard) {
/*	var right = new VRK.Button(8, 1, 2, 1);
	keyboard.add(right);
	right.onClick(function() { 
		console.log('right click');
	});*/
}
app.name = 'CSS3D Demo';
app.icon = 'http://msfastro.net/Images/galaxy_icon.gif';

    var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
    floorTexture.repeat.set( 10, 10 );
    var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);

    var planeMaterial   = new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide });
    var planeWidth = 360;
    var planeHeight = 120;
    var planeGeometry = new THREE.PlaneGeometry( planeWidth, planeHeight );

app.drawFront = function(scene) {
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,250,0);
    scene.add(light);
    // FLOOR
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    
    var planeMesh= new THREE.Mesh( planeGeometry, planeMaterial );
    planeMesh.position.y += planeHeight/2;
    // add it to the standard (WebGL) scene
    scene.add(planeMesh);
    
    // create a new scene to hold CSS
    cssScene = new THREE.Scene();
    // create the iframe to contain webpage
    var element        = document.createElement('iframe')
    // webpage to be loaded into iframe
    element.src        = "index.html";
    // width of iframe in pixels
    var elementWidth = 1024;
    // force iframe to have same relative dimensions as planeGeometry
    var aspectRatio = planeHeight / planeWidth;
    var elementHeight = elementWidth * aspectRatio;
    element.style.width  = elementWidth + "px";
    element.style.height = elementHeight + "px";
    
    // create a CSS3DObject to display element
    var cssObject = new THREE.CSS3DObject( element );
    // synchronize cssObject position/rotation with planeMesh position/rotation 
    cssObject.position = planeMesh.position;
    cssObject.rotation = planeMesh.rotation;
    // resize cssObject to same size as planeMesh (plus a border)
    var percentBorder = 0.05;
    cssObject.scale.x /= (1 + percentBorder) * (elementWidth / planeWidth);
    cssObject.scale.y /= (1 + percentBorder) * (elementWidth / planeWidth);
    cssScene.add(cssObject);
};

var exports = app;