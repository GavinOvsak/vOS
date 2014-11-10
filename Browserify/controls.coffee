eccentricity = 80/30
if not exports?
    controlObjects = {}
    exports = controlObjects

exports.setUp = (state, util) ->
    controls = {}

    controls.Object = (x, y, width, height, options) ->
        this.x = (x or 0) * state.unitWidth
        this.y = (y or 0) * state.unitHeight
        this.width = (width or 1) * state.unitWidth
        this.height = (height or 1) * state.unitHeight
        this.options = options or {}

        for method of controls.Object.prototype
            this[method] = controls.Object.prototype[method]
        undefined

    controls.Object.prototype = {
        setX: (x) -> this.x = x
        setY: (y) -> this.y = y
        setWidth: (width) -> this.width = width
        setHeight: (height) -> this.height = height
        updateOptions: (options) ->
            for option, value of options
                this.options[option] = value
    }

    controls.Button = ->
        controls.Object.apply(this, arguments)
        this.applyDefaults()
        undefined

    controls.Button.prototype = {
        applyDefaults: ->
            defaultOptions = {
                text_size: 30,
                text: '',
                toggle: false
            }

            this.options = {} unless this.options?
            for key, option of defaultOptions
                this.options[key] = option unless this.options[key]?

            this.initGrab = {
                x: 0,
                y: 0
            }
            this.point = undefined
            this.isOn = false
        thickness: 0.1
        available: true
        contains: (x, y) ->
            return this.x < x < this.x + this.width and this.y < y < this.y + this.height
        onClick_callback: (isOn) ->
        click: (isOn) ->
            this.onClick_callback(isOn)
        onClick: (callback) ->
            this.onClick_callback = callback
        release: (x, y) ->
            this.available = true
            if this.point? and this.contains(this.point.x, this.point.y)
                this.click(!this.isOn)
                if this.options.toggle
                    this.isOn = !this.isOn
            this.point = undefined
        ###
        dragDistance: ->
            if(this.point?) {
                return util.distance(this.point, this.initGrab)
            }
            return 0
        },
        ###
        registerPoint: (point) ->
            this.initGrab.x = point.x
            this.initGrab.y = point.y
            this.point = point
            point.onRelease(this.release.bind(this))
            this.available = false
        draw: ->
            meshArray = []
            #change color based on distance

            materialOptions = {}

            if this.point? and not this.contains(this.point.x, this.point.y)
                this.available = true
                state.points[this.point.i].taken = false
                this.point = undefined

            if this.isOn
                if this.point?
                    if this.contains(this.point.x, this.point.y)
                        materialOptions.color = 200
                    else
                        materialOptions.color = (100 << 16) + (100 << 8) + 100
                else
                    materialOptions.color = (200 << 8)
            else
                if this.point?
                    if this.contains(this.point.x, this.point.y)
                        materialOptions.color = (200 << 8)
                    else
                        materialOptions.color = (100 << 16) + (100 << 8) + 100
                else
                    materialOptions.color = 200

            material = new THREE.MeshBasicMaterial(materialOptions)

            buttonMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(this.width, this.height),
                material)

            buttonMesh.position.x = this.x
            buttonMesh.position.y = this.y
            buttonMesh.position.z = 0.05
            meshArray.push(buttonMesh)

            #util.setPanelPosition(panelMesh, buttonMesh, this.x, this.y, 0.1)
            #scene.add(buttonMesh)

            canvas1 = document.createElement('canvas')
            
            px = this.options.text_size
            if this.options.text isnt ''
                contentMesh = util.makeText(this.options.text, px, this.width, this.height)

                contentMesh.position.x = this.x
                contentMesh.position.y = this.y
                contentMesh.position.z = 0.1
                meshArray.push(contentMesh)

