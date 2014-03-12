Sections:
Define Utility Functions
Define Controls
Define Point
camera start
make kM state variables
define keyboard
make camera and renderer
camera start again
make lights
define check grab for a point
make system bar which is a control but changes state
notification keyboard and app switcher keyboard setUp

maybe treat app switcher as an app
define open, add, close, maximize, getKeyboardApp state helper functions
toggleFullScreen, listen to keyboard
connect to socket and start updating point state
make oculus bridge and connect
more utilities
initWebGL camera and oculus rift and renderer
init mouse controls
init vr set Ui size, resize listener
getParams
make lights again
render loop
document ready function initializes everything ad runs first render


Overarching Structure:
Make global state object (no functions)
Make global util object for Utility Functions under util.<name>
connect to socket
make control object

App Facing API

Controls.______
require();
exports.drawFront()
exports.drawBack()
exports.drawFrontAndBack()
exports.setUp({
	panel: {},
	userID: Number
})

vOS.moveAroundUser(mesh, user_pose, options)  //meant for back control
user_pose = {
	x: Float,
	y: Float,
	z: Float,
	angle: Float,
	tilt: Float
}
options = {
	translate: true,
	rotate: true
}

