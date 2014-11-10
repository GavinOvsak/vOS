var appSwitcher = exports;

appSwitcher.setUp = function(state, util, controls) {
	state.notificationPanel = new controls.Panel();
	state.appSwitcherPanel = new controls.Panel();

	state.notificationPanel.objects = [state.topBar];
	state.appSwitcherPanel.objects = [state.topBar];

	var modes = [
		'Recent',
		'Search'
	]

	var mode;
	var query = '';
	
		
	var resetPanel = function(panel) {

		panel.objects = [state.topBar];

		if (mode == modes[0]) {
			var row = 0;
			var column = 0;
			var app;
			for (var i = 0; i < state.apps.length && row < 3; i++) {
				var app = state.apps[i];
				
				var appIcon = new controls.Button(0.5 + column * 6, 5 - 2 * row, 5, 1, {
					text: app.name,
	//				text_size: 15, 
					icon: app.icon
				});
				appIcon.onClick((function(index){
					return function(){
						state.open(state.apps[index]);
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

			var description = new controls.Label(1, 7, 6, 1, {
				text: 'Please choose an app: '
			});
			panel.add(description);

			var search = new controls.Button(8, 7, 3, 1, {
				text: 'Go to Search'
	//			text_size: 15
			});

			search.onClick(function(){
				console.log('Searching!');
				mode = modes[1];
				resetPanel(panel);
				//Replace icons with keyboard
			})
			panel.add(search);
		} else if (mode == modes[1]) {
			var input = new Controls.Keyboard(0,0,9,6);
			panel.add(input);

			var drag = new Controls.Treadmill(9.5,3,2,2);
			panel.add(drag);

			var select = new Controls.Button(9.5,1,2,1, {
				text: 'Open'
			});
			panel.add(select);

			var output = new Controls.Label(0,6,12,1, {text: ''});
		    panel.add(output);

		    input.onTextUpdate(function(text) {
		    	query = text;
		    	output.updateOptions({
		    		text: text
		    	});
		    });

		    var search = new Controls.Button(10, 7, 2, 1, {
				text: 'Search'
			});

			search.onClick(function(){
				console.log('Searching for ' + query);
			})
			panel.add(search);

			var recentButton = new Controls.Button(0,7,4,1,{
				text: 'Recent Apps'
			});
			panel.add(recentButton);

			recentButton.onClick(function(){
				mode = modes[0];
				resetPanel(panel);
			})
		}
	}

	var update = function() {
		mode = modes[0];
		resetPanel(state.appSwitcherPanel);
	};

	update();
	state.onAppListUpdate(update);
};

