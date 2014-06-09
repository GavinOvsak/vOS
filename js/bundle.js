(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var appSwitcher;

appSwitcher = exports;

appSwitcher.setUp = function(state, util, controls) {
  var mode, modes, query, resetPanel, searchResults, selectionIndex, update;
  state.notificationPanel = new controls.Panel();
  state.notificationPanel.objects = [];
  state.appSwitcher = {
    index: -1,
    panel: new controls.Panel(),
    external: {}
  };
  searchResults = [];
  selectionIndex = 0;
  modes = ['Recent', 'Search'];
  mode = modes[0];
  state.appSwitcher.external.drawContained = function(scene) {
    var i, testText, text, _i, _ref, _results;
    if (mode === 'Search' && searchResults.length > 0) {
      _results = [];
      for (i = _i = 0, _ref = searchResults.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        text = selectionIndex === i ? '> ' + searchResults[i].name : searchResults[i].name;
        testText = util.makeText(text, 30, 100, 20);
        testText.rotation.x = Math.PI / 2;
        testText.position.y = 200;
        testText.position.z = 50 + (selectionIndex - i) * 20;
        _results.push(scene.add(testText));
      }
      return _results;

      /*
      			greenScreen = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
      			screen = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), greenScreen)
      			screen.rotation.x = Math.PI / 2
      			screen.position.z = 50
      			scene.add(screen)
       */
    }
  };
  query = '';
  resetPanel = function(panel) {
    var app, appIcon, column, description, drag, goToSearch, i, input, output, recentButton, row, search, select, yref, _i, _ref;
    panel.objects = [];
    if (mode === modes[0]) {
      row = 0;
      column = 0;
      app;
      for (i = _i = 0, _ref = state.apps.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (!(row < 3)) {
          continue;
        }
        app = state.apps[i];
        appIcon = new controls.Button(0.5 + column * 6, 5 - 2 * row, 5, 1, {
          text: app.name,
          icon: app.icon
        });
        appIcon.onClick((function(index) {
          return function() {
            return state.open(state.apps[index]);
          };
        })(i));
        panel.add(appIcon);
        if (column >= 2) {
          column = 0;
          row++;
        } else {
          column++;
        }
      }
      description = new controls.Label(6, 7, 6, 1, {
        text: 'Please choose an app: '
      });
      panel.add(description);
      goToSearch = new controls.Button(0, 7, 3, 1, {
        text: 'Go to Search'
      });
      goToSearch.onClick(function() {
        console.log('Searching!');
        mode = modes[1];
        return resetPanel(panel);
      });
      return panel.add(goToSearch);
    } else if (mode === modes[1]) {
      input = new Controls.Keyboard(0, 0, 9, 6);
      panel.add(input);
      drag = new Controls.Treadmill(9.5, 3, 2, 2, {
        y: true
      });
      panel.add(drag);
      yref = 0;
      drag.onMove(function(x, y) {
        var increments;
        increments = 0.1;
        if (yref - y > (searchResults.length - 1) * increments) {
          yref = y + (searchResults.length - 1) * increments;
        }
        if (yref - y < 0) {
          yref = y;
        }
        return selectionIndex = Math.floor((yref - y) / increments);
      });
      select = new Controls.Button(9.5, 1, 2, 1, {
        text: 'Open'
      });
      panel.add(select);
      select.onClick(function() {
        console.log(searchResults[selectionIndex]);
        return state.addURL(searchResults[selectionIndex].url, searchResults[selectionIndex], true);
      });
      output = new Controls.Label(0, 6, 12, 1, {
        text: ''
      });
      panel.add(output);
      input.onTextUpdate(function(text) {
        query = text;
        return output.updateOptions({
          text: text
        });
      });
      search = new Controls.Button(10, 7, 2, 1, {
        text: 'Search'
      });
      search.onClick(function() {
        console.log('Searching for ' + query);
        console.log("/appSearchJSON?query=" + query);
        return util.getAsync("/appSearchJSON?query=" + query, function(data) {
          searchResults = data;
          return selectionIndex = 0;
        });
      });
      panel.add(search);
      recentButton = new Controls.Button(0, 7, 4, 1, {
        text: '< Recent Apps'
      });
      panel.add(recentButton);
      return recentButton.onClick(function() {
        mode = modes[0];
        return resetPanel(panel);
      });
    }
  };
  update = function() {
    mode = modes[0];
    return resetPanel(state.appSwitcher.panel);
  };
  update();
  return state.onAppListUpdate(update);
};


},{}],2:[function(require,module,exports){
var controlObjects, eccentricity, exports;

eccentricity = 80 / 30;

if (typeof exports === "undefined" || exports === null) {
  controlObjects = {};
  exports = controlObjects;
}

exports.setUp = function(state, util) {
  var controls;
  controls = {};
  controls.Object = function(x, y, width, height, options) {
    var method;
    this.x = (x || 0) * state.unitWidth;
    this.y = (y || 0) * state.unitHeight;
    this.width = (width || 1) * state.unitWidth;
    this.height = (height || 1) * state.unitHeight;
    this.options = options || {};
    for (method in controls.Object.prototype) {
      this[method] = controls.Object.prototype[method];
    }
    return void 0;
  };
  controls.Object.prototype = {
    setX: function(x) {
      return this.x = x;
    },
    setY: function(y) {
      return this.y = y;
    },
    setWidth: function(width) {
      return this.width = width;
    },
    setHeight: function(height) {
      return this.height = height;
    },
    updateOptions: function(options) {
      var option, value, _results;
      _results = [];
      for (option in options) {
        value = options[option];
        _results.push(this.options[option] = value);
      }
      return _results;
    }
  };
  controls.Button = function() {
    controls.Object.apply(this, arguments);
    this.applyDefaults();
    return void 0;
  };
  controls.Button.prototype = {
    applyDefaults: function() {
      var defaultOptions, key, option;
      defaultOptions = {
        text_size: 30,
        text: '',
        toggle: false
      };
      if (this.options == null) {
        this.options = {};
      }
      for (key in defaultOptions) {
        option = defaultOptions[key];
        if (this.options[key] == null) {
          this.options[key] = option;
        }
      }
      this.initGrab = {
        x: 0,
        y: 0
      };
      this.point = void 0;
      return this.isOn = false;
    },
    thickness: 0.1,
    available: true,
    contains: function(x, y) {
      return (this.x < x && x < this.x + this.width) && (this.y < y && y < this.y + this.height);
    },
    onClick_callback: function(isOn) {},
    click: function(isOn) {
      return this.onClick_callback(isOn);
    },
    onClick: function(callback) {
      return this.onClick_callback = callback;
    },
    release: function(x, y) {
      this.available = true;
      if (this.contains(this.point.x, this.point.y)) {
        this.click(!this.isOn);
        if (this.options.toggle) {
          this.isOn = !this.isOn;
        }
      }
      return this.point = void 0;
    },

    /*
    		dragDistance: ->
    			if(this.point?) {
    				return util.distance(this.point, this.initGrab)
    			}
    			return 0
    		},
     */
    registerPoint: function(point) {
      this.initGrab.x = point.x;
      this.initGrab.y = point.y;
      this.point = point;
      point.onRelease(this.release.bind(this));
      return this.available = false;
    },
    draw: function() {
      var buttonMesh, canvas1, contentMesh, material, materialOptions, meshArray, px;
      meshArray = [];
      materialOptions = {};
      if (this.isOn) {
        if (this.point != null) {
          if (this.contains(this.point.x, this.point.y)) {
            materialOptions.color = 200;
          } else {
            materialOptions.color = (100 << 16) + (100 << 8) + 100;
          }
        } else {
          materialOptions.color = 200 << 8;
        }
      } else {
        if (this.point != null) {
          if (this.contains(this.point.x, this.point.y)) {
            materialOptions.color = 200 << 8;
          } else {
            materialOptions.color = (100 << 16) + (100 << 8) + 100;
          }
        } else {
          materialOptions.color = 200;
        }
      }
      material = new THREE.MeshBasicMaterial(materialOptions);
      buttonMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material);
      buttonMesh.position.x = this.x;
      buttonMesh.position.y = this.y;
      buttonMesh.position.z = 0.05;
      meshArray.push(buttonMesh);
      canvas1 = document.createElement('canvas');
      px = this.options.text_size;
      if (this.options.text !== '') {
        contentMesh = util.makeText(this.options.text, px, this.width, this.height);
        contentMesh.position.x = this.x;
        contentMesh.position.y = this.y;
        contentMesh.position.z = 0.1;
        meshArray.push(contentMesh);
      }

      /*
      			else if this.options.image?
      				canvas1.height = 200
      				canvas1.width = 200
      				context1 = canvas1.getContext('2d')
      				texture1 = new THREE.Texture(canvas1) 
      				imageObj = new Image()
      				imageObj.src = this.options.image
      				imageObj.onload = ->
       */

      /*
               context1.drawImage(imageObj, 0, 0)
               if ( texture1 ) {
      				texture1.needsUpdate = true
      				material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } )
      				material1.transparent = true
      				contentMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material1)
      				util.setPanelPosition(panelMesh, contentMesh, this.x, this.y, 0.2)
      				scene.add( contentMesh )
      			}
       */
      return meshArray;
    }
  };
  controls.LinearSlider = function() {
    controls.Object.apply(this, arguments);
    this.applyDefaults();
    return void 0;
  };
  controls.LinearSlider.direction = {
    VERTICAL: 'vertical',
    HORIZONTAL: 'horizontal'
  };
  controls.LinearSlider.prototype = {
    applyDefaults: function() {
      var defaultOptions, key, option;
      defaultOptions = {
        direction: controls.LinearSlider.direction.VERTICAL,
        returnsToCenter: false,
        initProgress: 0.5
      };
      if (this.options == null) {
        this.options = {};
      }
      for (key in defaultOptions) {
        option = defaultOptions[key];
        if (this.options[key] == null) {
          this.options[key] = option;
        }
      }
      this.line_width = 0.1;
      this.grip_height = 0.5;
      this.progress = this.options.initProgress;
      return this.initGrab = {
        x: 0,
        y: 0,
        progress: 0
      };
    },
    available: true,
    point: void 0,
    thickness: 0.1,
    getProgress: function() {
      if (this.progress == null) {
        this.progress = this.options.initProgress || 0.5;
      }
      if (this.point != null) {
        if (this.options.direction === controls.LinearSlider.direction.VERTICAL) {
          this.progress = this.initGrab.progress + (this.point.y - this.initGrab.y) / (this.height - this.grip_height * state.unitHeight);
        } else if (this.options.direction === controls.LinearSlider.direction.HORIZONTAL) {
          this.progress = this.initGrab.progress + (this.point.x - this.initGrab.x) / (this.width - this.grip_height * state.unitWidth);
        }
      }
      this.progress = Math.max(Math.min(this.progress, 1), 0);
      return this.progress;
    },
    contains: function(x, y) {
      if (this.options.direction === controls.LinearSlider.direction.VERTICAL) {
        return x > this.x && x < this.x + this.width && y > this.y + (this.height - this.grip_height * state.unitHeight) * this.progress && y < this.y + (this.height - this.grip_height * state.unitHeight) * this.progress + this.grip_height * state.unitHeight;
      } else if (this.options.direction === controls.LinearSlider.direction.HORIZONTAL) {
        return y > this.y && y < this.y + this.height && x > this.x + (this.width - this.grip_height * state.unitWidth) * this.progress && x < this.x + (this.width - this.grip_height * state.unitWidth) * this.progress + this.grip_height * state.unitWidth;
      }
    },
    onRelease_callback: function(progress) {},
    onRelease: function(callback) {
      return this.onRelease_callback = callback;
    },
    setProgress: function(progress) {
      return this.progress = progress;
    },
    release: function(x, y) {
      this.onRelease_callback(this.getProgress());
      if (this.options.returnsToCenter) {
        this.progress = 0.5;
      }
      this.available = true;
      return this.point = void 0;
    },
    onMove_callback: function(progress) {},
    onMove: function(callback) {
      return this.onMove_callback = callback;
    },
    move: function(x, y) {
      return this.onMove_callback(this.getProgress());
    },
    registerPoint: function(point) {
      this.initGrab.x = point.x;
      this.initGrab.y = point.y;
      this.initGrab.progress = this.progress;
      this.point = point;
      point.onRelease(this.release.bind(this));
      point.onMove(this.move.bind(this));
      return this.available = false;
    },
    draw: function() {
      var gripMesh, grip_material, line, line_material, meshArray;
      meshArray = [];
      line_material = new THREE.MeshBasicMaterial({
        color: 0x222222
      });
      grip_material = new THREE.MeshBasicMaterial({
        color: 0x224222
      });
      if (this.options.direction === controls.LinearSlider.direction.VERTICAL) {
        line = new THREE.Mesh(new THREE.PlaneGeometry(this.line_width * state.unitWidth, this.height), line_material);
        line.position.x = this.x + (this.width - this.line_width * state.unitWidth) / 2;
        line.position.y = this.y;
        line.position.z = 0.05;
        gripMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.grip_height * state.unitHeight), grip_material);
        gripMesh.position.x = this.x;
        gripMesh.position.y = this.y + (this.height - this.grip_height * state.unitHeight) * this.progress;
        gripMesh.position.z = 0.1;
      } else if (this.options.direction === controls.LinearSlider.direction.HORIZONTAL) {
        line = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.line_width * state.unitHeight), line_material);
        line.position.x = this.x;
        line.position.y = this.y + (this.height - this.line_width * state.unitHeight) / 2;
        line.position.z = 0.05;
        gripMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.grip_height * state.unitWidth, this.height), grip_material);
        gripMesh.position.x = this.x + (this.width - this.grip_height * state.unitWidth) * this.progress;
        gripMesh.position.y = this.y;
        gripMesh.position.z = 0.1;
      }
      meshArray.push(line);
      meshArray.push(gripMesh);
      return meshArray;
    }
  };
  controls.Treadmill = function() {
    controls.Object.apply(this, arguments);
    this.applyDefaults();
    return void 0;
  };
  controls.Treadmill.prototype = {
    applyDefaults: function() {
      var defaultOptions, key, option, _results;
      defaultOptions = {
        x: false,
        y: false,
        rotate: false,
        zoom: false,
        zoomIn: false,
        zoomOut: false
      };
      this.options = this.options || {};
      _results = [];
      for (key in defaultOptions) {
        option = defaultOptions[key];
        if (this.options[key] == null) {
          _results.push(this.options[key] = option);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    thickness: 0.1,
    available: true,
    max_fingers: 2,
    state: {
      x: 0,
      y: 0,
      angle: 0,
      zoom: 1
    },
    startState: {
      x: 0,
      y: 0,
      angle: 0,
      zoom: 1
    },
    grabInfo: {
      x: 0,
      y: 0,
      angle: 0,
      zoom: 1
    },
    points: [],
    cloneState: function(state) {
      return {
        x: state.x,
        y: state.y,
        angle: state.angle,
        zoom: state.zoom
      };
    },
    contains: function(x, y) {
      return (this.x < x && x < this.x + this.width) && (this.y < y && y < this.y + this.height);
    },
    onRelease_callback: function(x, y, angle, zoom) {},
    onRelease: function(callback) {
      return this.onRelease_callback = callback;
    },
    release: function(x, y, i) {
      this.onRelease_callback(this.state.x, this.state.y, this.state.angle, this.state.zoom);
      this.available = true;
      this.startState = {
        x: this.state.x,
        y: this.state.y,
        angle: this.state.angle,
        zoom: this.state.zoom
      };
      this.points[i] = void 0;
      return this.setGrabInfo();
    },
    getTouchAngle: function() {
      if (this.getNumPoints() < 2) {
        return 0;
      } else if ((this.points[0] != null) && (this.points[1] != null)) {
        return Math.atan2(this.points[0].x - this.points[1].x, this.points[0].y - this.points[1].y);
      }
      return 0;
    },
    getTouchCenter: function() {
      var point, x, y, _i, _len, _ref;
      x = 0;
      y = 0;
      _ref = this.points;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        point = _ref[_i];
        if (point != null) {
          x += point.x;
          y += point.y;
        }
      }
      return {
        x: x / Math.max(1, this.getNumPoints()),
        y: y / Math.max(1, this.getNumPoints())
      };
    },
    getNumPoints: function() {
      var counter, point, _i, _len, _ref;
      counter = 0;
      _ref = this.points;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        point = _ref[_i];
        counter += (point != null) && (point.x != null) && (point.y != null) ? 1 : 0;
      }
      return counter;
    },
    getTouchSeparation: function() {
      if (this.getNumPoints() < 2) {
        return 1;
      } else if ((this.points[0] != null) && (this.points[1] != null)) {
        return util.distance(this.points[0], this.points[1]);
      }
    },
    setGrabInfo: function() {
      var center;
      center = this.getTouchCenter();
      return this.grabInfo = {
        x: center.x,
        y: center.y,
        angle: this.getTouchAngle(),
        zoom: this.getTouchSeparation()
      };
    },
    registerPoint: function(point) {
      this.startState = this.cloneState(this.state);
      this.points[point.i] = point;
      this.setGrabInfo();
      point.onRelease(this.release.bind(this));
      point.onMove(this.move.bind(this));
      if (this.getNumPoints() >= this.max_fingers) {
        return this.available = false;
      }
    },
    getNewState: function() {
      var disp, newState;
      newState = this.cloneState(this.startState);
      if (this.options.rotate) {
        newState.angle = this.startState.angle + this.getTouchAngle() - this.grabInfo.angle;
      }
      disp = util.vector(this.getTouchCenter(), this.grabInfo);
      if (this.options.x != null) {
        newState.x = this.startState.x + disp.x * Math.cos(newState.angle) - disp.y * Math.sin(newState.angle);
      }
      if (this.options.y != null) {
        newState.y = this.startState.y + disp.x * Math.sin(newState.angle) + disp.y * Math.cos(newState.angle);
      }
      if (this.options.zoom || (this.options.zoomIn && this.grabInfo.zoom > this.getTouchSeparation()) || (this.options.zoomOut && this.grabInfo.zoom < this.getTouchSeparation())) {
        newState.zoom = this.startState.zoom * this.grabInfo.zoom / this.getTouchSeparation();
      }
      return newState;
    },
    onMove_callback: function(x, y, angle, zoom) {},
    onMove: function(callback) {
      return this.onMove_callback = callback;
    },
    move: function(x, y, i) {
      this.state = this.getNewState();
      return this.onMove_callback(this.state.x, this.state.y, this.state.angle, this.state.zoom);
    },
    draw: function() {
      var material, meshArray, treadMesh;
      meshArray = [];
      material = new THREE.MeshBasicMaterial({
        color: 0x222222
      });
      treadMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material);
      treadMesh.position.x = this.x;
      treadMesh.position.y = this.y;
      treadMesh.position.z = 0.1;
      meshArray.push(treadMesh);
      return meshArray;
    }
  };
  controls.Label = function() {
    controls.Object.apply(this, arguments);
    this.applyDefaults();
    return void 0;
  };
  controls.Label.prototype = {
    available: false,
    applyDefaults: function() {
      var defaultOptions, key, option, _results;
      defaultOptions = {
        text: '',
        px: 30
      };
      if (this.options == null) {
        this.options = {};
      }
      _results = [];
      for (key in defaultOptions) {
        option = defaultOptions[key];
        if (this.options[key] == null) {
          _results.push(this.options[key] = option);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    thickness: 0.1,
    contains: function(x, y) {
      return false;
    },
    draw: function() {
      var buttonMesh, material, meshArray, textMesh;
      meshArray = [];
      material = new THREE.MeshBasicMaterial({
        color: 0x222222
      });
      buttonMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material);
      buttonMesh.position.x = this.x;
      buttonMesh.position.y = this.y;
      buttonMesh.position.z = 0.05;
      meshArray.push(buttonMesh);
      textMesh = util.makeText(this.options.text, this.options.px, this.width, this.height);

      /*
      			canvas1 = document.createElement('canvas')
      			canvas1.height = this.options.px
      			canvas1.width = this.options.px * this.width / this.height
      			context1 = canvas1.getContext('2d')
      			context1.font = "Bold " + this.options.px + "px Arial"
      			context1.fillStyle = "rgba(255,255,255,0.95)"
      			context1.fillText(this.options.text, 0, this.options.px)
      			texture1 = new THREE.Texture(canvas1) 
      			texture1.needsUpdate = true
      			material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } )
      			material1.transparent = true
      			textMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material1)
       */
      textMesh.position.x = this.x;
      textMesh.position.y = this.y;
      textMesh.position.z = 0.1;
      meshArray.push(textMesh);
      return meshArray;
    }
  };
  controls.Keyboard = function() {
    controls.Object.apply(this, arguments);
    this.applyDefaults();
    return void 0;
  };
  controls.Keyboard.prototype = {
    gestureThresholdDistance: 0.2,
    available: true,
    applyDefaults: function() {
      var defaultOptions, key, option, _results;
      defaultOptions = {
        startText: ''
      };
      this.points = [];
      this.text = '';
      this.gesturePoint = void 0;
      this.shifted = true;
      this.makeKeys();
      if (this.options == null) {
        this.options = {};
      }
      _results = [];
      for (key in defaultOptions) {
        option = defaultOptions[key];
        if (this.options[key] == null) {
          _results.push(this.options[key] = option);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    thickness: 0.1,
    makeKey: function(getChar, x, y, width, height, apply) {
      var keyboard;
      keyboard = this;
      return {
        apply: apply,
        getChar: getChar,
        x: x,
        y: y,
        width: width,
        height: height,
        toString: function() {
          return this.getChar();
        },
        contains: function(x, y) {

          /*
          					heigh: 0.17777777777777778
          					keyx: 0.6466
          					keyy: 0.2607111111111111
          					letter: "M"
          					wid: 0.075
          					x: 0.6510417
          					y: 0.2777778
           */

          /*
          					console.log({
          						x: x,
          						y: y,
          						keyx: this.x * keyboard.width + keyboard.x,
          						keyy: this.y * keyboard.height + keyboard.y,
          						wid: this.width * keyboard.width,
          						heigh: this.height * keyboard.height,
          						letter: this.char,
          						bool: util.rectContains(x, y, 
          						this.x * keyboard.width + keyboard.x, 
          						this.y * keyboard.height + keyboard.y, 
          						this.width * keyboard.width, this.height * keyboard.height)
          					})
           */
          return util.rectContains({
            x: x,
            y: y
          }, this.x * keyboard.width + keyboard.x, this.y * keyboard.height + keyboard.y, this.width * keyboard.width, this.height * keyboard.height);
        }
      };
    },
    initPoint: function(point) {
      var initKey;
      initKey = this.getKey(point.x, point.y);
      this.points[point.i] = {
        key: void 0,
        gesturing: false,
        trail: [],
        keyTrails: [],
        dragDist: function() {
          if (this.initGrab) {
            return util.distance(this, this.initGrab);
          } else {
            return 0;
          }
        },
        update: function(x, y, key) {
          if (key && !this.initGrab) {
            this.initGrab = {
              x: x,
              y: y,
              key: key
            };
          }
          if (this.x !== x || this.y !== y) {
            this.x = x;
            this.y = y;
            this.trail.push({
              x: this.x,
              y: this.y
            });
            if (this.key !== key) {
              if (this.keyTrails.length !== 0) {
                this.keyTrails[this.keyTrails.length - 1].trailEnd = this.trail.length;
              }
              if (key != null) {
                this.keyTrails.push({
                  key: key,
                  trailStart: this.trail.length
                });
              }
            }
            return this.key = key;
          }
        }
      };
      this.points[point.i].update(point.x, point.y, initKey);
      if (initKey != null) {
        return this.points[point.i].initGrab = {
          x: point.x,
          y: point.y,
          key: initKey
        };
      }
    },
    makeKeys: function() {
      var board;
      board = this;
      return this.keys = [
        this.makeKey((function() {
          if (board.shifted) {
            return 'Q';
          } else {
            return 'q';
          }
        }), 0.0083, 0.785, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'W';
          } else {
            return 'w';
          }
        }), 0.0975, 0.785, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'E';
          } else {
            return 'e';
          }
        }), 0.1866, 0.785, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'R';
          } else {
            return 'r';
          }
        }), 0.2775, 0.785, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'T';
          } else {
            return 't';
          }
        }), 0.3666, 0.785, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'Y';
          } else {
            return 'y';
          }
        }), 0.4566, 0.785, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'U';
          } else {
            return 'u';
          }
        }), 0.5466, 0.785, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'I';
          } else {
            return 'i';
          }
        }), 0.6375, 0.785, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'O';
          } else {
            return 'o';
          }
        }), 0.7266, 0.785, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'P';
          } else {
            return 'p';
          }
        }), 0.8166, 0.785, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'A';
          } else {
            return 'a';
          }
        }), 0.0516, 0.5366, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'S';
          } else {
            return 's';
          }
        }), 0.1416, 0.5366, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'D';
          } else {
            return 'd';
          }
        }), 0.2325, 0.5366, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'F';
          } else {
            return 'f';
          }
        }), 0.3225, 0.5366, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'G';
          } else {
            return 'g';
          }
        }), 0.4116, 0.5366, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'H';
          } else {
            return 'h';
          }
        }), 0.5016, 0.5366, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'J';
          } else {
            return 'j';
          }
        }), 0.5916, 0.5366, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'K';
          } else {
            return 'k';
          }
        }), 0.6825, 0.5366, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'L';
          } else {
            return 'l';
          }
        }), 0.7725, 0.5366, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return '\\\/';
          } else {
            return '^';
          }
        }), 0.0166, 0.2933, 0.075, 0.2, function(text) {
          board.shifted = !board.shifted;
          return text;
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'Z';
          } else {
            return 'z';
          }
        }), 0.1066, 0.2933, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'X';
          } else {
            return 'x';
          }
        }), 0.1966, 0.2933, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'C';
          } else {
            return 'c';
          }
        }), 0.2866, 0.2933, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'V';
          } else {
            return 'v';
          }
        }), 0.3766, 0.2933, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'B';
          } else {
            return 'b';
          }
        }), 0.4675, 0.2933, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'N';
          } else {
            return 'n';
          }
        }), 0.5575, 0.2933, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          if (board.shifted) {
            return 'M';
          } else {
            return 'm';
          }
        }), 0.6466, 0.2933, 0.075, 0.2, function(text) {
          return text + this.getChar();
        }), this.makeKey((function() {
          return 'Space';
        }), 0.2866, 0.045, 0.435, 0.2, function(text) {
          return text + ' ';
        }), this.makeKey((function() {
          return '<-';
        }), 0.905, 0.7833, 0.0833, 0.2, function(text) {
          if (text.length > 0) {
            return text.substring(0, text.length - 1);
          } else {
            return text;
          }
        })
      ];
    },
    getKey: function(x, y) {
      var i, key, _ref;
      _ref = this.keys;
      for (i in _ref) {
        key = _ref[i];
        if (key.contains(x, y)) {
          return key;
        }
      }
    },
    contains: function(x, y) {
      return (this.x < x && x < this.x + this.width) && (this.y < y && y < this.y + this.height);
    },
    getText: function() {
      return this.options.text;
    },
    setText: function(text) {
      if (Object.prototype.toString.call(text) === '[object String]') {
        this.options.text = text;
      }
      return this.options.text;
    },
    registerPoint: function(point) {
      this.initPoint(point);
      point.onRelease(this.release.bind(this));
      return point.onMove(this.move.bind(this));
    },
    release: function(x, y, i) {
      var bestScore, bestWord, curvatures, data, keySequence, segment, suggestions, trail, trailEnd, trailStart, _i, _j, _len, _ref, _ref1;
      if (this.gesturePoint === this.points[i]) {
        keySequence = '';
        curvatures = [];
        _ref = this.gesturePoint.keyTrails;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          trail = _ref[_i];
          trailStart = trail.trailStart;
          trailEnd = trail.trailEnd;
          segment = this.gesturePoint.trail.slice(trailStart, trailEnd);
          keySequence += trail.key.getChar();
          data = segment.map(function(n) {
            return [n.x, n.y];
          });
          curvatures.push(1 / ss.r_squared(data, ss.linear_regression().data(data).line()));
        }
        suggestions = util.get_suggestion(state, keySequence, curvatures);
        console.log(suggestions);
        bestWord = '';
        bestScore = 0;
        for (i = _j = 0, _ref1 = suggestions.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          if (suggestions[i].score > bestScore) {
            bestScore = suggestions[i].score;
            bestWord = suggestions[i].word;
          }
        }
        if (((bestWord != null ? bestWord[0] : void 0) != null) && this.shifted) {
          bestWord = bestWord[0].toUpperCase() + bestWord.slice(1);
          this.shifted = false;
        }
        if (this.text.length !== 0) {
          this.text = this.text + ' ' + bestWord;
        } else {
          this.text = bestWord;
        }
        this.onTextUpdate_callback(this.text);
        this.gesturePoint = void 0;
      } else if (this.getKey(x, y) != null) {
        this.text = this.getKey(x, y).apply(this.text);
        this.onTextUpdate_callback(this.text);
      }
      console.log(this.text);
      this.points[i] = void 0;
      if (this.points.length === 0) {
        return this.gesturePoint = void 0;
      }
    },
    move: function(x, y, i) {
      this.points[i].update(x, y, this.getKey(x, y));
      if (!this.gesturePoint && this.points[i].dragDist() > this.gestureThresholdDistance) {
        this.gesturePoint = this.points[i];
        return this.gesturePoint.gesturing = true;
      }
    },
    onTextUpdate_callback: function(text) {},
    onTextUpdate: function(callback) {
      return this.onTextUpdate_callback = callback;
    },
    draw: function() {
      var contentMesh, gestureGeometry, gestureLine, greyLine, key, keyMaterial, keyMaterialOptions, keyMesh, material, meshArray, point, _i, _j, _len, _len1, _ref, _ref1;
      meshArray = [];
      material = new THREE.MeshBasicMaterial({
        color: 0x222222
      });

      /*			
      			progress = {}
      			for (i in this.points) {
      				if (this.points[i] and this.points[i].initGrab and this.points[i] isnt this.gesturePoint)
      					progress[this.points[i].initGrab.key] = Math.min(this.points[i].dragDist()/this.thresholdDistance, 1)
      			}
       */
      _ref = this.keys;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        keyMaterialOptions = {
          color: 0x222222
        };

        /*if (progress[key.char]) {
        					keyMaterialOptions.color = (34 << 16) + (200 * 0 << 8) + (1 - progress[key.char]) * 255
        				}
         */
        keyMaterial = new THREE.MeshBasicMaterial(keyMaterialOptions);
        keyMesh = new THREE.Mesh(new THREE.PlaneGeometry(key.width * this.width, key.height * this.height), keyMaterial);
        keyMesh.position.x = key.x * this.width + this.x;
        keyMesh.position.y = key.y * this.height + this.y;
        keyMesh.position.z = 0.05;
        meshArray.push(keyMesh);
        contentMesh = util.makeText(key.getChar(), 30, key.width * this.width, key.height * this.height);
        contentMesh.position.x = key.x * this.width + this.x;
        contentMesh.position.y = key.y * this.height + this.y;
        contentMesh.position.z = 0.08;
        meshArray.push(contentMesh);
      }
      if (this.gesturePoint) {
        greyLine = new THREE.LineBasicMaterial({
          color: 0x999999,
          linewidth: 2
        });
        gestureGeometry = new THREE.Geometry();
        _ref1 = this.gesturePoint.trail;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          point = _ref1[_j];
          gestureGeometry.vertices.push(new THREE.Vector3(point.x, point.y, 0));
        }
        gestureLine = new THREE.Line(gestureGeometry, greyLine);
        gestureLine.position.x = this.x;
        gestureLine.position.y = this.y;
        gestureLine.position.z = 0.1;
        meshArray.push(gestureLine);
      }
      return meshArray;
    }
  };
  controls.Joystick = function() {
    controls.Object.apply(this, arguments);
    this.applyDefaults();
    return void 0;
  };
  controls.Joystick.prototype = {
    applyDefaults: function() {
      var defaultOptions, key, option;
      if (this.options.radius != null) {
        this.max_drag = this.options.radius * state.unitWidth;
      } else {
        this.max_drag = 1 / 4;
      }
      defaultOptions = {
        returnsToCenter: true
      };
      if (this.options == null) {
        this.options = {};
      }
      for (key in defaultOptions) {
        option = defaultOptions[key];
        if (this.options[key] == null) {
          this.options[key] = option;
        }
      }
      return this.initGrab = {
        x: 0,
        y: 0
      };
    },
    thickness: 0.1,
    radius: 0.04,
    available: true,
    point: void 0,
    contains: function(x, y) {
      return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow((y - this.y) / eccentricity, 2)) < this.radius;
    },
    release: function(x, y) {
      this.available = true;
      this.onRelease_callback(x - this.x, y - this.y);
      return this.point = void 0;
    },
    onRelease_callback: function(x, y) {},
    onRelease: function(callback) {
      return this.onRelease_callback = callback;
    },
    onMove_callback: function(x, y) {},
    move: function(x, y) {
      var dist, scaling_factor_x, scaling_factor_y, x_shift, y_shift;
      scaling_factor_x = 1;
      scaling_factor_y = 1;
      x_shift = this.point.x - this.initGrab.x;
      y_shift = this.point.y - this.initGrab.y;
      dist = util.length({
        x: this.point.x - this.x,
        y: (this.point.y - this.y) / eccentricity
      });
      if (dist > this.max_drag) {
        scaling_factor_x = this.max_drag / dist;
        scaling_factor_y = this.max_drag / dist;
      }
      return this.onMove_callback(x_shift * scaling_factor_x, y_shift * scaling_factor_y);
    },
    onMove: function(callback) {
      return this.onMove_callback = callback;
    },
    registerPoint: function(point) {
      this.initGrab.x = point.x;
      this.initGrab.y = point.y;
      this.point = point;
      point.onRelease(this.release.bind(this));
      point.onMove(this.move.bind(this));
      return this.available = false;
    },
    dragDistance: function() {
      if (this.point != null) {
        return util.distance(this.point, this.initGrab);
      }
      return 0;
    },
    draw: function() {
      var dist, grab, meshArray, scaling_factor_x, scaling_factor_y, x_shift, y_shift;
      meshArray = [];
      grab = util.makeFullCircle(this.radius);
      x_shift = 0;
      y_shift = 0;
      scaling_factor_x = 1;
      scaling_factor_y = 1;
      if (this.point != null) {
        x_shift = this.point.x - this.initGrab.x;
        y_shift = this.point.y - this.initGrab.y;
        dist = util.length({
          x: this.point.x - this.x,
          y: (this.point.y - this.y) / eccentricity
        });
        if (dist > this.max_drag) {
          scaling_factor_x = this.max_drag / dist;
          scaling_factor_y = this.max_drag / dist;
        }
      }
      grab.position.x = this.x + x_shift * scaling_factor_x;
      grab.position.y = this.y + y_shift * scaling_factor_y;
      grab.position.z = 0.1;
      meshArray.push(grab);
      return meshArray;
    }
  };
  controls.Panel = function() {
    this.objects = [];
    this.add = function(object) {
      return this.objects.push(object);
    };
    this.set = function(array) {
      return this.objects = array;
    };
    return void 0;
  };
  state.topBar = {
    x: 0,
    y: 1 - state.unitHeight,
    width: 1,
    height: state.unitHeight,
    buttonPosition: {
      'inClose': 0 * state.unitWidth,
      'inSettings': 1 * state.unitWidth,
      'inAppSwitch': 10 * state.unitWidth,
      'inMaxMin': 11 * state.unitWidth
    },
    initGrab: {
      x: 0,
      y: 0
    },
    thickness: 0.1,
    available: true,
    point: void 0,
    buttonSelected: void 0,
    contains: function(x, y) {
      var which;
      which = this.whichButton(x, y);
      return which !== 'none';
    },
    state: 'overlay',
    whichButton: function(x, y) {
      var option, position, _ref;
      if (this.state !== 'moving' && (this.y < y && y < this.y + this.height)) {
        if (x > 2 * state.unitWidth && x < 10 * state.unitWidth) {
          return 'hideBar';
        }
        _ref = this.buttonPosition;
        for (option in _ref) {
          position = _ref[option];
          if ((position < x && x < position + state.unitWidth)) {
            switch (option) {
              case 'inClose':
                if (state.getPanelApp()) {
                  return option;
                }
                break;
              case 'inSettings':
                return option;
              case 'inAppSwitch':
                return option;
              case 'inMaxMin':
                if (state.canMinimize() || state.canMaximize()) {
                  return option;
                }
            }
          }
        }
      }
      return 'none';
    },
    dragDistance: function() {
      if (this.point != null) {
        return util.distance(this.point, this.initGrab);
      }
      return 0;
    },
    release: function(x, y) {
      if ((this.buttonPosition[this.buttonSelected] != null) && util.rectContains(this.point, this.buttonPosition[this.buttonSelected], this.y, 1, this.height)) {
        this.click(this.buttonSelected);
      } else if (this.buttonSelected === 'hideBar') {
        if (y > 0.5) {
          this.state = 'overlay';
        } else {
          this.state = 'mobile';
        }
      }
      this.available = true;
      this.point = void 0;
      return this.buttonSelected = 'none';
    },
    click: function(buttonName) {
      switch (buttonName) {
        case 'inClose':
          if (state.mode === state.modes.AppSwitch && (state.back != null) && (state.front == null)) {
            state.front_and_back = state.back;
            state.back = null;
          }
          if (state.mode === state.modes.Normal) {
            return state.close();
          } else {
            return state.mode = state.modes.Normal;
          }
          break;
        case 'inSettings':
          return state.mode = state.modes.Settings;
        case 'inAppSwitch':
          state.mode = state.modes.AppSwitch;
          if (state.front_and_back != null) {
            state.back = state.front_and_back;
            return state.front_and_back = null;
          }
          break;
        case 'inMaxMin':
          return state.toggleMaxMin();
      }
    },
    dragDistance: function() {
      if (this.point != null) {
        return util.distance(this.point, this.initGrab);
      }
      return 0;
    },
    registerPoint: function(point) {
      var pt, _i, _len, _ref;
      this.initGrab.x = point.x;
      this.initGrab.y = point.y;
      this.buttonSelected = this.whichButton(point.x, point.y);
      if (this.buttonSelected === 'hideBar') {
        this.state = 'moving';
        _ref = state.points;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pt = _ref[_i];
          if ((pt.i != null) && pt.i !== point.i) {
            state.points[pt.i].release(pt.x, pt.y, pt.i);
            pt.taken = false;
          }
        }
      }
      this.point = point;
      point.onRelease(this.release.bind(this));
      return this.available = false;
    },
    draw: function() {
      var adjusted_y, appSwitchMesh, appSwitchText, barMaterial, barMesh, buttonMaterial, buttonMesh, closeMesh, materialOptions, maxMinMesh, meshArray, notificationText, notifyMesh, title, titleMesh;
      meshArray = [];
      barMaterial = new THREE.MeshBasicMaterial({
        color: 0x00CC00
      });
      barMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), barMaterial);
      switch (this.state) {
        case 'moving':
          adjusted_y = this.y + (this.point.y - this.initGrab.y);
          break;
        case 'mobile':
          this.y = 0;
          adjusted_y = this.y;
          break;
        case 'overlay':
          this.y = 1 - state.unitHeight;
          adjusted_y = this.y;
      }
      barMesh.position.x = this.x;
      barMesh.position.y = adjusted_y;
      barMesh.position.z = 0.05;
      meshArray.push(barMesh);
      if (this.buttonSelected !== 'none' && this.buttonSelected !== 'hideBar') {
        materialOptions = {
          color: 0x00CC00
        };
        if (this.point != null) {
          if (util.rectContains(this.point, this.buttonPosition[this.buttonSelected], this.y, 1, this.height)) {
            materialOptions.color = 255;
          } else {
            materialOptions.color = (100 << 16) + (100 << 8) + 100;
          }
        } else {
          materialOptions.color = 200 << 8;
        }
        buttonMaterial = new THREE.MeshBasicMaterial(materialOptions);
        buttonMesh = new THREE.Mesh(new THREE.PlaneGeometry(state.unitWidth, state.unitHeight), buttonMaterial);
        buttonMesh.position.x = this.x + this.buttonPosition[this.buttonSelected];
        buttonMesh.position.y = adjusted_y;
        buttonMesh.position.z = 0.08;
        meshArray.push(buttonMesh);
      }
      if (state.mode === state.modes.Normal) {
        closeMesh = util.makeText(' X', 30, state.unitWidth, state.unitHeight);
        closeMesh.position.x = this.x + this.buttonPosition['inClose'];
        closeMesh.position.y = adjusted_y;
        closeMesh.position.z = 0.1;
        meshArray.push(closeMesh);
        if (state.canMaximize()) {
          maxMinMesh = util.makeText(' +', 30, state.unitWidth, state.unitHeight);
          maxMinMesh.position.x = this.x + this.buttonPosition['inMaxMin'];
          maxMinMesh.position.y = adjusted_y;
          maxMinMesh.position.z = 0.1;
          meshArray.push(maxMinMesh);
        } else if (state.canMinimize()) {
          maxMinMesh = util.makeText(' -', 30, state.unitWidth, state.unitHeight);
          maxMinMesh.position.x = this.x + this.buttonPosition['inMaxMin'];
          maxMinMesh.position.y = adjusted_y;
          maxMinMesh.position.z = 0.1;
          meshArray.push(maxMinMesh);
        }
      } else {
        if (state.getPanelApp() != null) {
          maxMinMesh = util.makeText(' <', 30, state.unitWidth, state.unitHeight);
          maxMinMesh.position.x = this.x + this.buttonPosition['inClose'];
          maxMinMesh.position.y = adjusted_y;
          maxMinMesh.position.z = 0.1;
          meshArray.push(maxMinMesh);
        }
      }
      notificationText = ' *';
      notifyMesh = util.makeText(notificationText, 30, state.unitWidth, state.unitHeight);
      notifyMesh.position.x = this.x + this.buttonPosition['inSettings'];
      notifyMesh.position.y = adjusted_y;
      notifyMesh.position.z = 0.1;
      meshArray.push(notifyMesh);
      appSwitchText = '<->';
      appSwitchMesh = util.makeText(appSwitchText, 30, state.unitWidth, state.unitHeight);
      appSwitchMesh.position.x = this.x + this.buttonPosition['inAppSwitch'];
      appSwitchMesh.position.y = adjusted_y;
      appSwitchMesh.position.z = 0.1;
      meshArray.push(appSwitchMesh);
      title = '';
      if (state.mode === state.modes.Normal && (state.getPanelApp() != null)) {
        title = state.getPanelApp().name;
      } else if (state.mode === state.modes.AppSwitch) {
        title = 'App Switcher';
      } else if (state.mode === state.modes.Settings) {
        title = 'Settings';
      }
      titleMesh = util.makeText(title, 30, state.unitWidth * 8, state.unitHeight);
      titleMesh.position.x = 2 * state.unitWidth;
      titleMesh.position.y = adjusted_y;
      titleMesh.position.z = 0.1;
      meshArray.push(titleMesh);
      return meshArray;
    }
  };
  state.addURL = function(url, extras, open) {
    return (function(state, controls, appURL, util) {

      /*
      	      window.testApps[appID] = {
      	        event: {}
      	      }
      	      util.getSync(appURL, (data, textStatus, jqxhr) ->
      	        ((vOS, program) ->
      	            eval(program)
      	        )({
      	          onEvent: (eventType, f) ->
      	            window.testApps[appID].event[eventType] = f
      	          makeTextMesh: (options) ->
      	            return {} #To Do
      	        })
      	        if window.testApps[appID].event.load?
      	          state.add(window.testApps[appID], controls)
      	        else
      	          console.log('App from ' + appURL + ' Failed To Load')
      	      )
       */
      window.vOS = {
        onEvent: function(eventType, f) {
          return this.app.event[eventType] = f;
        },
        getValues: function() {
          return state.values;
        },
        makeTextMesh: function(options) {
          var height, px, text, width;
          text = options.text || '';
          px = options.px || 30;
          width = options.width || 20;
          height = options.height || 20;
          return util.makeText(text, px, width, height);
        },
        getValue: function(name) {
          return state.values[name];
        },
        addListener: function(name, f) {
          if (state.valueListeners[name] == null) {
            state.valueListeners[name] = [];
          }
          return state.valueListeners[name].push(f);
        },
        removeListener: function(name, f) {
          var index;
          index = state.valueListeners[name].indexOf(f);
          if (index > -1) {
            return state.valueListeners[name].pop(index);
          }
        },
        app: {
          event: {}
        }
      };
      return util.getScriptSync(appURL, function(data, textStatus, jqxhr) {
        var app, k, v;
        if (vOS.app.event.load != null) {
          if (extras != null) {
            for (k in extras) {
              v = extras[k];
              vOS.app[k] = v;
            }
          }
          app = state.add(vOS.app, controls);
          if (open) {
            state.open(app, controls);
          }
        } else {
          console.log('App from ' + appURL + ' Failed To Load');
        }
        return window.vOS.app = {
          event: {}
        };
      });
    })(state, controls, url, util);
  };
  return controls;
};


},{}],3:[function(require,module,exports){
var MOUSE_SPEED, USE_TRACKER, deviceInputs;

deviceInputs = exports;

MOUSE_SPEED = 0.005;

USE_TRACKER = false;

deviceInputs.setUp = function(state, util) {
  var bridge, lastClientX, lastClientY, mouseButtonDown, viewer;
  bridge = new OculusBridge({
    "onConnect": function() {},
    "onDisconnect": function() {},
    "onOrientationUpdate": function(quatValues) {
      HMDRotation.x = quatValues.x;
      HMDRotation.y = quatValues.y;
      HMDRotation.z = quatValues.z;
      HMDRotation.w = quatValues.w;
      return state.lastUpdate = Date.now();
    }
  });
  bridge.connect();
  document.addEventListener("keydown", function(e) {
    if (e.keyCode === 32) {
      return util.toggleFullScreen();
    }
  }, false);
  viewer = $('#viewer');
  mouseButtonDown = false;
  lastClientX = 0;
  lastClientY = 0;
  viewer.mousedown(function(event) {
    mouseButtonDown = true;
    lastClientX = event.clientX;
    return lastClientY = event.clientY;
  });
  $(document).mouseup(function() {
    return mouseButtonDown = false;
  });
  return viewer.mousemove(function(event) {
    var enableX, _ref;
    if (mouseButtonDown) {
      enableX = (_ref = USE_TRACKER || state.vr !== null) != null ? _ref : {
        0: 1
      };
      state.BaseRotationEuler.set(util.angleRangeRad(state.BaseRotationEuler.x + (event.clientY - lastClientY) * MOUSE_SPEED * enableX), util.angleRangeRad(state.BaseRotationEuler.y + (event.clientX - lastClientX) * MOUSE_SPEED), 0.0);
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      return state.BaseRotation.setFromEuler(state.BaseRotationEuler, 'YZX');
    }
  });
};


},{}],4:[function(require,module,exports){
var display;

display = exports;

display.start = function(state, util, controls) {
  var $viewer, ASPECT, FAR, HMDRotation, NEAR, OculusRift, USE_TRACKER, VIEW_ANGLE, WORLD_FACTOR, centerHeading, currHeading, directLight, e, effect, headingVector, keyboardMoveVector, moveVector, navList, pointLight, projGeo, projMaterial, render, renderer, resize, setUiSize, wasUsingRift;
  VIEW_ANGLE = 45;
  ASPECT = state.width / state.height;
  NEAR = 0.1;
  FAR = 10000;
  $viewer = $('#viewer');
  state.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

  /*
  	contained apps should stay in x: -50,50 y: 150,250 z: -50,50
   */
  state.camera.rotation.x = Math.PI / 2;
  state.camera.position.y = 0;
  state.camera.position.z = 10;
  state.camera.useQuaternion = true;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
  } catch (_error) {
    e = _error;
    alert('This application needs WebGL enabled!');
    return false;
  }
  renderer.autoClearColor = true;
  renderer.setSize(state.width, state.height);
  $viewer.append(renderer.domElement);
  state.mobileCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -30, 30);
  state.mobileCamera.position.z = 10;
  state.mobileCamera.up = new THREE.Vector3(0, 1, 0);
  state.mobileRenderer = new THREE.WebGLRenderer({
    antialias: true
  });
  state.mobileRenderer.autoClearColor = true;
  state.mobileRenderer.setSize(400, 400);
  pointLight = new THREE.PointLight(0xFFFFFF);
  pointLight.position.x = 50;
  pointLight.position.y = 50;
  pointLight.position.z = 300;
  directLight = new THREE.DirectionalLight(0xFFFFFF);
  directLight.position.x = 0;
  directLight.position.y = 0;
  directLight.position.z = 1;
  USE_TRACKER = false;
  WORLD_FACTOR = 1.0;
  OculusRift = {
    hResolution: 1280,
    vResolution: 800,
    hScreenSize: 0.14976,
    vScreenSize: 0.0936,
    interpupillaryDistance: 0.064,
    lensSeparationDistance: 0.064,
    eyeToScreenDistance: 0.041,
    distortionK: [1.0, 0.22, 0.24, 0.0],
    chromaAbParameter: [0.996, -0.004, 1.014, 0.0]
  };
  currHeading = 0;
  centerHeading = 0;
  navList = [];
  headingVector = new THREE.Vector3();
  moveVector = new THREE.Vector3();
  keyboardMoveVector = new THREE.Vector3();
  HMDRotation = new THREE.Quaternion();
  OculusRift.hResolution = state.width;
  OculusRift.vResolution = state.height;
  effect = new THREE.OculusRiftEffect(renderer, {
    HMD: OculusRift,
    worldFactor: WORLD_FACTOR
  });
  effect.setSize(state.width, state.height);
  resize = function(event) {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    setUiSize();
    ASPECT = state.width / state.height;
    OculusRift.hResolution = state.width;
    OculusRift.vResolution = state.height;
    effect.setHMD(OculusRift);
    renderer.setSize(state.width, state.height);
    return state.camera.projectionMatrix.makePerspective(VIEW_ANGLE, ASPECT, NEAR, FAR);
  };
  window.addEventListener('resize', resize, false);
  setUiSize = function() {
    var height, hwidth, width;
    width = window.innerWidth;
    hwidth = width / 2;
    return height = window.innerHeight;
  };
  projGeo = new THREE.SphereGeometry(5000, 512, 256);
  projMaterial = new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('static/placeholder.png'),
    side: THREE.DoubleSide
  });
  wasUsingRift = false;
  render = function() {
    var adjustedHMDQuarternion, matr, matr2, scene, tilt, tilt2;
    requestAnimationFrame(render);
    moveVector.add(keyboardMoveVector);
    if (USE_TRACKER || (state.vr != null)) {
      moveVector.x = 0;
    }
    state.BaseRotationEuler.set(0.0, util.angleRangeRad(state.BaseRotationEuler.y + moveVector.y), 0.0);
    state.BaseRotation.setFromEuler(state.BaseRotationEuler, 'YZX');
    matr = new THREE.Matrix4();
    matr.makeRotationFromQuaternion(state.BaseRotation);
    tilt = new THREE.Matrix4();
    tilt.makeRotationX(Math.PI / 2);
    matr.multiplyMatrices(tilt, matr);
    state.BaseRotation.setFromRotationMatrix(matr);
    adjustedHMDQuarternion = new THREE.Quaternion();
    adjustedHMDQuarternion.x = HMDRotation.x;
    adjustedHMDQuarternion.y = HMDRotation.y;
    adjustedHMDQuarternion.z = HMDRotation.z;
    adjustedHMDQuarternion.w = HMDRotation.w;
    matr2 = new THREE.Matrix4();
    matr2.makeRotationFromQuaternion(adjustedHMDQuarternion);
    tilt2 = new THREE.Matrix4();
    tilt2.makeRotationX(0 * Math.PI / 2);
    matr2.multiplyMatrices(tilt2, matr2);
    adjustedHMDQuarternion.setFromRotationMatrix(matr2);
    state.camera.quaternion.multiplyQuaternions(state.BaseRotation, adjustedHMDQuarternion);
    headingVector.setEulerFromQuaternion(state.camera.quaternion, 'YZX');
    currHeading = util.angleRangeDeg(THREE.Math.radToDeg(-1 * headingVector.y));
    scene = new THREE.Scene();
    if (state.front_and_back != null) {
      (function() {
        return state.front_and_back.external.drawImmersive(scene);
      })();
    } else {
      switch (state.mode) {
        case state.modes.Normal:
          if (state.front != null) {
            (function() {
              return state.front.external.drawContained(scene);
            })();
          }
          break;
        case state.modes.AppSwitch:
          state.appSwitcher.external.drawContained(scene);
      }
      if (state.back != null) {
        (function() {
          return state.back.external.drawImmersiveBackground(scene);
        })();
      }
    }
    state.drawPanel(scene, util);
    scene.add(state.camera);
    scene.add(directLight);
    if (Date.now() - state.lastUpdate < 100) {
      effect.render(scene, state.camera);
      return wasUsingRift = true;
    } else {
      HMDRotation.x = 0;
      HMDRotation.y = 0;
      HMDRotation.z = 0;
      HMDRotation.w = 1;
      if (wasUsingRift) {
        state.BaseRotationEuler.y = 0;
      }
      renderer.setViewport(0, 0, state.width, state.height);
      renderer.render(scene, state.camera);
      return wasUsingRift = false;
    }
  };
  setUiSize();
  return render();
};


},{}],5:[function(require,module,exports){
$(document).ready(function() {
  var controls, state, util;
  state = require('./state');
  util = require('./util');
  controls = require('./controls').setUp(state, util);
  require('./remoteController').setUp(state, util);
  require('./deviceInputs').setUp(state, util);
  require('./appSwitcher').setUp(state, util, controls);
  require('./params').check(state, util, controls);
  return require('./display').start(state, util, controls);
});


},{"./appSwitcher":1,"./controls":2,"./deviceInputs":3,"./display":4,"./params":6,"./remoteController":7,"./state":8,"./util":9}],6:[function(require,module,exports){
var params;

params = exports;

params.check = function(state, util, controls) {
  var i, items, kvpair, paramList, setUpUser, _i, _ref;
  paramList = {};
  items = window.location.search.substring(1).split("&");
  for (i = _i = 0, _ref = items.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    kvpair = items[i].split("=");
    paramList[kvpair[0]] = unescape(kvpair[1]);
  }
  if (paramList['from'] != null) {
    state.fromURL = decodeURIComponent(paramList['from']);
  }
  state.mode = state.modes.AppSwitch;
  setUpUser = function() {
    var appID, _j, _len, _ref1, _results;
    state.apps = [];
    window.Controls = controls;
    _ref1 = state.user.recent;
    _results = [];
    for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
      appID = _ref1[_j];
      _results.push(util.getSync('/appInfo?app_id=' + appID, function(appData, textStatus, jqxhr) {
        return state.addURL(appData.url, appData);
      }));
    }
    return _results;
  };
  if (token !== '') {
    util.getSync('/userFromToken?token=' + token, function(data) {
      if (data.recent) {
        state.user = data;
      }
      return setUpUser();
    });
  }
  if (typeof appQueryURL !== "undefined" && appQueryURL !== null) {
    return state.addURL(appQueryURL, null, true);

    /*
      window.testApps[appID] = {
        event: {}
      }
      util.getSync(appURL, (data, textStatus, jqxhr) ->
        ((vOS, program) ->
            eval(program)
        )({
          onEvent: (eventType, f) ->
            window.testApps[appID].event[eventType] = f
          makeTextMesh: (options) ->
            return {} #To Do
        })
        if window.testApps[appID].event.load?
          state.add(window.testApps[appID], controls)
        else
          console.log('App from ' + appURL + ' Failed To Load')
      )
     */

    /*
       *debugger;
      window.vOS = {
        onEvent: (eventType, f) ->
          this.app.event[eventType] = f
        getValues: ->
          return state.values
        makeTextMesh: (options) ->
          text = options.text or ''
          px = options.px or 30
          width = options.width or 20
          height = options.height or 20
          textMesh = util.makeText(text, px, width, height)
          textMesh.rotation.x = Math.PI/2
          textMesh.position.z = 50 + (options.y or 0)
          textMesh.position.x = 0 + (options.x or 0)
          return textMesh
        getValue: (name) ->
          return state.values[name]
        addListener: (name, f) ->
          unless state.valueListeners[name]?
            state.valueListeners[name] = []
          state.valueListeners[name].push(f)
        removeListener: (name, f) ->
          index = state.valueListeners[name].indexOf(f)
          if index > -1
            state.valueListeners[name].pop(index)
        app: {
          event: {}
        }
      }
      util.getScriptSync(appURL, (data, textStatus, jqxhr) ->
        if vOS.app.event.load?
          for k, v of appData
            vOS.app[k] = v
          state.add(vOS.app, controls)
        else
          console.log('App from ' + appURL + ' Failed To Load')
         *window.app
        window.vOS.app = {
          event: {}
        }
      )
    )(state, controls, appQueryURL)
     */

    /*
    ((state, controls, appURL) ->
      app = {event: {}}
      window.Controls = controls
      window.vOS = {
        onEvent: (eventType, f) ->
          app.event[eventType] = f
        makeTextMesh: (options) ->
          return {} #To Do
      }
    
      util.getScriptSync(appURL, ->
        delete window.app
        delete window.vOS
      )
      if app.event.load?
        state.add(app, controls)
      else
        console.log('App from ' + appURL + ' Failed To Load..')
    )(state, controls, appQueryURL)
     */
  }
};


},{}],7:[function(require,module,exports){
var remoteController;

remoteController = exports;

remoteController.setUp = function(state, util) {
  var Point, checkGrab;
  Point = function(x, y, i) {
    this.start = {
      x: x,
      y: y
    };
    this.x = x;
    this.y = y;
    this.i = i;
    this.taken = false;
    this.onRelease_callback = function() {};
    this.release = function(x, y, i) {
      return this.onRelease_callback(x, y, i);
    };
    this.onRelease = function(callback) {
      return this.onRelease_callback = callback;
    };
    this.onMove_callback = function(x, y, i) {};
    this.move = function(x, y, i) {
      this.x = x;
      this.y = y;
      return this.onMove_callback(x, y, i);
    };
    this.onMove = function(callback) {
      return this.onMove_callback = callback;
    };
    return void 0;
  };
  checkGrab = function(point) {
    var object, objects, panelApp, _i, _len, _results;
    panelApp = state.getPanelApp();
    if (state.topBar.state !== 'moving') {
      if (state.topBar.available && state.topBar.contains(point.x, point.y)) {
        state.topBar.registerPoint(point);
        point.taken = true;
      }
      objects = [];
      switch (state.mode) {
        case state.modes.Normal:
          objects = objects.concat(panelApp.panel.objects);
          break;
        case state.modes.AppSwitch:
          objects = objects.concat(state.appSwitcher.panel.objects);
          break;
        case state.modes.Notifications:
          objects = objects.concat(state.notificationPanel.objects);
      }
      _results = [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        object = objects[_i];
        if (object.available && object.contains(point.x, state.topBar.state === 'overlay' ? point.y : point.y - 1 / 12)) {
          object.registerPoint(point);
          _results.push(point.taken = true);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };
  state.socket = io.connect('/');
  state.socket.on('disconnect', function() {
    if (sessionId !== 'debug') {
      return window.location = state.fromURL;
    }
  });
  state.socket.emit('declare-type', {
    type: 'output',
    session_id: sessionId
  });
  state.socket.on('error', function(result) {
    if (sessionId !== 'debug') {
      return window.location = state.fromURL;
    }
  });
  state.socket.on('size', function(data) {
    return state.deviceDimensions = {
      width: JSON.parse(data).width,
      height: JSON.parse(data).height
    };
  });
  state.socket.on('value', function(data) {
    var listener, name, parsed, value, _results;
    parsed = JSON.parse(data);
    _results = [];
    for (name in parsed) {
      value = parsed[name];
      state.values[name] = value;
      if (state.valueListeners[name]) {
        _results.push((function() {
          var _i, _len, _ref, _results1;
          _ref = state.valueListeners[name];
          _results1 = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            listener = _ref[_i];
            _results1.push(listener(value));
          }
          return _results1;
        })());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  });
  state.socket.on('start', function(data) {
    var parsed, point;
    parsed = JSON.parse(data);
    point = new Point(parsed.x, parsed.y, parsed.i);
    state.points[parsed.i] = point;
    return checkGrab(point);
  });
  state.socket.on('move', function(data) {
    var parsed, point;
    parsed = JSON.parse(data);
    point = state.points[parsed.i];
    if (point != null) {
      point.move(parsed.x, parsed.y, parsed.i);
      if (!point.taken) {
        return checkGrab(point);
      }
    }
  });
  return state.socket.on('end', function(data) {
    var parsed, point;
    parsed = JSON.parse(data);
    point = state.points[parsed.i];
    if (point != null) {
      point.release(parsed.x, parsed.y, parsed.i);
      return state.points[parsed.i] = {};
    }
  });
};


},{}],8:[function(require,module,exports){
var every, numColumns, numRows, state,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

state = exports;

state.apps = [];

state.front = void 0;

state.back = void 0;

state.front_and_back = void 0;

state.points = [];

state.width = window.innerWidth;

state.height = window.innerHeight;

state.camera = void 0;

state.values = {};

state.valueListeners = {};

state.modes = {
  Normal: 'normal',
  AppSwitch: 'app-switch',
  Notifications: 'notifications'
};

state.notificationPanel = void 0;

state.appSwitcher = void 0;

state.topBar = void 0;

numColumns = 12;

numRows = 8;

state.unitWidth = 1 / numColumns;

state.unitHeight = 1 / (numRows + 1);

state.oldState = state.modes.Normal;

state.lastUpdate = 0;

state.BaseRotationEuler = new THREE.Vector3();

state.BaseRotation = new THREE.Quaternion();

every = 0;

state.open = function(app) {
  var listener, _i, _len, _ref, _ref1, _results;
  if (!((state.front_and_back != null) && state.front_and_back.index === app.index) && !((state.front != null) && state.front.index === app.index) && !((state.back != null) && state.back.index === app.index) && (state.user != null) && (_ref = app._id, __indexOf.call(state.user.recent, _ref) < 0)) {
    state.user.recent.push(app._id);
    $.post('http://vos.jit.su/recentApps?token=' + token, {
      recent: state.user.recent
    });
  }
  if ((state.back != null) && state.back.index === app.index) {
    state.back = null;
    state.front = null;
    state.front_and_back = app;
  } else if ((state.front_and_back == null) || state.front_and_back.index !== app.index) {
    if (app.external.drawContained != null) {
      if ((state.front_and_back != null) && (state.front_and_back.external.drawImmersiveBackground != null)) {
        state.back = state.front_and_back;
      }
      state.front_and_back = null;
      state.front = app;
    } else if (app.external.drawImmersive != null) {
      state.front = null;
      state.back = null;
      state.front_and_back = app;
    } else if (app.external.drawImmersiveBackground != null) {
      state.front_and_back = null;
      state.back = app;
    }
  }
  state.mode = state.modes.Normal;
  _ref1 = state.onAppListUpdate.listeners;
  _results = [];
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    listener = _ref1[_i];
    _results.push(listener());
  }
  return _results;
};

state.onAppListUpdate = function(func) {
  return state.onAppListUpdate.listeners.push(func);
};

state.onAppListUpdate.listeners = [];

state.fromURL = "/";

state.add = function(app, controls) {
  var listener, _i, _len, _ref;
  app.panel = new controls.Panel(app);
  app.index = state.apps.length;
  state.apps.push(app);
  app.external = {
    panel: app.panel,
    user: {
      id: state.user.id,
      name: state.user.name
    }
  };
  (function(load, app) {
    return load(app);
  })(app.event.load, app.external);
  _ref = state.onAppListUpdate.listeners;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    listener = _ref[_i];
    listener();
  }
  return app;
};

state.canMaximize = function() {
  return (state.front != null) && (state.front.external.drawImmersive != null);
};

state.canMinimize = function() {
  return (state.front_and_back != null) && (state.front_and_back.external.drawContained != null);
};

state.getPanelApp = function() {
  if (state.front != null) {
    return state.front;
  } else if (state.front_and_back != null) {
    return state.front_and_back;
  }
  return null;
};

state.minimize = function() {
  if (state.canMinimize()) {
    state.front = state.front_and_back;
    return state.front_and_back = null;
  }
};

state.maximize = function() {
  if (state.canMaximize()) {
    state.front_and_back = state.front;
    state.front = null;
    return state.back = null;
  }
};

state.toggleMaxMin = function() {
  if (state.front != null) {
    return state.maximize();
  } else if (state.front_and_back != null) {
    return state.minimize();
  }
};

state.close = function() {
  if (state.front != null) {
    if ((state.back != null) && (state.back.external.drawImmersive != null)) {
      state.front_and_back = state.back;
      state.back = null;
    }
    state.front = null;
  } else if (state.front_and_back != null) {
    state.front_and_back = null;
  } else if (state.back != null) {
    state.back = null;
  }
  if ((state.front == null) && (state.front_and_back == null)) {
    return state.mode = state.modes.AppSwitch;
  }
};

state.drawPanel = function(scene, util) {
  var ambient, circle, circle_amplitude, directLight, mesh, meshes, mobileDataURI, mobileScene, object, objects, panelApp, panelMesh, point, redLambert, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1;
  redLambert = new THREE.MeshLambertMaterial({
    color: 0xCC0000
  });
  panelMesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 30), redLambert);
  panelMesh.position.x = state.camera.position.x + 0;
  panelMesh.position.y = state.camera.position.y + 80;
  panelMesh.position.z = state.camera.position.z - 20;
  panelMesh.rotation.x = -1.1 + Math.PI / 2;
  panelApp = state.getPanelApp();
  mobileScene = new THREE.Scene();
  _ref = state.topBar.draw();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    mesh = _ref[_i];
    if (state.topBar.state !== 'overlay') {
      mobileScene.add(util.cloneMesh(mesh));
    }
    util.setPanelPosition(panelMesh, mesh, mesh.position.x, mesh.position.y, mesh.position.z);
    if (state.topBar.state !== 'mobile') {
      scene.add(mesh);
    }
  }
  objects = [];
  if (state.topBar.state !== 'moving') {
    switch (state.mode) {
      case state.modes.Normal:
        if (panelApp != null) {
          objects = objects.concat(panelApp.panel.objects);
        }
        break;
      case state.modes.Notifications:
        objects = objects.concat(state.notificationPanel.objects);
        break;
      case state.modes.AppSwitch:
        objects = objects.concat(state.appSwitcher.panel.objects);
    }
    state.oldState = state.mode;
  }
  for (_j = 0, _len1 = objects.length; _j < _len1; _j++) {
    object = objects[_j];
    meshes = object.draw();
    if (meshes != null) {
      for (_k = 0, _len2 = meshes.length; _k < _len2; _k++) {
        mesh = meshes[_k];
        if (state.topBar.state === 'mobile') {
          mesh.position.y += 1 / 12;
          mobileScene.add(util.cloneMesh(mesh));
        }
        util.setPanelPosition(panelMesh, mesh, mesh.position.x, mesh.position.y, mesh.position.z);
        if (state.topBar.state === 'overlay') {
          scene.add(mesh);
        }
      }
    }
  }
  if (state.topBar.state === 'overlay') {
    scene.add(panelMesh);
  }
  circle_amplitude = 0.01;
  _ref1 = state.points;
  for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
    point = _ref1[_l];
    if ((point != null) && (point.x != null) && (point.y != null)) {
      circle = util.makeCircle(circle_amplitude);
      circle.position.x = point.x;
      circle.position.y = point.y;
      circle.position.z = 0.12;
      if (state.topBar.state === 'mobile') {
        circle.position.y += 1 / 12;
        mobileScene.add(util.cloneLine(circle));
      }
      util.setPanelPosition(panelMesh, circle, circle.position.x, circle.position.y, circle.position.z);
      if (state.topBar.state !== 'mobile') {
        scene.add(circle);
      }
    }
  }
  ambient = new THREE.AmbientLight(0xeeeeee);
  directLight = new THREE.DirectionalLight(0xFFFFFF);
  directLight.position.x = 0;
  directLight.position.y = 0;
  directLight.position.z = 20;
  mobileScene.add(state.mobileCamera);
  mobileScene.add(ambient);
  state.mobileRenderer.render(mobileScene, state.mobileCamera);
  mobileDataURI = state.mobileRenderer.domElement.toDataURL();
  if ((state.socket != null) && every % 10 === 0) {
    state.socket.emit('visual', mobileDataURI);
  }
  return every++;
};

