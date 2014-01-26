var galaxy = {};
galaxy.setUpKeyboard = function(keyboard) {
	var right = new VRK.Button(8, 1, 2, 1);
	keyboard.add(right);
	right.onClick(function() {
		console.log('right click');
	});
}
/*galaxy.drawFront = function(scene) {

};*/
galaxy.drawBack = function(scene) {
	var blueLambert = new THREE.MeshLambertMaterial({ color: 0x0000CC });
	var radius = 20,
    segments = 16,
    rings = 16;

	var sphere = new THREE.Mesh(
	  new THREE.SphereGeometry(
	    radius,
	    segments,
	    rings),
	  blueLambert);

	var angle = (Date.now()%5000)/5000*2*Math.PI;
	sphere.position.x = 200*Math.cos(angle);
	sphere.position.y = 40;

	sphere.position.z = 100+200*Math.sin(angle);

	scene.add(sphere);
};
galaxy.drawFrontAndBack = function(scene) {
//	galaxy.drawFront(scene);
	galaxy.drawBack(scene);
};

var exports = galaxy;