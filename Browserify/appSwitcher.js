var appSwitcher = exports;

appSwitcher.setUp = function(state, util, controls) {
	state.notificationPanel = new controls.Panel();
	state.appSwitcherPanel = new controls.Panel();

	state.notificationPanel.objects = [state.topBar];
	state.appSwitcherPanel.objects = [state.topBar];

	var update = function() {
		var row = 0;
		var column = 0;
		var index = 0;
		var app;
		state.appSwitcherPanel.objects = [state.topBar];

		for (var i = 0; i < state.apps.length; i++) {
			var app = state.apps[i];
			
			var icon = new controls.Button(2 + row * 2, 6 - 2 * column, 1, 1, {
				text: ' ' + i,
				text_size: 15, 
				icon: app.icon
			});
			icon.onClick((function(index){
				return function(){
					state.open(state.apps[index]);
				};
			})(i));
			state.appSwitcherPanel.add(icon);
			if (row >= 4) {
				row = 0;
				column++;
			} else {
				row++;
			}
		}
	};
	update();
	state.onAppListUpdate(update);
};


