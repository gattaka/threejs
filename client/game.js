var GAME = GAME || {};
GAME = function() {

    this.container = document.body;

    this.renderer = undefined;

    this.scene = new THREE.Scene();
    this.camera = undefined;

    this.sceneOrtho = new THREE.Scene();
    this.cameraOrtho = undefined;

    this.keyboard = new THREEx.KeyboardState();
    this.clock = new THREE.Clock();
    this.controls = undefined;
    this.stats = undefined;
    this.loader = new THREEx.UniversalLoader();

    this.rock = undefined;

    this.log = function(msg) {
	console.log("GAME:: " + msg);
    };

    // Angles to Rads
    this.toRad = function(angle) {
	return angle * 3.14 / 180;
    };

    this.initControls = function() {
	this.controls = new THREE.OrbitControls(this.camera, this.container);
    };

    this.initScreenEvents = function() {
	THREEx.WindowResize(this.renderer, this.camera);
	THREEx.WindowResize(this.renderer, this.cameraOrtho);
	THREEx.FullScreen.bindKey({
	    charCode : 'm'.charCodeAt(0)
	});

	document.addEventListener("mousemove", function(event) {
	    // veškeré on-mouse events
	}, false);
    };

    // Animate the scene and call rendering.
    this.animateScene = function() {

	var game = this;

	var renderer = this.renderer;
	var scene = this.scene;
	var camera = this.camera;
	var sceneOrtho = this.sceneOrtho;
	var cameraOrtho = this.cameraOrtho;
	var controls = this.controls;
	var stats = this.stats;
	var clock = this.clock;
	var keyboard = this.keyboard;
	var rock = this.rock;

	// closure !
	var animate = function() {
	    return function() {
		requestAnimationFrame(arguments.callee);
		renderer.clear();
		renderer.render(scene, camera);
		renderer.clearDepth();
		renderer.render(sceneOrtho, cameraOrtho);
		THREE.AnimationHandler.update(clock.getDelta());
		controls.update();
		stats.update();
		game.hitCheck(game);
	    };
	};
	var animateClosure = animate();
	animateClosure();
    };

    this.createFrame = function(scene) {
	var texture = THREE.ImageUtils.loadTexture('textures/frame.png');
	var material = new THREE.SpriteMaterial({
	    map : texture
	});
	var frameSprite = new THREE.Sprite(material);
	var fw = 198;
	var fh = 247;
	frameSprite.scale.set(fw, fh, 1.0);
	var sw = window.innerWidth;
	var sh = window.innerHeight;
	var offset = 20;
	frameSprite.position.set(sw / 2 - fw / 2 - offset, sh / 2 - fh / 2 - offset, 1.0);
	this.sceneOrtho.add(frameSprite);
    }

    this.createPlane = function(scene) {
	// var floorTexture = new
	// THREE.ImageUtils.loadTexture('textures/Pavement_Broken_UV_H_CM_1.jpg');
	// var tex =
	// 'textures/seamless_desert_sand_texture_by_hhh316-d311qn7.jpg';
	// var tex = 'textures/Patch grass 00 seamless.jpg';
	// var tex = 'textures/Grass 02 seamless.jpg';
	var tex = 'textures/Dirt 00 seamless.jpg';
	var floorTexture = new THREE.ImageUtils.loadTexture(tex);
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set(100, 100);
	var floorMaterial = new THREE.MeshLambertMaterial({
	    map : floorTexture,
	    side : THREE.DoubleSide
	});
	var heightMap = THREEx.Terrain.allocateHeightMap(100, 200);
	THREEx.Terrain.simplexHeightMap(heightMap);
	var geometry = THREEx.Terrain.heightMapToPlaneGeometry(heightMap);
	var floor = new THREE.Mesh(geometry, floorMaterial);

	floor.rotateX(-Math.PI / 2);
	floor.scale.x = 2000;
	floor.scale.y = 2000;
	floor.scale.z = 20;

	floor.receiveShadow = true;
	scene.add(floor);
    };

    this.createLights = function(scene) {
	var amblight = new THREE.AmbientLight(0x555544);
	scene.add(amblight);

	// spotlight #1 -- yellow, dark shadow
	var spotlight = new THREE.SpotLight(0xffffaa);
	spotlight.position.set(-700, 700, 700);
	// nechci aby byla vidět "kamera" světla
	spotlight.shadowCameraVisible = false;
	spotlight.shadowDarkness = 0.75;
	spotlight.intensity = 0.7;
	spotlight.shadowMapWidth = 1024; // default is 512
	spotlight.shadowMapHeight = 1024; // default is 512
	// must enable shadow casting ability for the light
	spotlight.castShadow = true;
	scene.add(spotlight);
    };

    this.createItems = function(scene) {
	GAME.loadCollada('models/wall.dae', scene, undefined, function(child) {
	    var start = [ 10, 0, 5 ];
	    for (var i = 0; i < 2; i++) {
		var obj = new THREE.Mesh(child.geometry, child.material);
		obj.position.set(start[0] + i * 16, start[1], start[2]);
		obj.castShadow = true;
		obj.receiveShadow = true;
		scene.add(obj);
	    }
	});

	GAME.loadCollada('models/pine.dae', scene, function(o) {
	    o.scale.set(10, 10, 10);
	    o.rotateY(Math.PI / 2);
	    o.position.set(20, 0, 30);
	    // debug
	    game.rock = o;
	}, function(child) {
	    var wrapSize = 10;
	    var step = 15;
	    var offsetX = 50;
	    var offsetY = -5;
	    var offsetZ = 50;

	    for (var i = 0; i < 100; i++) {
		var obj = new THREE.Mesh(child.geometry, child.material);
		obj.castShadow = true;
		obj.receiveShadow = true;
		obj.scale.multiplyScalar(0.1 + Math.random() / 5);
		obj.position.set(offsetX + (i % wrapSize) * step + Math.random() * 15, offsetY, offsetZ + (i / wrapSize) * step + Math.random() * 15);
		scene.add(obj);
	    }
	    if (child.material)
		child.material.transparent = true;
	});

	// var rockTexture = new
	// THREE.ImageUtils.loadTexture('models/pinet1.tga');
	// var rockMaterial = new THREE.MeshPhongMaterial({
	// shading : THREE.SmoothShading,
	// map : rockTexture,
	// transparent: true
	// });
	// var side = 20;
	// var rockGeometry = new THREE.BoxGeometry(side, side, side);
	// var rock = new THREE.Mesh(rockGeometry, rockMaterial);
	// rock.castShadow = true;
	// rock.receiveShadow = true;
	// rock.scale.set(1, 1, 1);
	// rock.position.set(0, side / 2, 0);
	// this.rock = rock;
	// scene.add(rock);
    }

    this.hitCheck = function(game) {

	var keyboard = game.keyboard;
	var rock = game.rock;
	var scene = game.scene;

	// cooldown -- TODO přepsat, aktuálně závislé na FPS
	if (keyboard.lastTime == undefined) {
	    keyboard.cooldown = 5;
	    keyboard.lastTime = 0;
	} else {
	    if (keyboard.lastTime < keyboard.cooldown) {
		keyboard.lastTime++;
		return;
	    }
	}

	if (keyboard.pressed("w") == true) {
	    rock.material.wireframe = !rock.material.wireframe;
	    keyboard.lastTime = 0
	}

    }

    this.run = function() {
	if (Detector.webgl) {
	    this.renderer = new THREE.WebGLRenderer({
		antialias : true
	    });
	} else {
	    this.renderer = new THREE.CanvasRenderer();
	}

	// Set the background color of the renderer to black, with full opacity
	this.renderer.setClearColor(0x000000, 1);
	this.renderer.autoClear = false;
	this.renderer.shadowMapEnabled = true;
	// this.renderer.shadowMapType = THREE.PCFShadowMap;
	this.renderer.shadowMapType = THREE.PCFSoftShadowMap;

	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;

	this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	this.container.appendChild(this.renderer.domElement);

	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	this.scene.add(this.camera);
	this.camera.position.set(50, 40, -80);
	this.camera.lookAt(this.scene.position);

	this.cameraOrtho = new THREE.OrthographicCamera(-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, -SCREEN_HEIGHT / 2, 1, 10);
	this.cameraOrtho.position.z = 10;

	this.createPlane(this.scene);
	this.createLights(this.scene);
	GAME.createSkybox(this.scene);
	this.createItems(this.scene);
	this.createFrame(this.scene);

	this.scene.add(new THREE.AxisHelper(100));

	this.initScreenEvents();
	this.initControls();
	this.stats = GAME.createStats(this.container);

	this.log("rendering...");
	this.animateScene();
    };
};