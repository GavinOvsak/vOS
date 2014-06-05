params = exports

params.check = (state, util, controls) ->
  paramList = {}
  items = window.location.search.substring(1).split("&")
  for i in [0...items.length]
    kvpair = items[i].split("=")
    paramList[kvpair[0]] = unescape(kvpair[1])

  if paramList['from']?
    state.fromURL = decodeURIComponent(paramList['from'])

  state.mode = state.modes.AppSwitch

  setUpUser = ->
    state.apps = []
#    window.testApps = []
    window.Controls = controls

    for appID in state.user.recent
      util.getSync('/appInfo?app_id=' + appID, (appData, textStatus, jqxhr) ->
        state.addURL(appData.url, appData)
      )

  if token isnt ''
    util.getSync('/userFromToken?token=' + token, (data) ->
      if data.recent
        state.user = data
      setUpUser()
    )

#  recentApps = ['5315354db87e860000a11cbc', '53449c8eb27e5500009434cf'] #For now. Use ajax get request to userFromToken later


  if appQueryURL?
    state.addURL(appQueryURL, null, true)

    #((state, controls, appURL) ->
    ###
      window.testApps[appID] = {
        event: {}
      }
      util.getSync(appURL, (data, textStatus, jqxhr) ->
        ((vOS, program) ->
            eval(program)
        )({
          onEvent: (eventType, f) ->
            window.testApps[appID].event[eventType] = f
          makeTextMesh: (options) ->
            return {} #To Do
        })
        if window.testApps[appID].event.load?
          state.add(window.testApps[appID], controls)
        else
          console.log('App from ' + appURL + ' Failed To Load')
      )
    ###
    ###
      #debugger;
      window.vOS = {
        onEvent: (eventType, f) ->
          this.app.event[eventType] = f
        getValues: ->
          return state.values
        makeTextMesh: (options) ->
          text = options.text or ''
          px = options.px or 30
          width = options.width or 20
          height = options.height or 20
          textMesh = util.makeText(text, px, width, height)
          textMesh.rotation.x = Math.PI/2
          textMesh.position.z = 50 + (options.y or 0)
          textMesh.position.x = 0 + (options.x or 0)
          return textMesh
        getValue: (name) ->
          return state.values[name]
        addListener: (name, f) ->
          unless state.valueListeners[name]?
            state.valueListeners[name] = []
          state.valueListeners[name].push(f)
        removeListener: (name, f) ->
          index = state.valueListeners[name].indexOf(f)
          if index > -1
            state.valueListeners[name].pop(index)
        app: {
          event: {}
        }
      }
      util.getScriptSync(appURL, (data, textStatus, jqxhr) ->
        if vOS.app.event.load?
          for k, v of appData
            vOS.app[k] = v
          state.add(vOS.app, controls)
        else
          console.log('App from ' + appURL + ' Failed To Load')
        #window.app
        window.vOS.app = {
          event: {}
        }
      )
    )(state, controls, appQueryURL)
    ###
    ###
    ((state, controls, appURL) ->
      app = {event: {}}
      window.Controls = controls
      window.vOS = {
        onEvent: (eventType, f) ->
          app.event[eventType] = f
        makeTextMesh: (options) ->
          return {} #To Do
      }

      util.getScriptSync(appURL, ->
        delete window.app
        delete window.vOS
      )
      if app.event.load?
        state.add(app, controls)
      else
        console.log('App from ' + appURL + ' Failed To Load..')
    )(state, controls, appQueryURL)
    ###
