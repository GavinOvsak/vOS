util = exports

eccentricity = 80/30
util.makeCircle = (amplitude) ->
  circle_resolution = 40
  greenLine = new THREE.LineBasicMaterial({color: 0x999999, linewidth: 2})
  circle_geometry = new THREE.Geometry()
  for j in [0..circle_resolution]
    theta = (j / circle_resolution) * Math.PI * 2
    circle_geometry.vertices.push( new THREE.Vector3(amplitude * Math.cos(theta), amplitude * Math.sin(theta)* eccentricity, 0))

  return new THREE.Line(circle_geometry, greenLine)

util.makeFullCircle = (amplitude) ->

  circle_resolution = 40
  green = new THREE.LineBasicMaterial({color: 0x333333})
  circle = new THREE.Shape()

  for j in [0..circle_resolution]
    theta = (j / circle_resolution) * Math.PI * 2
    x = amplitude * Math.cos(theta)
    y = amplitude * Math.sin(theta) * eccentricity
    if j is 0
        circle.moveTo(x, y)
    else
        circle.lineTo(x, y)

  geometry = circle.makeGeometry()
  return new THREE.Mesh(geometry, green)

util.exportMesh = (mesh) ->
  result = {}
#  result.type = 'Box / Line'
  result.vertices = mesh.geometry.vertices
  result.color = mesh.material.color if mesh.material.color?
  result.dataURI = mesh.material.map?.image?.toDataURL("image/jpeg")
  result.position = {x: mesh.position.x, y: mesh.position.y, z: mesh.position.z}
#  console.log(mesh.position)
  return result

util.cloneMesh = (mesh) ->
  copy = mesh.clone()
#  copy = new THREE.Mesh(mesh.geometry.clone(), mesh.material.clone())
#  if copy.material.map?
#    copy.material.map = mesh.material.map.clone()
#    copy.material.map.needsUpdate = true
#  copy.position = mesh.position.clone()
  if mesh.geometry.parameters?.height?
    copy.position.y += mesh.geometry.parameters.height/2
  if mesh.geometry.parameters?.width?
    copy.position.x += mesh.geometry.parameters.width/2
  return copy

util.cloneLine = (line) ->
  copy = line.clone()
#  copy = new THREE.Line(line.geometry.clone(), line.material.clone())
#  copy.position = line.position.clone()
  return copy

util.makeText = (text, px, width, height) ->
  canvas1 = document.createElement('canvas')
  canvas1.height = px + 10
  canvas1.width = canvas1.height * width / height * 2
#  canvas1.height = px + 10
#  canvas1.width = width * 700
  context1 = canvas1.getContext('2d')
  context1.font = 'Bold ' + px + ' px Arial'
  context1.fillStyle = 'rgba(255,255,255,0.95)'
  context1.fillText(' ' + text, 0, px)
  texture1 = new THREE.Texture(canvas1) 
  texture1.needsUpdate = true
  material1 = new THREE.MeshBasicMaterial( {map: texture1, side: THREE.DoubleSide } )
  material1.transparent = true
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material1)


util.setPanelPosition = (board, Mesh, x_disp, y_disp, z_disp) ->
  width = 0
  height = 0
  
  width = Mesh.geometry.parameters.width * board.geometry.parameters.width if Mesh.geometry.parameters?.width?

  height = Mesh.geometry.parameters.height * board.geometry.parameters.height if Mesh.geometry.parameters?.height?

  Mesh.scale.x = board.geometry.parameters.width
  Mesh.scale.y = board.geometry.parameters.height
  
  adjusted_x_disp = board.geometry.parameters.width * (x_disp - 0.5) + width / 2
  adjusted_y_disp = board.geometry.parameters.height * (y_disp - 0.5) + height / 2

  Mesh.position.x = board.position.x + adjusted_x_disp
  Mesh.position.y = board.position.y + adjusted_y_disp * Math.cos(board.rotation.x) - z_disp * Math.sin(board.rotation.x)
  Mesh.position.z = board.position.z + adjusted_y_disp * Math.sin(board.rotation.x) + z_disp * Math.cos(board.rotation.x)

  Mesh.rotation.x = board.rotation.x

util.inRange = (test, start, span) ->
  return start < test < start + span

util.rectContains = (point, x, y, width, height) ->
  return util.inRange(point.x, x, width) and util.inRange(point.y, y, height)
#  return x < point.x and point.x < x + width and y < point.y and point.y < y + height

util.vector = (a, b) ->
  return {
    x: b.x - a.x, 
    y: b.y - a.y
  }

util.dot = (a, b) ->
  return a.x * b.x + a.y * b.y

