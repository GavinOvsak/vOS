
vOS.onEvent('load', function(app) {

    var position = {};

    var difficulty = 'easy';

       var resetPosition = function() {
        position = {
            x: 0,
            y: -50,
            z: 30,
            theta: 0,
            phi: difficulty == 'hard' ? 0.1 : 0,
            delta: {
                theta: 0,
                phi: 0
            },
            speed: 10
        };
    };

    resetPosition();

    var gravity = 1;


    var set_immersive_control = function(mesh, no_translate) {
        if (no_translate == undefined)
            no_translate = false;

        var translation = new THREE.Matrix4().makeTranslation(
            mesh.position.x, mesh.position.y, mesh.position.z);
        if (!no_translate) {
            translation.makeTranslation(mesh.position.x - position.x, 
                mesh.position.y - position.y, 
                mesh.position.z - position.z);
        }

        var x_tilt = new THREE.Matrix4();
        x_tilt.makeRotationX(-1 * position.phi);

        var o_tilt = new THREE.Matrix4();
        o_tilt.multiplyMatrices(o_tilt, new THREE.Matrix4().makeRotationX(mesh.rotation.x));
        o_tilt.multiplyMatrices(o_tilt, new THREE.Matrix4().makeRotationY(mesh.rotation.y));
        o_tilt.multiplyMatrices(o_tilt, new THREE.Matrix4().makeRotationZ(mesh.rotation.z));

        var rotation = new THREE.Matrix4();
        rotation.makeRotationZ(-1 * position.theta);

        var product = new THREE.Matrix4();
        product.multiplyMatrices(x_tilt, rotation);
        product.multiplyMatrices(product, translation);
        product.multiplyMatrices(product, o_tilt);

        mesh.applyMatrix(product);
        mesh.geometry.verticesNeedUpdate = true;
    };

    THREE.ImageUtils.crossOrigin = "anonymous";
    var floorGeometry = new THREE.PlaneGeometry(10000, 10000, 10, 10);
    var floorMaterial = new THREE.MeshBasicMaterial( { 
        map: THREE.ImageUtils.loadTexture( 'http://vos.jit.su/static/images/satelliteImage.jpg' ), 
        side: THREE.DoubleSide } );
    //floorMaterial.map.wrapS = floorMaterial.map.wrapT = THREE.RepeatWrapping;
    floorMaterial.map.needsUpdate = true;
    //floorMaterial.map.repeat.set( 1, 1 );
    floorGeometry.uvsNeedUpdate = true;

    var modes = {
        start: 'start',
        playing: 'playing',
        paused: 'paused',
        restart: 'restart'
    };

    var mode = modes.start;
    var oldMode;

        var setPanel = function() {
           switch(mode) {
            case modes.start:
                var easyButton = new Controls.Button(1, 4, 4, 1, {
                    text: 'Play Easy Mode'
                });
                easyButton.onClick(function(){
                    difficulty = 'easy';
                    mode = modes.playing;
                });

                var hardButton = new Controls.Button(6, 4, 4, 1, {
                    text: 'Play Hard Mode'
                });
                hardButton.onClick(function(){
                    difficulty = 'hard';
                    mode = modes.playing;
                });

                app.panel.set([easyButton, hardButton]);
                break;
            case modes.playing:
                var direction = new Controls.Joystick(3, 5, 1, 1, {
                    radius: 1.5
                });
                direction.onMove(function(x, y) {
                    position.delta.theta = -0.1 * Math.PI * x;
                    position.delta.phi = 0.02 * Math.PI * y;
                });

                var speed = new Controls.LinearSlider(6, 1, 1, 6, {
                    returnsToCenter: false, 
                    initProgress: Math.max(Math.min(position.speed / 20, 1), 0),
                    direction: Controls.LinearSlider.direction.VERTICAL
                });
                speed.onMove(function(progress) {
                    position.speed = 20 * progress;
                });

                var pause = new Controls.Button(9, 6, 3, 1, {
                    text: 'Pause Game'
                });
                pause.onClick(function(){
                    mode = modes.paused;
                });
                
                app.panel.set([direction, speed, pause]);
                break;
            case modes.paused:
                var resume = new Controls.Button(1, 4, 4, 1, {
                    text: 'Resume Game'
                });
                resume.onClick(function(){
                    mode = modes.playing;
                });

                var restart = new Controls.Button(6, 4, 4, 1, {
                    text: 'Restart Game'
                });
                restart.onClick(function(){
                    resetPosition();
                    mode = modes.restart;
                });

                app.panel.set([resume, restart]);
                break;
            case modes.restart:

                    var again = new Controls.Label(2, 6, 6, 1, {
                    text: 'Want to Play Again?'
                });
        
                var easyButton = new Controls.Button(1, 4, 4, 1, {
                    text: 'Play Easy Mode'
                });
                easyButton.onClick(function(){
                    difficulty = 'easy';
                    resetPosition();
                    mode = modes.playing;
                });

                var hardButton = new Controls.Button(6, 4, 4, 1, {
                    text: 'Play Hard Mode'
                });
                hardButton.onClick(function(){
                    difficulty = 'hard';
                    resetPosition();
                    mode = modes.playing;
                });

                app.panel.set([easyButton, hardButton, again]);
                break;
        };
    }

    var sign = function(x) {
        return x / Math.abs(x);
    };


    app.drawImmersive = function(scene) {
        var centerFloorTile = new THREE.Mesh(floorGeometry, floorMaterial);

        centerFloorTile.position.x = Math.floor(position.x / floorGeometry.parameters.width + 0.5) * floorGeometry.parameters.width;
        centerFloorTile.position.y = Math.floor(position.y / floorGeometry.parameters.height + 0.5) * floorGeometry.parameters.height;
        set_immersive_control(centerFloorTile);
        scene.add(centerFloorTile);

        var percentX = ((position.x + (Math.abs(Math.floor(position.x / floorGeometry.parameters.width)) + 1) * floorGeometry.parameters.width) % floorGeometry.parameters.width) / floorGeometry.parameters.width;
        var percentY = ((position.y + (Math.abs(Math.floor(position.y / floorGeometry.parameters.height)) + 1) * floorGeometry.parameters.height) % floorGeometry.parameters.height) / floorGeometry.parameters.height;

        var xSupplementalFloorTile = new THREE.Mesh(floorGeometry, floorMaterial);
        if (percentX > 0.5) {
            xSupplementalFloorTile.position.x = (Math.floor(position.x / floorGeometry.parameters.width + 0.5) - 1) * floorGeometry.parameters.width;
        } else {
            xSupplementalFloorTile.position.x = (Math.floor(position.x / floorGeometry.parameters.width + 0.5) + 1) * floorGeometry.parameters.width;
        }
        xSupplementalFloorTile.position.y = Math.floor(position.y / floorGeometry.parameters.height + 0.5) * floorGeometry.parameters.height;
        set_immersive_control(xSupplementalFloorTile);
        scene.add(xSupplementalFloorTile);

        var ySupplementalFloorTile = new THREE.Mesh(floorGeometry, floorMaterial);
        if (percentY > 0.5) {
            ySupplementalFloorTile.position.y = (Math.floor(position.y / floorGeometry.parameters.height + 0.5) - 1) * floorGeometry.parameters.height;
        } else {
            ySupplementalFloorTile.position.y = (Math.floor(position.y / floorGeometry.parameters.height + 0.5) + 1) * floorGeometry.parameters.height;
        }
        ySupplementalFloorTile.position.x = Math.floor(position.x / floorGeometry.parameters.width + 0.5) * floorGeometry.parameters.width;
        set_immersive_control(ySupplementalFloorTile);
        scene.add(ySupplementalFloorTile);

        var xySupplementalFloorTile = new THREE.Mesh(floorGeometry, floorMaterial);
        if (percentX > 0.5) {
            xySupplementalFloorTile.position.x = (Math.floor(position.x / floorGeometry.parameters.width + 0.5) - 1) * floorGeometry.parameters.width;
        } else {
            xySupplementalFloorTile.position.x = (Math.floor(position.x / floorGeometry.parameters.width + 0.5) + 1) * floorGeometry.parameters.width;
        }
        if (percentY > 0.5) {
            xySupplementalFloorTile.position.y = (Math.floor(position.y / floorGeometry.parameters.height + 0.5) - 1) * floorGeometry.parameters.height;
        } else {
            xySupplementalFloorTile.position.y = (Math.floor(position.y / floorGeometry.parameters.height + 0.5) + 1) * floorGeometry.parameters.height;
        }
        set_immersive_control(xySupplementalFloorTile);
        scene.add(xySupplementalFloorTile);

        if (oldMode != mode)
            setPanel();
        oldMode = mode;

        switch(mode) {
            case modes.start:
                //Draw Instructions
                var testText = vOS.makeTextMesh({
                    text: 'Welcome to vOS Flight', 
                    px: 30, 
                    width: 100, 
                    height: 20
                });
                testText.rotation.x = Math.PI / 2;
                testText.position.y = 200;
                testText.position.z = 50;
                scene.add(testText)
                break;
            case modes.paused:
                break;
            case modes.restart:
                //Show High Scores?

                break;
            case modes.playing:
                var altitude = vOS.makeTextMesh({
                    text: 'Altitude: ' + Math.round(position.z * 10), 
                    px: 30, 
                    width: 60, 
                    height: 15
                });
                altitude.rotation.x = Math.PI / 2;
                altitude.position.y = 200;
                altitude.position.x = -50;
                altitude.position.z = 40;
                scene.add(altitude)

                //show altitude on screen, compass, time taken

                position.theta += position.delta.theta;
                position.phi += position.delta.phi;
                var vector = {
                    x: -1*Math.sin(position.theta) * Math.cos(position.phi),
                    y: Math.cos(position.theta) * Math.cos(position.phi),
                    z: Math.sin(position.phi)
                };
                position.x += position.speed * vector.x;
                position.y += position.speed * vector.y;
                position.z += position.speed * vector.z;

                if (difficulty == 'hard') {
                    position.z -= gravity;
                }

                if (position.z <= 0) {
                    mode = modes.restart;
                    resetPosition();
                }

                break;
        }

        //Make hoops
        //Make infinite ground

        //Hoops show up at variable heights, steady intervals, and three different positions: left, center, right.
        //After 10 hoops, end with time taken and ask to try again.

        //show altitude on screen, compass, time taken
    };

    app.drawImmersiveBackground = function(scene) {
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.z = -30;
        set_immersive_control(floor);
        scene.add(floor);

        mode = modes.paused;
        if (oldMode != mode)
            setPanel();
        oldMode = mode;
    };

});
