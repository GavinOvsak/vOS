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
    page = 0
        
    resetPanel = (panel) ->
        panel.objects = []

        if mode is modes[0]
            app = undefined

            #order apps by most recently used. Get from server in order of mru. Update locally and send updates to server over sockets. "used: id"

            #in reverse order
            maxPages = Math.ceil(state.apps.length/6)
            if maxPages is 0
                page = 0
            else if page > maxPages - 1
                page = maxPages - 1

            if page > 0
                backIcon = new controls.Button(0, 3, 0.5, 1, {
                    text: '<'
                })
                backIcon.onClick(->
                    page--
                    resetPanel(panel)
                )
                panel.add(backIcon)
            if page < maxPages - 1            
                nextIcon = new controls.Button(11.5, 3, 0.5, 1, {
                    text: '>'
                })
                nextIcon.onClick(->
                    page++
                    resetPanel(panel)
                )
                panel.add(nextIcon)

            if state.apps.length > 0
                for i in [6*page...Math.min(6+6*page, state.apps.length)]# when Math.floor(i / 2) <= 3
                    app = state.apps[state.apps.length - i - 1]
                    row = Math.floor((i - 6 * page) / 2)
                    column = (i - 6 * page) % 2

                    closeButton = new controls.Button(5 + column * 5.5, 5 - 2 * row, 0.5, 1, {
                        text: 'X'
                    })
                    closeButton.onClick(((app) ->
                    	return ->
	                        index = state.user.recent.indexOf(app._id)
	                        if index >= 0
	                            state.user.recent.splice(index, 1)
	                        
	                        #Need to remove from actual apps
	                        index2 = -1
	                        for v, k in state.apps
	                            if v._id is app._id
	                                index2 = k
	                        if index2 >= 0
	                            state.apps.splice(index2, 1)

	                        $.post('http://vos.jit.su/removeAppMRU?token=' + token, {appID: app._id})
	                        resetPanel(panel)
                    )(app))

                    appIcon = new controls.Button(1 + column * 5.5, 5 - 2 * row, 4, 1, {
                        text: app.name,
                        #text_size: 15, 
                        icon: app.icon
                    })
                    appIcon.onClick(((app) ->
                        return ->
                            state.open(app, controls)
                    )(app))

                    panel.add(appIcon)
                    panel.add(closeButton)

            welcome = if state.user?.name? then state.user.name + ', please choose an app: ' else 'Please choose an app: '
            description = new controls.Label(3.5, 7, 8.5, 1, {
                text: welcome
            })
            panel.add(description)

            goToSearch = new controls.Button(0, 7, 3, 1, {
                text: 'Go to Search'
    #            text_size: 15
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

