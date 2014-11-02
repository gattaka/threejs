var GAME = GAME || {};
GAME.Game = function() {

    this.container = document.body;
    this.renderer = undefined;

    this.scene = new THREE.Scene();
    this.camera = undefined;

    this.sceneOrtho = new THREE.Scene();
    this.cameraOrtho = undefined;

    this.level = undefined;
    this.hud = undefined;

    this.keyboard = new THREEx.KeyboardState();
    this.clock = new THREE.Clock();
    this.controls = undefined;
    this.stats = undefined;

    this.animator = new GAME.Animator();

    this.player = undefined;

    this.initControls = function() {
	this.controls = new THREE.OrbitControls(this.camera, this.container);
    };

    this.createStats = function(container) {
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);
	return stats;
    };

    this.initScreenEvents = function() {
	THREEx.WindowResize(this.renderer, this.camera);
	THREEx.WindowResize(this.renderer, this.cameraOrtho);
	THREEx.FullScreen.bindKey({
	    charCode : 'm'.charCodeAt(0)
	});
    };

    // Animate the scene and call rendering.
    this.animateScene = function() {

	var game = this;

	// closure !
	var animate = function() {

	    var delay = game.clock.getDelta();

	    requestAnimationFrame(arguments.callee);
	    game.renderer.clear();
	    game.renderer.render(game.scene, game.camera);
	    game.renderer.clearDepth();
	    game.renderer.render(game.sceneOrtho, game.cameraOrtho);
	    THREE.AnimationHandler.update(delay);

	    game.controls.update();
	    game.stats.update();
	    game.hitCheck(game);
	    game.player.animate(delay);
	};
	animate();
    };

    this.hitCheck = function(game) {
	if (game.keyboard.pressed("w") == true) {
	    game.player.state = GAME.Player.WALK;
	} else {
	    game.player.state = GAME.Player.STAND;
	}
	if (game.player.mesh)
	    this.level.plantObject(game.player.mesh);
    }

    this.createPlayer = function(scene) {
	var player = new GAME.Player(scene);
	this.player = player;
    }

    this.mouseControls = function(camera, renderer, mesh) {
	var domEvents = new THREEx.DomEvents(camera, renderer.domElement)
	var p = this.rock;
	domEvents.addEventListener(mesh, "click", function(event) {
	    p.position.x = event.intersect.point.x;
	    p.position.z = event.intersect.point.z;
	}, false);
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
	// this.camera.position.set(50, 40, -80);
	this.camera.position.set(100, 100, 100);
	this.camera.lookAt(this.scene.position);

	this.cameraOrtho = new THREE.OrthographicCamera(-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
		-SCREEN_HEIGHT / 2, 1, 10);
	this.cameraOrtho.position.z = 10;

	this.level = new GAME.Level(this.scene);
	this.hud = new GAME.HUD(this.sceneOrtho);

	this.scene.add(new THREE.AxisHelper(100));
	this.createPlayer(this.scene);
	// this.mouseControls(this.camera, this.renderer, this.level.terrain.mesh);

	this.initScreenEvents();
	this.initControls();
	this.stats = this.createStats(this.container);

	this.scene.fog = new THREE.Fog(0x34583e, 0, 10000);

	this.animateScene();
    };
};