$.ajax({
  url: 'http://vos.jit.su/static/wordlist.txt',
  success: function(wordlist) {
    return state.wordlist = wordlist.split('\r\n');
  }
});


},{}],9:[function(require,module,exports){
var eccentricity, util;

util = exports;

eccentricity = 80 / 30;

util.makeCircle = function(amplitude) {
  var circle_geometry, circle_resolution, greenLine, j, theta, _i;
  circle_resolution = 40;
  greenLine = new THREE.LineBasicMaterial({
    color: 0x999999,
    linewidth: 2
  });
  circle_geometry = new THREE.Geometry();
  for (j = _i = 0; 0 <= circle_resolution ? _i <= circle_resolution : _i >= circle_resolution; j = 0 <= circle_resolution ? ++_i : --_i) {
    theta = (j / circle_resolution) * Math.PI * 2;
    circle_geometry.vertices.push(new THREE.Vector3(amplitude * Math.cos(theta), amplitude * Math.sin(theta) * eccentricity, 0));
  }
  return new THREE.Line(circle_geometry, greenLine);
};

util.makeFullCircle = function(amplitude) {
  var circle, circle_resolution, geometry, green, j, theta, x, y, _i;
  circle_resolution = 40;
  green = new THREE.LineBasicMaterial({
    color: 0x333333
  });
  circle = new THREE.Shape();
  for (j = _i = 0; 0 <= circle_resolution ? _i <= circle_resolution : _i >= circle_resolution; j = 0 <= circle_resolution ? ++_i : --_i) {
    theta = (j / circle_resolution) * Math.PI * 2;
    x = amplitude * Math.cos(theta);
    y = amplitude * Math.sin(theta) * eccentricity;
    if (j === 0) {
      circle.moveTo(x, y);
    } else {
      circle.lineTo(x, y);
    }
  }
  geometry = circle.makeGeometry();
  return new THREE.Mesh(geometry, green);
};

util.exportMesh = function(mesh) {
  var result, _ref, _ref1;
  result = {};
  result.vertices = mesh.geometry.vertices;
  if (mesh.material.color != null) {
    result.color = mesh.material.color;
  }
  result.dataURI = (_ref = mesh.material.map) != null ? (_ref1 = _ref.image) != null ? _ref1.toDataURL("image/jpeg") : void 0 : void 0;
  result.position = {
    x: mesh.position.x,
    y: mesh.position.y,
    z: mesh.position.z
  };
  return result;
};

util.cloneMesh = function(mesh) {
  var copy;
  copy = new THREE.Mesh(mesh.geometry.clone(), mesh.material.clone());
  if (copy.material.map != null) {
    copy.material.map = mesh.material.map.clone();
    copy.material.map.needsUpdate = true;
  }
  copy.position = mesh.position.clone();
  if (mesh.geometry.height != null) {
    copy.position.y += mesh.geometry.height / 2;
  }
  if (mesh.geometry.width != null) {
    copy.position.x += mesh.geometry.width / 2;
  }
  return copy;
};

util.cloneLine = function(line) {
  var copy;
  copy = new THREE.Line(line.geometry.clone(), line.material.clone());
  copy.position = line.position.clone();
  return copy;
};

util.makeText = function(text, px, width, height) {
  var canvas1, context1, material1, texture1;
  canvas1 = document.createElement('canvas');
  canvas1.height = px + 10;
  canvas1.width = canvas1.height * width / height * 2;
  context1 = canvas1.getContext('2d');
  context1.font = 'Bold ' + px + ' px Arial';
  context1.fillStyle = 'rgba(255,255,255,0.95)';
  context1.fillText(' ' + text, 0, px);
  texture1 = new THREE.Texture(canvas1);
  texture1.needsUpdate = true;
  material1 = new THREE.MeshBasicMaterial({
    map: texture1,
    side: THREE.DoubleSide
  });
  material1.transparent = true;
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material1);
};

util.setPanelPosition = function(board, Mesh, x_disp, y_disp, z_disp) {
  var adjusted_x_disp, adjusted_y_disp, height, width;
  width = 0;
  height = 0;
  if (Mesh.geometry.width != null) {
    width = Mesh.geometry.width * board.geometry.width;
  }
  if (Mesh.geometry.height != null) {
    height = Mesh.geometry.height * board.geometry.height;
  }
  Mesh.scale.x = board.geometry.width;
  Mesh.scale.y = board.geometry.height;
  adjusted_x_disp = board.geometry.width * (x_disp - 0.5) + width / 2;
  adjusted_y_disp = board.geometry.height * (y_disp - 0.5) + height / 2;
  Mesh.position.x = board.position.x + adjusted_x_disp;
  Mesh.position.y = board.position.y + adjusted_y_disp * Math.cos(board.rotation.x) - z_disp * Math.sin(board.rotation.x);
  Mesh.position.z = board.position.z + adjusted_y_disp * Math.sin(board.rotation.x) + z_disp * Math.cos(board.rotation.x);
  return Mesh.rotation.x = board.rotation.x;
};

util.inRange = function(test, start, span) {
  return (start < test && test < start + span);
};

util.rectContains = function(point, x, y, width, height) {
  return util.inRange(point.x, x, width) && util.inRange(point.y, y, height);
};

util.vector = function(a, b) {
  return {
    x: b.x - a.x,
    y: b.y - a.y
  };
};

util.dot = function(a, b) {
  return a.x * b.x + a.y * b.y;
};

util.length = function(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
};

util.distance = function(a, b) {
  return util.length(util.vector(a, b));
};

util.angle = function(a, b) {
  return Math.acos(util.dot(a, b) / (util.length(a) * util.length(b)));
};

util.rotate = function(a, theta) {
  return {
    x: a.x * Math.cos(theta) - a.y * Math.sin(theta),
    y: a.x * Math.sin(theta) + a.y * Math.cos(theta)
  };
};

util.add = function(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
};

util.scale = function(a, x_scale, y_scale) {
  return {
    x: a.x * x_scale,
    y: a.y * y_scale
  };
};

util.angleRangeDeg = function(angle) {
  angle %= 360;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
};

util.angleRangeRad = function(angle) {
  angle %= 2 * Math.PI;
  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  return angle;
};

util.deltaAngleDeg = function(a, b) {
  return Math.min(360 - (Math.abs(a - b) % 360), Math.abs(a - b) % 360);
};

util.toggleFullScreen = function() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {
      return document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      return document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      return document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      return document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      return document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      return document.webkitCancelFullScreen();
    }
  }
};

