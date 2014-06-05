appSwitcher = exports

appSwitcher.setUp = (state, util, controls) ->
	state.notificationPanel = new controls.Panel()
	state.notificationPanel.objects = [] #[state.topBar]
	state.appSwitcher = {
		index: -1,
		panel: new controls.Panel()
		external: {}
	}

	searchResults = []
	selectionIndex = 0
	
	modes = [
		'Recent',
		'Search'
	]
	mode = modes[0]

	state.appSwitcher.external.drawContained = (scene) ->
		if mode is 'Search' and searchResults.length > 0
			#Show app results on the screen
			for i in [0...searchResults.length]
				text = if selectionIndex is i then '> ' + searchResults[i].name else searchResults[i].name
				testText = util.makeText(text, 30, 100, 20)
				testText.rotation.x = Math.PI / 2
				testText.position.y = 200
				testText.position.z = 50 + (selectionIndex - i) * 20
				scene.add(testText)
			###
			greenScreen = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
			screen = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), greenScreen)
			screen.rotation.x = Math.PI / 2
			screen.position.z = 50
			scene.add(screen)
			###


	query = ''
		
	resetPanel = (panel) ->
		panel.objects = []

		if mode is modes[0]
			row = 0
			column = 0
			app
			for i in [0...state.apps.length] when row < 3
				app = state.apps[i]
				
				appIcon = new controls.Button(0.5 + column * 6, 5 - 2 * row, 5, 1, {
					text: app.name,
	#				text_size: 15, 
					icon: app.icon
				})
				appIcon.onClick(((index) ->
					return ->
						state.open(state.apps[index])
				)(i))

				panel.add(appIcon)
				if column >= 2
					column = 0
					row++
				else
					column++

			description = new controls.Label(6, 7, 6, 1, {
				text: 'Please choose an app: '
			})
			panel.add(description)

			goToSearch = new controls.Button(0, 7, 3, 1, {
				text: 'Go to Search'
	#			text_size: 15
			})

			goToSearch.onClick(->
				console.log('Searching!')
				#Replace icons with keyboard
				mode = modes[1]
				resetPanel(panel)
			)
			panel.add(goToSearch)
		else if mode is modes[1]
			input = new Controls.Keyboard(0,0,9,6)
			panel.add(input)

			drag = new Controls.Treadmill(9.5,3,2,2, y: true)
			panel.add(drag) 

			yref = 0
			drag.onMove((x, y) ->
				increments = 0.1
				if yref - y > (searchResults.length - 1) * increments
					yref = y + (searchResults.length - 1) * increments
				if yref - y < 0
					yref = y
				selectionIndex = (yref - y) // increments
			)

			select = new Controls.Button(9.5,1,2,1, {
				text: 'Open'
			})
			panel.add(select)

			select.onClick(->
				console.log(searchResults[selectionIndex])
				state.addURL(searchResults[selectionIndex].url, searchResults[selectionIndex], true)
			)

			output = new Controls.Label(0,6,12,1, {text: ''})
			panel.add(output) 

			input.onTextUpdate((text) ->
				query = text
				output.updateOptions({
					text: text
				})
			)

			search = new Controls.Button(10, 7, 2, 1, {
				text: 'Search'
			})

			search.onClick(->
				console.log('Searching for ' + query)
				console.log("/appSearchJSON?query=#{query}")
				util.getAsync("/appSearchJSON?query=#{query}", (data) ->
					searchResults = data
					selectionIndex = 0
				)
			)
			panel.add(search)

			recentButton = new Controls.Button(0,7,4,1,{
				text: '< Recent Apps'
			})
			panel.add(recentButton)

			recentButton.onClick(->
				mode = modes[0]
				resetPanel(panel)
			)

	update = ->
		mode = modes[0]
		resetPanel(state.appSwitcher.panel)

	update()
	state.onAppListUpdate(update)

