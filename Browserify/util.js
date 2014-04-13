var util = exports;

var eccentricity = 80/30;
util.makeCircle = function(amplitude) {
	var circle_resolution = 40;
	var greenLine = new THREE.LineBasicMaterial({color: 0x999999, linewidth: 2, });
	var circle_geometry = new THREE.Geometry();
	for(var j = 0; j <= circle_resolution; j++) {
		var theta = (j / circle_resolution) * Math.PI * 2;
		circle_geometry.vertices.push( new THREE.Vector3(amplitude * Math.cos(theta), amplitude * Math.sin(theta)* eccentricity, 0));
	}
	return new THREE.Line(circle_geometry, greenLine);
};

util.makeFullCircle = function(amplitude) {

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

util.inRange = function(test, start, span) {
	return start < test && test < start + span;
}

util.makeText = function(text, px, width, height) {
	var canvas1 = document.createElement('canvas');
	canvas1.height = px + 10;
	canvas1.width = width * 700;
    var context1 = canvas1.getContext('2d');
    context1.font = "Bold " + px + "px Arial";
    context1.fillStyle = "rgba(255,255,255,0.95)";
    context1.fillText(" " + text, 0, px);
    var texture1 = new THREE.Texture(canvas1) 
    texture1.needsUpdate = true;
    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side: THREE.DoubleSide } );
    material1.transparent = true;
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material1);
};


util.setPanelPosition = function(board, Mesh, x_disp, y_disp, z_disp){
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

util.rectContains = function(point, x, y, width, height) {
	return point.x > x && point.x < x + width && point.y > y && point.y < y + height;
};

util.vector = function(a, b) {
	return {x: b.x-a.x, y: b.y-a.y};
};

util.dot = function(a, b) {
	return a.x*b.x+a.y*b.y;
};

util.length = function(a) {
	return Math.sqrt(a.x*a.x+a.y*a.y);
};

util.distance = function(a, b) {
	return util.length(util.vector(a,b));
};

util.angle = function(a, b) {
	return Math.acos(util.dot(a,b)/(util.length(a)*util.length(b)));
};

util.rotate = function(a, theta) {
	return {
		x: a.x * Math.cos(theta) - a.y * Math.sin(theta),
		y: a.x * Math.sin(theta) + a.y * Math.cos(theta)
	};
};

util.add = function(a, b) {
	return {
		x: a.x+b.x, 
		y: a.y+b.y
	};
};

util.scale = function(a, x_scale, y_scale) {
	return {
		x: a.x*x_scale,
		y: a.y*y_scale
	};
};

util.angleRangeDeg = function(angle) {
  angle %= 360;
  if (angle < 0) angle += 360;
  return angle;
};

util.angleRangeRad = function(angle) {
  angle %= 2*Math.PI;
  if (angle < 0) angle += 2*Math.PI;
  return angle;
};

util.deltaAngleDeg = function(a,b) {
  return Math.min(360-(Math.abs(a-b)%360),Math.abs(a-b)%360);
};

util.toggleFullScreen = function() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
      (!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
};

//Doesn't actually seem to be synchronous.
util.getScriptSync = function(url, callback) {
	$.ajax({
        async:false,
        type:'GET',
        url:url,
        data:null,
        success:callback,
        dataType:'script',
        timeout: 500
    });
};

//Doesn't actually seem to be synchronous.
util.getSync = function(url, callback) {
	$.ajax({
    	async: false,
		url: url,
		success: callback
	});
}

util.match = function(path, word) {
	/* Checks if a word is present in a path or not. */
	var letters = word.split('');
	for (i in letters) {
		var index = path.indexOf(letters[i]);
		if (index < 0)
			return false;
		path = path.substring(index + 1);
	}
	return true;
};
 
util.get_keyboard_row = function( char ) {
    // Returns the row number of the character
    var keyboardLayout = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    for (row_no in keyboardLayout) {
        if (keyboardLayout[row_no].indexOf(char) >= 0) {
            return row_no;
        }
    }
};
 
util.compress = function(sequence) {
    // Removes redundant sequential characters. ex : 11123311 => 1231
    var ret_val = [ sequence[0] ];
    for (i in sequence) {
        if (ret_val[ret_val.length - 1] != sequence[i]) {
            ret_val.push(sequence[i]);
        }
    }
    return ret_val;
};

util.get_minimum_wordlength = function(path) {
    /*
    Returns the minimum possible word length from the path.
    Uses the number of transitions from different rows in 
    the keyboard layout to determin the minimum length
    */
    row_numbers = path.split('').map(util.get_keyboard_row);
    compressed_row_numbers = util.compress(row_numbers);
    return compressed_row_numbers.length - 3;
};

util.get_suggestion = function(state, path, probs) {
    /* Returns suggestions for a given path. */
 
    if (path.length == 0)
      return [];
    var suggestions = state.wordlist.filter( function(x) {
    	return /*x[0] == path[0].toLowerCase() &&*/ x[x.length - 1] == path[path.length - 1].toLowerCase();
    });

//    console.log(suggestions);

    suggestions = suggestions.filter(function(x) { 
    	return util.match(path.toLowerCase(), x);
    });
 
    console.log(suggestions);

    var min_length = util.get_minimum_wordlength(path.toLowerCase());
    console.log(min_length);
    suggestions = suggestions.filter(function(x) { 
    	return x.length > min_length;
    });
 
    return suggestions;
};