util.getScriptSync = function(url, callback) {
  return $.ajax({
    async: false,
    type: 'GET',
    url: url,
    data: null,
    success: callback,
    dataType: 'script',
    timeout: 500
  });
};

util.getSync = function(url, callback) {
  return $.ajax({
    async: false,
    url: url,
    success: callback
  });
};

util.getAsync = function(url, callback) {
  return $.ajax({
    async: true,
    url: url,
    success: callback
  });
};

util.match = function(oPath, word, probs) {

  /* Checks if a word is present in a path or not. */
  var i, index, letters, path, score, totalIndex, _i, _ref;
  letters = word.split('');
  score = 1;
  totalIndex = 0;
  path = oPath;
  for (i = _i = 0, _ref = letters.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    index = path.indexOf(letters[i]);
    if (index < 0) {
      return 0;
    }
    score *= probs[totalIndex + index];
    totalIndex += index + 1;
    path = path.substring(index + 1);
  }
  return score;
};

util.get_keyboard_row = function(char) {
  var keyboardLayout, row_no, _i, _ref, _ref1;
  keyboardLayout = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  for (row_no = _i = 0, _ref = keyboardLayout.length; 0 <= _ref ? _i < _ref : _i > _ref; row_no = 0 <= _ref ? ++_i : --_i) {
    if (((_ref1 = keyboardLayout[row_no]) != null ? _ref1.indexOf(char) : void 0) >= 0) {
      return row_no;
    }
  }
};

