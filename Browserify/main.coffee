$(document).ready(->
	require('./StereoEffect.js')
	require('./DeviceOrientationControls.js')
	state = require('./state')
	util = require('./util')
	controls = require('./controls').setUp(state, util)

	require('./remoteController').setUp(state, util)
	require('./deviceInputs').setUp(state, util)
	require('./appSwitcher').setUp(state, util, controls)
	require('./params').check(state, util, controls)
	require('./display').start(state, util, controls)
)