var app = exports;
var panel, user;

app.setUp = function(data) {
    panel = data.panel;
    user = data.user;

    var keyboard = new Controls.Keyboard(0,0,12,8, {});
    panel.add(keyboard);
};

app.name = "Welcome to vOS";

app.drawImmersive = function(scene) {

};

app.drawContained = function(scene) {

};

app.drawImmersiveBackground = function(scene) {
	app.drawImmersive(scene);
};
