// ----- Utility Functions -------

var eccentricity = 80/30;
var makeCircle = function(amplitude) {
	var circle_resolution = 40;
	var greenLine = new THREE.LineBasicMaterial({color: 0x999999});
	var circle_geometry = new THREE.Geometry();
	for(var j = 0; j <= circle_resolution; j++) {
		var theta = (j / circle_resolution) * Math.PI * 2;
		circle_geometry.vertices.push( new THREE.Vector3(amplitude * Math.cos(theta), amplitude * Math.sin(theta)* eccentricity, 0));
	}
	return new THREE.Line(circle_geometry, greenLine);
};

var makeFullCircle = function(amplitude) {

	var circle_resolution = 40;
	var green = new THREE.LineBasicMaterial({color: 0x333333});
	var circle = new THREE.Shape();

	for(var j = 0; j <= circle_resolution; j++) {
		var theta = (j / circle_resolution) * Math.PI * 2;
		var x = amplitude * Math.cos(theta);
		var y = amplitude * Math.sin(theta) * eccentricity;
		if (j== 0) {
		    circle.moveTo(x, y);
		} else {
		    circle.lineTo(x, y);
		}
	}

	var geometry = circle.makeGeometry();
	return new THREE.Mesh(geometry, green);
};

var setKeyboardPosition = function(board, Mesh, x_disp, y_disp, z_disp){
	var width = 0,
		height = 0;
	if (Mesh.geometry.width) {
		width = Mesh.geometry.width * board.geometry.width;
	}
	if (Mesh.geometry.height) {
		height = Mesh.geometry.height * board.geometry.height;
	}
	Mesh.scale.x = board.geometry.width;
	Mesh.scale.y = board.geometry.height;
	
	var adjusted_x_disp = board.geometry.width * (x_disp - 0.5) + width/2;
	var adjusted_y_disp = board.geometry.height * (y_disp - 0.5) + height/2;

	Mesh.position.x = board.position.x + adjusted_x_disp;
	Mesh.position.y = board.position.y + adjusted_y_disp * Math.cos(board.rotation.x) - z_disp * Math.sin(board.rotation.x);
	Mesh.position.z = board.position.z + adjusted_y_disp * Math.sin(board.rotation.x) + z_disp * Math.cos(board.rotation.x);

	Mesh.rotation.x = board.rotation.x;
};

var rectContains = function(point, x, y, width, height) {
	return point.x > x && point.x < x + width && point.y > y && point.y < y + height;
};

var vector = function(a, b) {
	return {x: b.x-a.x, y: b.y-a.y};
};

var dot = function(a, b) {
	return a.x*b.x+a.y*b.y;
};

var length = function(a) {
	return Math.sqrt(a.x*a.x+a.y*a.y);
};

var distance = function(a, b) {
	return length(vector(a,b));
};

var angle = function(a, b) {
	return Math.acos(dot(a,b)/(length(a)*length(b)));
};

var rotate = function(a, theta) {
	return {
		x: a.x * Math.cos(theta) - a.y * Math.sin(theta),
		y: a.x * Math.sin(theta) + a.y * Math.cos(theta)
	};
};

var add = function(a, b) {
	return {
		x: a.x+b.x, 
		y: a.y+b.y
	};
};

var scale = function(a, x_scale, y_scale) {
	return {
		x: a.x*x_scale,
		y: a.y*y_scale
	};
};