#                util.setPanelPosition(panelMesh, contentMesh, this.x, this.y, 0.2)
#                scene.add( contentMesh )
            ###
            else if this.options.image?
                canvas1.height = 200
                canvas1.width = 200
                context1 = canvas1.getContext('2d')
                texture1 = new THREE.Texture(canvas1) 
                imageObj = new Image()
                imageObj.src = this.options.image
                imageObj.onload = ->
            ###
            ###
            context1.drawImage(imageObj, 0, 0)
            if ( texture1 ) {
                texture1.needsUpdate = true
                material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } )
                material1.transparent = true
                contentMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material1)
                util.setPanelPosition(panelMesh, contentMesh, this.x, this.y, 0.2)
                scene.add( contentMesh )
            }
            ###
            return meshArray
    }

    controls.LinearSlider = ->
        controls.Object.apply(this, arguments)
        this.applyDefaults()
        undefined

    controls.LinearSlider.direction = {
        VERTICAL: 'vertical',
        HORIZONTAL: 'horizontal'
    }

    controls.LinearSlider.prototype = {
        applyDefaults: ->
            defaultOptions = {
                direction: controls.LinearSlider.direction.VERTICAL,
                returnsToCenter: false,
                initProgress: 0.5
            }

            this.options = {} unless this.options?
            for key, option of defaultOptions
                this.options[key] = option unless this.options[key]?

            this.line_width = 0.1
            this.grip_height = 0.5

            this.progress = this.options.initProgress

            this.initGrab = {
                x: 0,
                y: 0,
                progress: 0
            }
        available: true
        point: undefined
        thickness: 0.1
        getProgress: ->
            if not this.progress?
                this.progress = this.options.initProgress or 0.5

            if this.point?
                if this.options.direction is controls.LinearSlider.direction.VERTICAL
                    this.progress = this.initGrab.progress + (this.point.y - this.initGrab.y)/(this.height - this.grip_height * state.unitHeight)
                else if this.options.direction is controls.LinearSlider.direction.HORIZONTAL
                    this.progress = this.initGrab.progress + (this.point.x - this.initGrab.x)/(this.width - this.grip_height * state.unitWidth)
            this.progress = Math.max(Math.min(this.progress, 1), 0)
            return this.progress
        contains: (x, y) ->
            if this.options.direction is controls.LinearSlider.direction.VERTICAL
                return x > this.x and x < this.x + this.width and 
                    y > this.y + (this.height - this.grip_height * state.unitHeight) * this.progress and 
                    y < this.y + (this.height - this.grip_height * state.unitHeight) * this.progress + this.grip_height * state.unitHeight
            else if this.options.direction is controls.LinearSlider.direction.HORIZONTAL
                return y > this.y and y < this.y + this.height and 
                    x > this.x + (this.width - this.grip_height * state.unitWidth) * this.progress and 
                    x < this.x + (this.width - this.grip_height * state.unitWidth) * this.progress + this.grip_height * state.unitWidth
        onRelease_callback: (progress) ->
        onRelease: (callback) ->
            this.onRelease_callback = callback
        setProgress: (progress) ->
            this.progress = progress
        release: (x, y) ->
            this.onRelease_callback(this.getProgress())
            if this.options.returnsToCenter
                this.progress = 0.5
            this.available = true
            this.point = undefined
        onMove_callback: (progress) ->
        onMove: (callback) ->
            this.onMove_callback = callback
        move: (x, y) ->
            this.onMove_callback(this.getProgress())
        registerPoint: (point) ->
            this.initGrab.x = point.x
            this.initGrab.y = point.y
            this.initGrab.progress = this.progress
            this.point = point
            point.onRelease(this.release.bind(this))
            point.onMove(this.move.bind(this))
            this.available = false
        draw: ->
            meshArray = []
            #Draw line and then draw grip on top.
            line_material = new THREE.MeshBasicMaterial({color: 0x222222})
            grip_material = new THREE.MeshBasicMaterial({color: 0x224222})

            if this.options.direction is controls.LinearSlider.direction.VERTICAL
                line = new THREE.Mesh(
                    new THREE.PlaneGeometry(this.line_width * state.unitWidth, this.height), line_material)
                line.position.x = this.x + (this.width - this.line_width * state.unitWidth)/2
                line.position.y = this.y
                line.position.z = 0.05
#                util.setPanelPosition(panelMesh, line, this.x + (this.width - this.line_width * state.unitWidth)/2, this.y, 0.1)
                gripMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(this.width, this.grip_height * state.unitHeight), grip_material)
                gripMesh.position.x = this.x
                gripMesh.position.y = this.y + (this.height - this.grip_height * state.unitHeight) * this.progress
                gripMesh.position.z = 0.1
#                util.setPanelPosition(panelMesh, gripMesh, this.x, this.y + (this.height - this.grip_height * state.unitHeight) * this.progress, 0.11)
            else if this.options.direction is controls.LinearSlider.direction.HORIZONTAL
                line = new THREE.Mesh(
                    new THREE.PlaneGeometry(this.width, this.line_width * state.unitHeight), line_material)
                line.position.x = this.x
                line.position.y = this.y + (this.height - this.line_width * state.unitHeight)/2
                line.position.z = 0.05
#                util.setPanelPosition(panelMesh, line, this.x, this.y + (this.height - this.line_width * state.unitHeight)/2, 0.1)
                gripMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(this.grip_height * state.unitWidth, this.height), grip_material)
                gripMesh.position.x = this.x + (this.width - this.grip_height * state.unitWidth) * this.progress
                gripMesh.position.y = this.y
                gripMesh.position.z = 0.1
#                util.setPanelPosition(panelMesh, gripMesh, this.x + (this.width - this.grip_height * state.unitWidth) * this.progress, this.y, 0.11)
            meshArray.push(line)
            meshArray.push(gripMesh)
