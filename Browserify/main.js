var requireState = function(){

};

var requireControls = function() {

};

var setUpRemoteController = function() {

};

var setUpDeviceInputs = function(){

};

var setUpAppSwitcher = function() {

};

var checkParams = function() {

};

var display = function() {

};

//---------------------  Put above in their own files -------------

$(document).ready(function() {

	var state = requireState();
	var controls = requireControls();

	remoteController.setUp(state);
	deviceInputs.setUp(state);
	appSwitcher.setUp(state);
	params.check(state);
	display.start(state);
});
