var params = exports;

params.check = function(state, util, controls) {
  var paramList = {};
  var items = window.location.search.substring(1).split("&");
  for (var i=0; i<items.length; i++) {
    var kvpair = items[i].split("=");
    paramList[kvpair[0]] = unescape(kvpair[1]);
  }

  if (paramList['from']) {
    state.fromURL = decodeURIComponent(paramList['from']);
  }

  state.mode = state.modes.AppSwitch;

  var setUpUser = function() {
    state.apps = [];
    state.user.recent.map(function(appID) {
      util.getSync('/appInfo?app_id=' + appID, function(data){
        (function(state, controls, data){
          window.module = {};
          window.module.exports = {};
          window.exports = window.module.exports;
          window.Controls = controls;
          util.getScriptSync(data.url, function() {
            //eval(data.contents);
            //console.log(data);
            var app = window.module.exports;
            delete window.module.exports;
            delete window.module;
            delete window.exports;
            window.module = {};
            window.module.exports = {};
            window.exports = window.module.exports;
            if (app != undefined) {
              state.add(app, controls);
            } else {
              console.log('App from ' + data.url + ' Failed To Load');
            }
          });
        })(state, controls, data);
      });
    });
  }

  if (token != '') {
    util.getSync('/userFromToken?token=' + token, function(data){
      if (data.recent) {
        state.user = data;
      }
      setUpUser();
    });
  }

//  recentApps = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf']; //For now. Use ajax get request to userFromToken later

  (function(state, controls, appQueryURL){
    window.module = {};
    window.module.exports = {};
    window.exports = window.module.exports;
    window.Controls = controls;
    util.getScriptSync(appQueryURL, function() {
      //eval(data.contents);
      var app = window.module.exports;
      if (app != undefined) {
        state.open(state.add(app, controls));
      } else {
        console.log('App from ' + appQueryURL + ' Failed To Load');
      }
    });
  })(state, controls, appQueryURL);
};