#            scene.add(line)
#            scene.add(gripMesh)
            return meshArray
    }

    controls.Treadmill = ->
        controls.Object.apply(this, arguments)
        this.applyDefaults()
        undefined

    controls.Treadmill.prototype = {
        applyDefaults: ->
            defaultOptions = {
                x: false,
                y: false,
                rotate: false,
                zoom: false,
                zoomIn: false,
                zoomOut: false
            }

            this.options = this.options or {}
            for key, option of defaultOptions
                this.options[key] = option unless this.options[key]?
        thickness: 0.1
        available: true
        max_fingers: 2#Could modify later to handle more
        state: {
            x: 0,
            y: 0,
            angle: 0,
            zoom: 1
        }
        startState: {
            x: 0,
            y: 0,
            angle: 0,
            zoom: 1
        }
        grabInfo: {
            x: 0,
            y: 0,
            angle: 0,
            zoom: 1
        }
        points: []
        cloneState: (state) ->
            return {
                x: state.x,
                y: state.y,
                angle: state.angle,
                zoom: state.zoom,
            }
        contains: (x, y) ->
            return this.x < x < this.x + this.width and this.y < y < this.y + this.height
        onRelease_callback: (x, y, angle, zoom) ->
        onRelease: (callback) ->
            this.onRelease_callback = callback
        release: (x, y, i) ->
            this.onRelease_callback(this.state.x, this.state.y, this.state.angle, this.state.zoom)
            this.available = true
            this.startState = {
                x: this.state.x,
                y: this.state.y,
                angle: this.state.angle,
                zoom: this.state.zoom
            }
            this.points[i] = undefined
            this.setGrabInfo()
        getTouchAngle: ->
            if this.getNumPoints() < 2
                return 0
            else if this.points[0]? and this.points[1]?
                return Math.atan2(this.points[0].x - this.points[1].x, this.points[0].y - this.points[1].y)
            return 0
        getTouchCenter: ->
            x = 0
            y = 0

            for point in this.points
                if point?
                    x += point.x
                    y += point.y

            return {
                x: x/Math.max(1, this.getNumPoints()),
                y: y/Math.max(1, this.getNumPoints())        
            }
        getNumPoints: ->
            counter = 0
            for point in this.points
                counter += if point? and point.x? and point.y? then 1 else 0
            return counter
        getTouchSeparation: ->
            if this.getNumPoints() < 2
                return 1
            else if this.points[0]? and this.points[1]?
                return util.distance(this.points[0], this.points[1])
        setGrabInfo: ->
            center = this.getTouchCenter()
            this.grabInfo = {
                x: center.x,
                y: center.y,
                angle: this.getTouchAngle(),
                zoom: this.getTouchSeparation()
            }
        registerPoint: (point) ->
            this.startState = this.cloneState(this.state)
            this.points[point.i] = point
            this.setGrabInfo()
            point.onRelease(this.release.bind(this))
            point.onMove(this.move.bind(this))
            if this.getNumPoints() >= this.max_fingers
                this.available = false
        getNewState: ->
            newState = this.cloneState(this.startState)
            if this.options.rotate
                newState.angle = this.startState.angle + this.getTouchAngle() - this.grabInfo.angle
            disp = util.vector(this.getTouchCenter(), this.grabInfo)
            if this.options.x?
                newState.x = this.startState.x + disp.x * Math.cos(newState.angle) - disp.y * Math.sin(newState.angle)
            if this.options.y?
                newState.y = this.startState.y + disp.x * Math.sin(newState.angle) + disp.y * Math.cos(newState.angle)
            if this.options.zoom or (this.options.zoomIn and this.grabInfo.zoom > this.getTouchSeparation()) or (this.options.zoomOut and this.grabInfo.zoom < this.getTouchSeparation())
                newState.zoom = this.startState.zoom * this.grabInfo.zoom / this.getTouchSeparation()
            return newState
        onMove_callback: (x, y, angle, zoom) ->
        onMove: (callback) ->
            this.onMove_callback = callback
        move: (x, y, i) ->
            this.state = this.getNewState()
            this.onMove_callback(this.state.x, this.state.y, this.state.angle, this.state.zoom)
        draw: ->
            meshArray = []
            material = new THREE.MeshBasicMaterial({color: 0x222222})
            treadMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(this.width, this.height),
                material)
#            util.setPanelPosition(panelMesh, treadMesh, this.x, this.y, 0.1)
#            scene.add(treadMesh)
            treadMesh.position.x = this.x
            treadMesh.position.y = this.y
            treadMesh.position.z = 0.1
            meshArray.push(treadMesh)

            #Draw Lines to show movement
            #start with vertical lines. Ideally would draw only what is needed. Use modulus.

            #Shift then rotate?

            #Line is a point and a direction. Write function to take it in along with bounds to crop.
            return meshArray
    }

    controls.Label = ->
        controls.Object.apply(this, arguments)
        this.applyDefaults()
        undefined

    controls.Label.prototype = {
        available: false
        applyDefaults: ->
            defaultOptions = {
                text: '',
                px: 30
            }
            this.options = {} unless this.options?
            for key, option of defaultOptions
                this.options[key] = option unless this.options[key]?
        thickness: 0.1
        contains: (x, y) ->
            return false
        draw: ->
            meshArray = []
            material = new THREE.MeshBasicMaterial({color: 0x222222})

            buttonMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(this.width, this.height), material)

            buttonMesh.position.x = this.x
            buttonMesh.position.y = this.y
            buttonMesh.position.z = 0.05
            meshArray.push(buttonMesh)