util.length = (a) ->
  return Math.sqrt(a.x * a.x + a.y * a.y)

util.distance = (a, b) ->
  return util.length(util.vector(a,b))

util.angle = (a, b) ->
  return Math.acos(util.dot(a, b) / (util.length(a) * util.length(b)))

util.rotate = (a, theta) ->
  return {
    x: a.x * Math.cos(theta) - a.y * Math.sin(theta),
    y: a.x * Math.sin(theta) + a.y * Math.cos(theta)
  }

util.add = (a, b) ->
  return {
    x: a.x + b.x, 
    y: a.y + b.y
  }

util.scale = (a, x_scale, y_scale) ->
  return {
    x: a.x * x_scale,
    y: a.y * y_scale
  }

util.angleRangeDeg = (angle) ->
  angle %= 360
  angle += 360 if angle < 0
  return angle

util.angleRangeRad = (angle) ->
  angle %= 2*Math.PI
  angle += 2*Math.PI if angle < 0
  return angle

util.deltaAngleDeg = (a,b) ->
  return Math.min(360 - (Math.abs(a - b) %360), Math.abs(a - b) % 360)

util.toggleFullScreen = ()->
  if (document.fullScreenElement and document.fullScreenElement isnt null) or   # alternative standard method
      (not document.mozFullScreen and not document.webkitIsFullScreen)          # current working methods
    if document.documentElement.requestFullScreen?
      document.documentElement.requestFullScreen()
    else if document.documentElement.mozRequestFullScreen?
      document.documentElement.mozRequestFullScreen()
    else if document.documentElement.webkitRequestFullScreen?
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
  else
    if document.cancelFullScreen?
      document.cancelFullScreen()
    else if document.mozCancelFullScreen?
      document.mozCancelFullScreen()
    else if document.webkitCancelFullScreen?
      document.webkitCancelFullScreen()

#Doesn't actually seem to be synchronous. Apparently not allowed on cross domain requests
util.getScriptSync = (url, callback) ->
  $.ajax({
        async:false, 
        type:'GET',
        url:url,
        data:null,
        success:callback,
        dataType:'script',
        timeout: 500
    })

#Doesn't actually seem to be synchronous.
util.getSync = (url, callback) ->
  $.ajax({
    async: false,
    url: url,
    success: callback
  })

util.getAsync = (url, callback) ->
  $.ajax({
    async: true,
    url: url,
    success: callback
  })

util.match = (oPath, word, probs) ->
  ### Checks if a word is present in a path or not. ###
  letters = word.split('')
  score = 1
  totalIndex = 0
  path = oPath

  #debugger
  for i in [0...letters.length]
    index = path.indexOf(letters[i])
    return 0 if index < 0
    score *= probs[totalIndex + index]
    totalIndex += index + 1
    path = path.substring(index + 1)
  return score
 
util.get_keyboard_row = ( char ) ->
  # Returns the row number of the character
  keyboardLayout = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
  for row_no in [0...keyboardLayout.length]
    if keyboardLayout[row_no]?.indexOf(char) >= 0
      return row_no
 
util.compress = (sequence) ->
  # Removes redundant sequential characters. ex : 11123311 => 1231
  ret_val = [sequence[0]]
  for i in [0...sequence.length]
    if ret_val[ret_val.length - 1] isnt sequence[i]
      ret_val.push(sequence[i])
  return ret_val

util.get_minimum_wordlength = (path) ->
  ###
  Returns the minimum possible word length from the path.
  Uses the number of transitions from different rows in 
  the keyboard layout to determin the minimum length
  ###
  row_numbers = path.split('').map(util.get_keyboard_row)
  compressed_row_numbers = util.compress(row_numbers)
  return compressed_row_numbers.length - 3

util.get_suggestion = (state, path, probs) ->
  ### Returns suggestions for a given path. ###

#  debugger
  if path.length is 0
    return []
  filtered = state.wordlist.filter((x) ->
    return x[x.length - 1] is path[path.length - 1].toLowerCase() #x[0] is path[0].toLowerCase()
  )
  #console.log(suggestions)
  
  suggestions = [] 
  matchScore = 0
  for i in [0...filtered.length]
    matchScore = util.match(path.toLowerCase(), filtered[i], probs)
    if matchScore > 0
      suggestions.push({
        word: filtered[i],
        score: matchScore
      })

  #console.log(suggestions)

  min_length = util.get_minimum_wordlength(path.toLowerCase())
#  console.log(min_length)
  suggestions = suggestions.filter((x) ->
    return x.word.length > min_length
  )

  return suggestions

