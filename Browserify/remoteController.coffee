remoteController = exports

remoteController.setUp = (state, util) ->
	Point = (x, y, i) ->
		this.start = {
			x: x,
			y: y
		}
		this.x = x
		this.y = y
		this.i = i
		this.taken = false
		this.onRelease_callback = ->
		this.release = (x, y, i) ->
			this.onRelease_callback(x, y, i)
		this.onRelease = (callback) ->
			this.onRelease_callback = callback
		this.onMove_callback = (x, y, i) ->
		this.move = (x, y, i) ->
			this.x = x
			this.y = y
			this.onMove_callback(x, y, i)
		this.onMove = (callback) ->
			this.onMove_callback = callback
		undefined

	checkGrab = (point) ->
		panelApp = state.getPanelApp()
		if state.topBar.state isnt 'moving'
			if state.topBar.available and state.topBar.contains(point.x, point.y)
				state.topBar.registerPoint(point)
				point.taken = true
			objects = []
			switch state.mode
				when state.modes.Normal
					objects = objects.concat(panelApp.panel.objects)
				when state.modes.AppSwitch
					objects = objects.concat(state.appSwitcher.panel.objects)
				when state.modes.Notifications
					objects = objects.concat(state.notificationPanel.objects)
			for object in objects
				if object.available and object.contains(point.x, if state.topBar.state is 'overlay' then point.y else point.y - 1/12)
					object.registerPoint(point)
					point.taken = true
		# if state.hidden and state.topBar.available and not point.taken
		# 	state.topBar.registerPoint(point)
		# 	point.taken = true

	state.socket = io.connect('/')
	state.socket.on('disconnect', ->
		if sessionId isnt 'debug'
			window.location = state.fromURL
	)

	state.socket.emit('declare-type', {
		type: 'output',
		session_id: sessionId
	})

	state.socket.on('error', (result) ->
		if sessionId isnt 'debug'
			window.location = state.fromURL
	)

	state.socket.on('size', (data) ->
		state.deviceDimensions = {
			width: JSON.parse(data).width,
			height: JSON.parse(data).height
		}
	)

	state.socket.on('value', (data) ->
		parsed = JSON.parse(data)
		for name, value of parsed
			state.values[name] = value
			if state.valueListeners[name]
				for listener in state.valueListeners[name]
					listener(value)
	)	

	state.socket.on('start', (data) ->
		parsed = JSON.parse(data)
		point = new Point(parsed.x, parsed.y, parsed.i)
		state.points[parsed.i] = point
		checkGrab(point)
	)

	state.socket.on('move', (data) ->
		parsed = JSON.parse(data)
		point = state.points[parsed.i]
		if point?
			point.move(parsed.x, parsed.y, parsed.i)
			if not point.taken
				checkGrab(point)
	)

	state.socket.on('end', (data) ->
		parsed = JSON.parse(data)
		point = state.points[parsed.i]
		if point?
			point.release(parsed.x, parsed.y, parsed.i)
			state.points[parsed.i] = {}
	)