util.compress = function(sequence) {
  var i, ret_val, _i, _ref;
  ret_val = [sequence[0]];
  for (i = _i = 0, _ref = sequence.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    if (ret_val[ret_val.length - 1] !== sequence[i]) {
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
  var compressed_row_numbers, row_numbers;
  row_numbers = path.split('').map(util.get_keyboard_row);
  compressed_row_numbers = util.compress(row_numbers);
  return compressed_row_numbers.length - 3;
};

util.get_suggestion = function(state, path, probs) {

  /* Returns suggestions for a given path. */
  var filtered, i, matchScore, min_length, suggestions, _i, _ref;
  if (path.length === 0) {
    return [];
  }
  filtered = state.wordlist.filter(function(x) {
    return x[x.length - 1] === path[path.length - 1].toLowerCase();
  });
  suggestions = [];
  matchScore = 0;
  for (i = _i = 0, _ref = filtered.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    matchScore = util.match(path.toLowerCase(), filtered[i], probs);
    if (matchScore > 0) {
      suggestions.push({
        word: filtered[i],
        score: matchScore
      });
    }
  }
  min_length = util.get_minimum_wordlength(path.toLowerCase());
  suggestions = suggestions.filter(function(x) {
    return x.word.length > min_length;
  });
  return suggestions;
};


},{}]},{},[5])