#            util.setPanelPosition(panelMesh, buttonMesh, this.x, this.y, 0.1)
#            scene.add(buttonMesh)

            textMesh = util.makeText(this.options.text, this.options.px, this.width, this.height)

            ###
            canvas1 = document.createElement('canvas')
            canvas1.height = this.options.px
            canvas1.width = this.options.px * this.width / this.height
            context1 = canvas1.getContext('2d')
            context1.font = "Bold " + this.options.px + "px Arial"
            context1.fillStyle = "rgba(255,255,255,0.95)"
            context1.fillText(this.options.text, 0, this.options.px)
            texture1 = new THREE.Texture(canvas1) 
            texture1.needsUpdate = true
            material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } )
            material1.transparent = true
            textMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), material1)
            ###
            
#            util.setPanelPosition(panelMesh, textMesh, this.x, this.y, 0.2)
#            scene.add(textMesh)

            textMesh.position.x = this.x
            textMesh.position.y = this.y
            textMesh.position.z = 0.1
            meshArray.push(textMesh)
            return meshArray
    }

    controls.Keyboard = ->
        controls.Object.apply(this, arguments)
        this.applyDefaults()
        undefined

    #Number of cursors.. Do like android. Many cursors, one line.

    controls.Keyboard.prototype = {
        gestureThresholdDistance: 0.2,
        available: true,
        applyDefaults: ->
            defaultOptions = {
                startText: ''
            }

            this.points = []
            this.text = ''
            this.gesturePoint = undefined
            this.shifted = true

            this.makeKeys()

            this.options = {} unless this.options?
            for key, option of defaultOptions
                this.options[key] = option unless this.options[key]?
        thickness: 0.1
        makeKey: (getChar, x, y, width, height, apply) ->
            keyboard = this
            return {
                apply: apply,
                getChar: getChar,
                x: x,
                y: y,
                width: width,
                height: height,
                toString: ->
                    return this.getChar()
                ,
                contains: (x, y) ->
                    return util.rectContains({x: x, y: y}, 
                        this.x * keyboard.width + keyboard.x, 
                        this.y * keyboard.height + keyboard.y, 
                        this.width * keyboard.width, this.height * keyboard.height)
            }
        initPoint: (point) ->
            initKey = this.getKey(point.x, point.y)
            this.points[point.i] = {
                key: undefined,
                gesturing: false,
                trail: [],
                keyTrails: [],
                dragDist: ->
                    #should be total length
                    if this.initGrab
                        return util.distance(this, this.initGrab)
                    else
                        return 0
                ,
                update: (x, y, key) ->
                    if key and not this.initGrab
                        this.initGrab = {
                            x: x,
                            y: y,
                            key: key
                        }
                    if this.x isnt x or this.y isnt y
                        this.x = x
                        this.y = y
                        this.trail.push({
                            x: this.x, 
                            y: this.y
                        })
                        if this.key isnt key
                            if this.keyTrails.length isnt 0
                                this.keyTrails[this.keyTrails.length - 1].trailEnd = this.trail.length
                            if key?
                                this.keyTrails.push({key: key, trailStart: this.trail.length})
                        this.key = key
            }
            this.points[point.i].update(point.x, point.y, initKey)
            if initKey?
                this.points[point.i].initGrab = {
                    x: point.x,
                    y: point.y,
                    key: initKey
                }
        makeKeys: ->
            board = this
            this.keys = [
                this.makeKey((-> if board.shifted then 'Q' else 'q'), 0.0083, 0.785, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'W' else 'w'), 0.0975, 0.785, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'E' else 'e'), 0.1866, 0.785, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'R' else 'r'), 0.2775, 0.785, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'T' else 't'), 0.3666, 0.785, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'Y' else 'y'), 0.4566, 0.785, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'U' else 'u'), 0.5466, 0.785, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'I' else 'i'), 0.6375, 0.785, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'O' else 'o'), 0.7266, 0.785, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'P' else 'p'), 0.8166, 0.785, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'A' else 'a'), 0.0516, 0.5366, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'S' else 's'), 0.1416, 0.5366, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'D' else 'd'), 0.2325, 0.5366, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'F' else 'f'), 0.3225, 0.5366, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'G' else 'g'), 0.4116, 0.5366, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'H' else 'h'), 0.5016, 0.5366, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'J' else 'j'), 0.5916, 0.5366, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'K' else 'k'), 0.6825, 0.5366, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'L' else 'l'), 0.7725, 0.5366, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then '\\\/' else '^'), 0.0166, 0.2933, 0.075, 0.2, (text) -> 
                    board.shifted = !board.shifted
                    return text),
                this.makeKey((-> if board.shifted then 'Z' else 'z'), 0.1066, 0.2933, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'X' else 'x'), 0.1966, 0.2933, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'C' else 'c'), 0.2866, 0.2933, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'V' else 'v'), 0.3766, 0.2933, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'B' else 'b'), 0.4675, 0.2933, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'N' else 'n'), 0.5575, 0.2933, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> if board.shifted then 'M' else 'm'), 0.6466, 0.2933, 0.075, 0.2, (text) -> return text + this.getChar()),
                this.makeKey((-> 'Space'), 0.2866, 0.045, 0.435, 0.2, (text) -> return text + ' '),
                this.makeKey((-> '<-'), 0.905, 0.7833, 0.0833, 0.2, (text) -> return if text.length > 0 then text.substring(0, text.length - 1) else text)
            ]
        getKey: (x, y) ->
            for i, key of this.keys
                if key.contains(x, y)
                    return key
        contains: (x, y) ->
            return this.x < x < this.x + this.width and this.y < y < this.y + this.height
        getText: ->
            return this.options.text
        setText: (text) ->
            if Object.prototype.toString.call(text) is '[object String]' #check if is string
                this.options.text = text
            return this.options.text
        registerPoint: (point) ->
            this.initPoint(point)
            point.onRelease(this.release.bind(this))
            point.onMove(this.move.bind(this))
        release: (x, y, i) ->
            if this.gesturePoint is this.points[i]
                #Implement epic gesture algorithm, plain for now

                keySequence = ''
                curvatures = []
                #console.log(this.gesturePoint.keyTrails)
                for trail in this.gesturePoint.keyTrails
                    trailStart = trail.trailStart
                    trailEnd = trail.trailEnd
                    segment = this.gesturePoint.trail.slice(trailStart, trailEnd)
                    keySequence += trail.key.getChar()
                    data = segment.map((n) ->
                        return [n.x, n.y]
                    )
                    curvatures.push(1/ss.r_squared(data, ss.linear_regression().data(data).line()))
                #console.log(keySequence)
                #console.log(curvatures)

                #Find Possible Words

                suggestions = util.get_suggestion(state, keySequence, curvatures)
                console.log(suggestions)

                bestWord = ''
                bestScore = 0
                for i in [0...suggestions.length]
                    if suggestions[i].score > bestScore
                        bestScore = suggestions[i].score
                        bestWord = suggestions[i].word

                #console.log(bestWord)
                
                if bestWord?[0]? and this.shifted
                    bestWord = bestWord[0].toUpperCase() + bestWord.slice(1)
                    this.shifted = false

                if this.text.length isnt 0
                    this.text = this.text + ' ' + bestWord
                else
                    this.text = bestWord
                #this.text = this.points[i].initGrab.key.apply(this.text)
                this.onTextUpdate_callback(this.text)
                this.gesturePoint = undefined
            else if this.getKey(x,y)?
                this.text = this.getKey(x,y).apply(this.text)
                this.onTextUpdate_callback(this.text)

            console.log(this.text)
            this.points[i] = undefined

            if this.points.length is 0
                this.gesturePoint = undefined
        move: (x, y, i) ->
            #console.log(this.getKey(x, y))
            this.points[i].update(x, y, this.getKey(x, y))
            if not this.gesturePoint and this.points[i].dragDist() > this.gestureThresholdDistance
                this.gesturePoint = this.points[i]
                this.gesturePoint.gesturing = true
        onTextUpdate_callback: (text) ->
        onTextUpdate: (callback) ->
            this.onTextUpdate_callback = callback
        draw: ->
            meshArray = []
            material = new THREE.MeshBasicMaterial({color: 0x222222})

            ###            
            progress = {}
            for (i in this.points) {
                if (this.points[i] and this.points[i].initGrab and this.points[i] isnt this.gesturePoint)
                    progress[this.points[i].initGrab.key] = Math.min(this.points[i].dragDist()/this.thresholdDistance, 1)
            }###

            for key in this.keys
                keyMaterialOptions = {color: 0x222222}
                ###if (progress[key.char]) {
                    keyMaterialOptions.color = (34 << 16) + (200 * 0 << 8) + (1 - progress[key.char]) * 255
                }###

                keyMaterial = new THREE.MeshBasicMaterial(keyMaterialOptions)
                keyMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(key.width * this.width, key.height * this.height), keyMaterial)
                keyMesh.position.x = key.x * this.width + this.x
                keyMesh.position.y = key.y * this.height + this.y
                keyMesh.position.z = 0.05
                meshArray.push(keyMesh)
