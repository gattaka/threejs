var GAME = GAME || {};
GAME = function() {

    this.container = document.body;

    this.renderer = undefined;

    this.scene = new THREE.Scene();
    this.camera = undefined;

    this.sceneOrtho = new THREE.Scene();
    this.cameraOrtho = undefined;

    this.level = undefined;
    this.hud= undefined;
    
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

	this.level = new GAME.Level(this.scene);
	this.hud = new GAME.HUD(this.sceneOrtho);

	this.scene.add(new THREE.AxisHelper(100));

	this.initScreenEvents();
	this.initControls();
	this.stats = GAME.createStats(this.container);

	this.log("rendering...");
	this.animateScene();
    };
};