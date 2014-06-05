//console.log(vOS)

vOS.onEvent('load', function(app) {
	var stars = [];
	var starCount = 100;
	var width = 100;
	var depth = 300;
	var speed = 1;

	var keyboard = new Controls.Keyboard(0,0,12,7, {});
    app.panel.add(keyboard);

    var output = new Controls.Label(0,7,12,1, {text: ''});
    app.panel.add(output);

    keyboard.onTextUpdate(function(text) {
    	output.updateOptions({
    		text: text
    	});
    });

    app.name = "Welcome to vOS";

	app.drawContained = function(scene) {
/*		var testText = vOS.makeTextMesh({
			width: 100,
			height: 40,
			text: ''
		})*/
		//Draw output on screen
//		console.log(vOS.getValue('Accel').x)
	};

	app.drawImmersive = function(scene) {
		//random in 2D grid at y = 300. List of points and steadily moves less y
		//console.log(stars.length);
		if (stars.length < starCount) {
			stars.push({
				x: (Math.random() - 0.5) * width,
				y: (Math.random() - 0.5) * width,
				z: depth
			});
		}

		for (i in stars) {
			var pointLight = new THREE.PointLight(0xFFFFFF);
			pointLight.position.x = stars[i].x;
			pointLight.position.y = stars[i].y;
			pointLight.position.z = stars[i].z;
			scene.add(pointLight);

			if (stars[i].z < -1 * speed)
				stars.splice(i, 1);
			stars[i].z -= speed;
		}
		app.drawContained(scene);
	};

	app.drawImmersiveBackground = function(scene) {
		app.drawImmersive(scene);
	};
});

vOS.onEvent('close', function(app) {

});
