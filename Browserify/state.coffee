state = exports

# ------- Variables --------

state.apps = []
state.front = undefined
state.back = undefined
state.front_and_back = undefined
state.points = []
state.width = window.innerWidth #1200
state.height = window.innerHeight #800
state.camera = undefined
state.values = {}
state.valueListeners = {}

state.modes = {
	Normal: 'normal',
	AppSwitch: 'app-switch',
	Notifications: 'notifications'
}
state.notificationPanel = undefined
state.appSwitcher = undefined
state.topBar = undefined#new VRK.SystemBar(0, 8 + 1/2, 12, 1)

numColumns = 12
numRows = 8
state.unitWidth = 1/numColumns
state.unitHeight = 1/(numRows + 1) #Leave space for top bar
state.oldState = state.modes.Normal
state.lastUpdate = 0
state.BaseRotationEuler = new THREE.Vector3()
state.BaseRotation = new THREE.Quaternion()
every = 0

# ----- Functions -------

state.open = (app) ->

	if not (state.front_and_back? and state.front_and_back.index is app.index) and 
			not (state.front? and state.front.index is app.index) and 
			not (state.back? and state.back.index is app.index) and state.user? and
			app._id not in state.user.recent
		state.user.recent.push(app._id)
		$.post('http://vos.jit.su/recentApps?token=' + token, {recent: state.user.recent})
		#Post app list update

	#if is already in front+back or back, go to front+back. If is already in front go to front
	if state.back? and state.back.index is app.index
		state.back = null
		state.front = null
		state.front_and_back = app
	else if not state.front_and_back? or state.front_and_back.index isnt app.index
		if app.external.drawContained?
			#if front and back app has back, push to back
			if state.front_and_back? and state.front_and_back.external.drawImmersiveBackground?
				state.back = state.front_and_back
			state.front_and_back = null
			state.front = app
		else if app.external.drawImmersive?
			state.front = null
			state.back = null
			state.front_and_back = app
		else if app.external.drawImmersiveBackground?
			state.front_and_back = null
			state.back = app
	state.mode = state.modes.Normal

	for listener in state.onAppListUpdate.listeners
		listener()

state.onAppListUpdate = (func) ->
	state.onAppListUpdate.listeners.push(func)

state.onAppListUpdate.listeners = []

state.fromURL = "/"

state.add = (app, controls) ->
	#make app.external and send it to app.event.load

	app.panel = new controls.Panel(app)
	app.index = state.apps.length
	state.apps.push(app)
	app.external = {
		panel: app.panel,
		user: {
			id: state.user.id,
			name: state.user.name
		}
	}

	((load, app) ->
		load(app)
	)(app.event.load, app.external)

	for listener in state.onAppListUpdate.listeners
		listener()
	return app
	#state.open(app)

state.canMaximize = ->
	return state.front? and state.front.external.drawImmersive?

state.canMinimize = ->
	return state.front_and_back? and state.front_and_back.external.drawContained?

state.getPanelApp = ->
	if state.front?
		return state.front
	else if state.front_and_back?
		return state.front_and_back
	return null

state.minimize = ->
	if state.canMinimize()
		state.front = state.front_and_back
		state.front_and_back = null

state.maximize = ->
	if state.canMaximize()
		state.front_and_back = state.front
		state.front = null
		state.back = null

state.toggleMaxMin = ->
	if state.front?
		state.maximize()
	else if state.front_and_back?
		state.minimize()

state.close = ->
	if state.front?
		if state.back? and state.back.external.drawImmersive?
			state.front_and_back = state.back
			state.back = null
		state.front = null
	else if state.front_and_back?
		state.front_and_back = null
	else if state.back?
		state.back = null

	if not state.front? and not state.front_and_back?
		state.mode = state.modes.AppSwitch

state.drawPanel = (scene, util) ->
	redLambert = new THREE.MeshLambertMaterial({ color: 0xCC0000 })

	panelMesh = new THREE.Mesh(
		new THREE.PlaneGeometry(80, 30),
		redLambert)

	panelMesh.position.x = state.camera.position.x + 0
	panelMesh.position.y = state.camera.position.y + 80
	panelMesh.position.z = state.camera.position.z - 20

	panelMesh.rotation.x = -1.1 + Math.PI/2

	panelApp = state.getPanelApp()

	mobileScene = new THREE.Scene()
	for mesh in state.topBar.draw()
		if state.topBar.state isnt 'overlay'
			mobileScene.add(util.cloneMesh(mesh))
		util.setPanelPosition(panelMesh, mesh, mesh.position.x, mesh.position.y, mesh.position.z)
		if state.topBar.state isnt 'mobile'
			scene.add(mesh)

	objects = []
	if state.topBar.state isnt 'moving'
		switch state.mode
			when state.modes.Normal
				if panelApp?
					objects = objects.concat(panelApp.panel.objects)
			when state.modes.Notifications
				objects = objects.concat(state.notificationPanel.objects)
			when state.modes.AppSwitch
				objects = objects.concat(state.appSwitcher.panel.objects)
		state.oldState = state.mode

	for object in objects
		meshes = object.draw()
		#meshes[1].material.map.image.toDataURL("image/jpeg")
		if meshes?
			for mesh in meshes
				if state.topBar.state is 'mobile'
					mesh.position.y += 1/12
					mobileScene.add(util.cloneMesh(mesh))
				util.setPanelPosition(panelMesh, mesh, mesh.position.x, mesh.position.y, mesh.position.z)
				if state.topBar.state is 'overlay'
					scene.add(mesh)

	if state.topBar.state is 'overlay'
		scene.add(panelMesh)

	circle_amplitude = 0.01
	for point in state.points
		if point? and point.x? and point.y?
			circle = util.makeCircle(circle_amplitude)
			circle.position.x = point.x
			circle.position.y = point.y
			circle.position.z = 0.12
			if state.topBar.state is 'mobile'
				circle.position.y += 1/12
				mobileScene.add(util.cloneLine(circle))
			util.setPanelPosition(panelMesh, circle, circle.position.x, circle.position.y, circle.position.z)
			if state.topBar.state isnt 'mobile'
				scene.add(circle)

	ambient = new THREE.AmbientLight( 0xeeeeee );

	directLight = new THREE.DirectionalLight(0xFFFFFF)
	directLight.position.x = 0
	directLight.position.y = 0
	directLight.position.z = 20

	mobileScene.add(state.mobileCamera)
	mobileScene.add(ambient)
	state.mobileRenderer.render(mobileScene, state.mobileCamera)
	mobileDataURI = state.mobileRenderer.domElement.toDataURL()
	if state.socket? and every % 10 is 0
		state.socket.emit('visual', mobileDataURI)

	every++

$.ajax({
	url: 'http://vos.jit.su/static/wordlist.txt',
	success: (wordlist) ->
		state.wordlist = wordlist.split('\r\n')
})

