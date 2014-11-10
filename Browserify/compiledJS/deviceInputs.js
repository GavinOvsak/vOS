// Generated by CoffeeScript 1.7.1
var MOUSE_SPEED, USE_TRACKER, deviceInputs;

deviceInputs = exports;

MOUSE_SPEED = 0.005;

USE_TRACKER = false;

deviceInputs.setUp = function(state, util) {
  var bridge, lastClientX, lastClientY, mouseButtonDown, viewer;
  bridge = new OculusBridge({
    'onConnect': function() {},
    'onDisconnect': function() {},
    'onOrientationUpdate': function(quatValues) {
      HMDRotation.x = quatValues.x;
      HMDRotation.y = quatValues.y;
      HMDRotation.z = quatValues.z;
      HMDRotation.w = quatValues.w;
      return state.lastUpdate = Date.now();
    }
  });
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === 32) {
      util.toggleFullScreen();
    }
    if (e.keyCode === 72) {
      return state.forceDistort = !state.forceDistort;
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
      return state.BaseRotation.setFromEuler(state.BaseRotationEuler);
    }
  });
};