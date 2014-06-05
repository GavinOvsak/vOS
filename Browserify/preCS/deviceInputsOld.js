var deviceInputs = exports;

var MOUSE_SPEED = 0.005;
var USE_TRACKER = false;

deviceInputs.setUp = function(state, util) {
  var bridge = new OculusBridge({
      "onConnect" : function() { 
          //console.log("we are connected!");
      },
      "onDisconnect" : function() {
          //console.log("good bye Oculus.");
      },
      "onOrientationUpdate" : function(quatValues) {
          HMDRotation.x = quatValues.x;
          HMDRotation.y = quatValues.y;
          HMDRotation.z = quatValues.z;
          HMDRotation.w = quatValues.w;
          state.lastUpdate = Date.now();
      }
  });

  bridge.connect();

  document.addEventListener("keydown", function(e) {
    if (e.keyCode == 32) {
      util.toggleFullScreen();
    }
  }, false);

  // Mouse
  // ---------------------------------------
  var viewer = $('#viewer'),
      mouseButtonDown = false,
      lastClientX = 0,
      lastClientY = 0;

  viewer.mousedown(function(event) {
    mouseButtonDown = true;
    lastClientX = event.clientX;
    lastClientY = event.clientY;
  });

  $(document).mouseup(function() {
    mouseButtonDown = false;
  });

  viewer.mousemove(function(event) {
    if (mouseButtonDown) {
      var enableX = (USE_TRACKER || state.vr !== null) ? 0 : 1;
      state.BaseRotationEuler.set(
        util.angleRangeRad(state.BaseRotationEuler.x + (event.clientY - lastClientY) * MOUSE_SPEED * enableX),
        util.angleRangeRad(state.BaseRotationEuler.y + (event.clientX - lastClientX) * MOUSE_SPEED),
        0.0
      );
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      state.BaseRotation.setFromEuler(state.BaseRotationEuler, 'YZX');
    }
  });
};
