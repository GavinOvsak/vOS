deviceInputs = exports

MOUSE_SPEED = 0.005
USE_TRACKER = false

deviceInputs.setUp = (state, util) ->
  bridge = new OculusBridge({
      'onConnect' : ->
          #console.log('we are connected!')
      ,
      'onDisconnect' : ->
          #console.log('good bye Oculus.')
      ,
      'onOrientationUpdate' : (quatValues) ->
          HMDRotation.x = quatValues.x
          HMDRotation.y = quatValues.y
          HMDRotation.z = quatValues.z
          HMDRotation.w = quatValues.w
          state.lastUpdate = Date.now()
  })

  #bridge.connect()

  document.addEventListener('keydown', (e) ->
    if e.keyCode is 32
      util.toggleFullScreen()
    if e.keyCode is 72
      state.forceDistort = not state.forceDistort
  , false)

  # Mouse
  # ---------------------------------------
  viewer = $('#viewer')
  mouseButtonDown = false
  lastClientX = 0
  lastClientY = 0

  viewer.mousedown((event) ->
    mouseButtonDown = true
    lastClientX = event.clientX
    lastClientY = event.clientY
  )

  $(document).mouseup(() ->
    mouseButtonDown = false
  )

  viewer.mousemove((event) ->
    if mouseButtonDown
#      debugger
      enableX = (USE_TRACKER || state.vr isnt null) ? 0 : 1
      state.BaseRotationEuler.set(
        util.angleRangeRad(state.BaseRotationEuler.x + (event.clientY - lastClientY) * MOUSE_SPEED * enableX),
        util.angleRangeRad(state.BaseRotationEuler.y + (event.clientX - lastClientX) * MOUSE_SPEED),
        0.0
      )
      lastClientX = event.clientX
      lastClientY = event.clientY
      state.BaseRotation.setFromEuler(state.BaseRotationEuler)#new THREE.Euler(state.BaseRotationEuler[0], state.BaseRotationEuler[1], state.BaseRotationEuler[2], 'YZX'))
#      console.log(state.BaseRotation)
  )