#                util.setPanelPosition(panelMesh, keyMesh, key.x * this.width + this.x, key.y * this.height + this.y, 0.01)
#                scene.add(keyMesh)

                #Draw The Letters
                contentMesh = util.makeText(key.getChar(), 30, key.width * this.width, key.height * this.height)
                contentMesh.position.x = key.x * this.width + this.x
                contentMesh.position.y = key.y * this.height + this.y
                contentMesh.position.z = 0.08
                meshArray.push(contentMesh)
#                util.setPanelPosition(panelMesh, contentMesh, key.x * this.width + this.x, key.y * this.height + this.y, 0.02)
#                scene.add( contentMesh )

            if this.gesturePoint
                greyLine = new THREE.LineBasicMaterial({color: 0x999999, linewidth: 2, })
                gestureGeometry = new THREE.Geometry()
                for point in this.gesturePoint.trail
                    gestureGeometry.vertices.push(new THREE.Vector3(point.x, point.y, 0))
                gestureLine = new THREE.Line(gestureGeometry, greyLine)
                gestureLine.position.x = this.x
                gestureLine.position.y = this.y
                gestureLine.position.z = 0.1
                meshArray.push(gestureLine)

#                util.setPanelPosition(panelMesh, gestureLine, this.x, this.y, 0.02)
#                scene.add(gestureLine)

            return meshArray
    }

    controls.Joystick = ->
        controls.Object.apply(this, arguments)
        this.applyDefaults()
        undefined

    controls.Joystick.prototype = {
        applyDefaults: ->
            if this.options.radius?
                this.max_drag = this.options.radius * state.unitWidth
            else
                this.max_drag = 1/4

            defaultOptions = {
                returnsToCenter: true
            }

            this.options = {} unless this.options?
            for key, option of defaultOptions
                this.options[key] = option unless this.options[key]?
            this.initGrab = {
                x: 0,
                y: 0
            }
        thickness: 0.1
        radius: 0.04
        available: true
        point: undefined
        contains: (x, y) ->
            #handle not alway going back to center
            return Math.sqrt(Math.pow(x - this.x,2) + Math.pow((y - this.y) / eccentricity,2)) < this.radius
        release: (x, y) ->
            this.available = true
            if this.options.returnsToCenter
                this.onMove_callback(0, 0)
            else 
                this.onMove_callback(x - this.x, y - this.y)
            this.onRelease_callback(x - this.x, y - this.y)
            this.point = undefined
        onRelease_callback: (x, y) ->
        onRelease: (callback) ->
            this.onRelease_callback = callback
        onMove_callback: (x, y) ->
        move: (x, y) ->
            scaling_factor_x = 1
            scaling_factor_y = 1
            x_shift = this.point.x - this.initGrab.x
            y_shift = this.point.y - this.initGrab.y
            dist = util.length({x:(this.point.x - this.x), y:(this.point.y - this.y) / eccentricity})
            if dist > this.max_drag
                scaling_factor_x = this.max_drag / dist
                scaling_factor_y = this.max_drag / dist
            this.onMove_callback(x_shift * scaling_factor_x, y_shift * scaling_factor_y)
        onMove: (callback) ->
            this.onMove_callback = callback
        registerPoint: (point) ->
            this.initGrab.x = point.x
            this.initGrab.y = point.y
            this.point = point
            point.onRelease(this.release.bind(this))
            point.onMove(this.move.bind(this))
            this.available = false
        dragDistance: ->
            if this.point?
                return util.distance(this.point, this.initGrab)
            return 0
        draw: ->
            meshArray = []
            grab = util.makeFullCircle(this.radius)
            
            x_shift = 0
            y_shift = 0
            scaling_factor_x = 1
            scaling_factor_y = 1
            if this.point?
                x_shift = this.point.x - this.initGrab.x
                y_shift = this.point.y - this.initGrab.y
                dist = util.length({x:(this.point.x - this.x), y:(this.point.y - this.y) / eccentricity})
                if dist > this.max_drag
                    scaling_factor_x = this.max_drag / dist
                    scaling_factor_y = this.max_drag / dist

            grab.position.x = this.x + x_shift * scaling_factor_x
            grab.position.y = this.y + y_shift * scaling_factor_y
            grab.position.z = 0.1
            meshArray.push(grab)

#            util.setPanelPosition(panelMesh, grab, this.x + x_shift * scaling_factor_x, this.y + y_shift * scaling_factor_y, 0.12)
#            scene.add(grab)
            return meshArray
    }

    #Panel is an 8 x 12 grid
    controls.Panel = ->
        this.objects = []
        this.add = (object) ->
            this.objects.push(object)
        this.set = (array) ->
            this.objects = array
        undefined

    state.topBar = {
        x: 0
        y: 1 - state.unitHeight
        width: 1
        height: state.unitHeight
        buttonPosition: {
            'inClose': 0 * state.unitWidth,
            'inSettings': 1 * state.unitWidth,
            'inAppSwitch': 10 * state.unitWidth,
            'inMaxMin': 11 * state.unitWidth
        }
        initGrab: {
            x: 0,
            y: 0
        }
        thickness: 0.1
        available: true
        point: undefined
        buttonSelected: undefined
        contains: (x, y) ->
            which = this.whichButton(x, y)
            return which isnt 'none'
        state: 'overlay' #overlay, moving, mobile
        whichButton: (x,y) ->
            if this.state isnt 'moving' and this.y < y < this.y + this.height
                if x > 2 * state.unitWidth and x < 10 * state.unitWidth
                    return 'hideBar'
                for option, position of this.buttonPosition
                    if position < x < position + state.unitWidth
                        switch option
                            when 'inClose'
                                if state.getPanelApp()
                                    return option
                            when 'inSettings'
                                return option
                            when 'inAppSwitch'
                                return option
                            when 'inMaxMin'
                                if state.canMinimize() or state.canMaximize()
                                    return option
            return 'none'
        dragDistance: ->
            if this.point?
                return util.distance(this.point, this.initGrab)
            return 0
        release: (x, y) ->
            #if far enough, click.
            if this.buttonPosition[this.buttonSelected]? and util.rectContains(this.point, this.buttonPosition[this.buttonSelected], this.y, 1, this.height)
                this.click(this.buttonSelected)
            else if this.buttonSelected is 'hideBar'
                if y > 0.5
                    this.state = 'overlay'
                else
                    this.state = 'mobile'
            this.available = true
            this.point = undefined
            this.buttonSelected = 'none'
        click: (buttonName) ->
            switch buttonName
                when 'inClose'
                    if state.mode is state.modes.AppSwitch and state.back? and not state.front?
                        state.front_and_back = state.back
                        state.back = null
                    if state.mode is state.modes.Normal
                        state.close()
                    else
                        state.mode = state.modes.Normal
                when 'inSettings'
                    state.mode = state.modes.Settings
                when 'inAppSwitch'
                    #state.open(state.appSwitcher)
                    state.mode = state.modes.AppSwitch
                    if state.front_and_back?
                        state.back = state.front_and_back
                        state.front_and_back = null
                when 'inMaxMin'
                    state.toggleMaxMin()
        dragDistance: ->
            if this.point?
                return util.distance(this.point, this.initGrab)
            return 0
        registerPoint: (point) ->
            this.initGrab.x = point.x
            this.initGrab.y = point.y
            this.buttonSelected = this.whichButton(point.x, point.y)
            if this.buttonSelected is 'hideBar'
                #Maybe only move after a threshold distance
                this.state = 'moving'
                for pt in state.points
                    if pt.i? and pt.i isnt point.i
                        state.points[pt.i].release(pt.x, pt.y, pt.i)
                        pt.taken = false
            this.point = point
            point.onRelease(this.release.bind(this))
            this.available = false
        draw: ->
            meshArray = []
            barMaterial = new THREE.MeshBasicMaterial({color: 0x00CC00})

            barMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(this.width, this.height), barMaterial)
            
            switch this.state
                when 'moving'
                    adjusted_y = this.y + (this.point.y - this.initGrab.y)
                when 'mobile'
                    this.y = 0
                    adjusted_y = this.y
                when 'overlay'
                    this.y = 1 - state.unitHeight
                    adjusted_y = this.y

            barMesh.position.x = this.x
            barMesh.position.y = adjusted_y
            barMesh.position.z = 0.05
            meshArray.push(barMesh)
            # util.setPanelPosition(board, barMesh, this.x, adjusted_y, 0.1)
            # scene.add(barMesh)

            if this.buttonSelected isnt 'none' and this.buttonSelected isnt 'hideBar'
                # util.setPanelPosition(board, barMesh, this.x, adjusted_y, 0.1)
                materialOptions = {color: 0x00CC00}
                if this.point?
                    if util.rectContains(this.point, this.buttonPosition[this.buttonSelected], this.y, 1, this.height)
                        materialOptions.color = 255
                    else
                        materialOptions.color = (100 << 16) + (100 << 8) + 100
                    #materialOptions.color = (0 << 16) + (200 * (1 - percentClicked) << 8) + percentClicked * 255
                else
                    materialOptions.color = 200 << 8

                buttonMaterial = new THREE.MeshBasicMaterial(materialOptions)
                buttonMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(state.unitWidth, state.unitHeight), buttonMaterial)

                buttonMesh.position.x = this.x + this.buttonPosition[this.buttonSelected]
                buttonMesh.position.y = adjusted_y
                buttonMesh.position.z = 0.08
                meshArray.push(buttonMesh)
                # util.setPanelPosition(board, buttonMesh, this.x + this.buttonPosition[this.buttonSelected], adjusted_y, 0.11)
                # scene.add(buttonMesh)

            if state.mode is state.modes.Normal
                closeMesh = util.makeText(' X', 30, state.unitWidth, state.unitHeight)
                closeMesh.position.x = this.x + this.buttonPosition['inClose']
                closeMesh.position.y = adjusted_y
                closeMesh.position.z = 0.1
                meshArray.push(closeMesh)
                # util.setPanelPosition(board, closeMesh, this.x + this.buttonPosition['inClose'], adjusted_y, 0.12)
                # scene.add(closeMesh)

                if state.canMaximize()
                    maxMinMesh = util.makeText(' +', 30, state.unitWidth, state.unitHeight)
                    maxMinMesh.position.x = this.x + this.buttonPosition['inMaxMin']
                    maxMinMesh.position.y = adjusted_y
                    maxMinMesh.position.z = 0.1
                    meshArray.push(maxMinMesh)
                    # util.setPanelPosition(board, maxMinMesh, this.x + this.buttonPosition['inMaxMin'], adjusted_y, 0.12)
                    # scene.add(maxMinMesh)
                else if state.canMinimize()
                    maxMinMesh = util.makeText(' -', 30, state.unitWidth, state.unitHeight)
                    maxMinMesh.position.x = this.x + this.buttonPosition['inMaxMin']
                    maxMinMesh.position.y = adjusted_y
                    maxMinMesh.position.z = 0.1
                    meshArray.push(maxMinMesh)
                    # util.setPanelPosition(board, maxMinMesh, this.x + this.buttonPosition['inMaxMin'], adjusted_y, 0.12)
                    # scene.add(maxMinMesh)
            else
                if state.getPanelApp()?
                    maxMinMesh = util.makeText(' <', 30, state.unitWidth, state.unitHeight)
                    maxMinMesh.position.x = this.x + this.buttonPosition['inClose']
                    maxMinMesh.position.y = adjusted_y
                    maxMinMesh.position.z = 0.1
                    meshArray.push(maxMinMesh)
                    # util.setPanelPosition(board, maxMinMesh, this.x + this.buttonPosition['inClose'], adjusted_y, 0.12)
                    # scene.add(maxMinMesh)
            
            notificationText = ' *'
            notifyMesh = util.makeText(notificationText, 30, state.unitWidth, state.unitHeight)
            notifyMesh.position.x = this.x + this.buttonPosition['inSettings']
            notifyMesh.position.y = adjusted_y
            notifyMesh.position.z = 0.1
            meshArray.push(notifyMesh)
            # util.setPanelPosition(board, notifyMesh, this.x + this.buttonPosition['inSettings'], adjusted_y, 0.12)
            # scene.add(notifyMesh)

            appSwitchText = '<->'
            appSwitchMesh = util.makeText(appSwitchText, 30, state.unitWidth, state.unitHeight)
            appSwitchMesh.position.x = this.x + this.buttonPosition['inAppSwitch']
            appSwitchMesh.position.y = adjusted_y
            appSwitchMesh.position.z = 0.1
            meshArray.push(appSwitchMesh)
            # util.setPanelPosition(board, appSwitchMesh, this.x + this.buttonPosition['inAppSwitch'], adjusted_y, 0.12)
            # scene.add(appSwitchMesh)

            title = ''
            if state.mode is state.modes.Normal and state.getPanelApp()?
                title = state.getPanelApp().name
            else if state.mode is state.modes.AppSwitch
                title = 'App Switcher'
            else if state.mode is state.modes.Settings
                title = 'Settings'

            titleMesh = util.makeText(title, 30, state.unitWidth*8, state.unitHeight)
            titleMesh.position.x = 2 * state.unitWidth
            titleMesh.position.y = adjusted_y
            titleMesh.position.z = 0.1
            meshArray.push(titleMesh)
            # util.setPanelPosition(board, titleMesh, 2 * state.unitWidth, adjusted_y, 0.12)
            # scene.add(titleMesh)
            return meshArray
    }

    state.addURL = (url, extras, open) ->
        ((state, controls, appURL, util) ->
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

          currentlyOpen = undefined
          for v, k in state.apps
            if v.url is appURL
                currentlyOpen = v

          if currentlyOpen?
          	state.open(currentlyOpen, controls)
          else
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
                  return util.makeText(text, px, width, height)
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
                  event: {},
                  status: 'ready'
                }
              }
              util.getScriptSync(appURL, (data, textStatus, jqxhr) ->
                if vOS.app.event.load?
                    if extras?
                      for k, v of extras
                        vOS.app[k] = v
                    
                    state.apps.push(vOS.app)
                    for listener in state.onAppListUpdate.listeners
                        listener()
                    
                    #Make sure it shows up in the list
                    if open
                      state.open(vOS.app, controls)
                else
                  console.log('App from ' + appURL + ' Failed To Load')
                #window.app
                window.vOS.app = {
                  event: {},
                  status: 'ready'
                }
              )
        )(state, controls, url, util)
    return controls
