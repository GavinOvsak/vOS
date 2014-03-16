$(document).ready(function() {
	var state = require('./state');
	var util = require('./util');
	var controls = require('./controls').setUp(state, util);

	require('./remoteController').setUp(state, util);
	require('./deviceInputs').setUp(state, util);
	require('./appSwitcher').setUp(state, util, controls);
	require('./params').check(state, util, controls);
	require('./display').start(state, util, controls);
});
