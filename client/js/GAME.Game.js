var GAME = GAME || {};
GAME.Game = function() {

    this.container = document.body;
    this.renderer = undefined;

    this.camera = undefined;
    this.cameraOrtho = undefined;

    this.scene = new THREE.Scene();
    this.sceneOrtho = new THREE.Scene();

    this.composer = undefined;

    this.hud = undefined;
    this.level = undefined;
    this.player = undefined;

    this.keyboard = new THREEx.KeyboardState();
    this.clock = new THREE.Clock();
    this.stats = undefined;

    this.playerMover = undefined;

    this.animator = new GAME.Animator();
    this.keyboardListeners = [];

    this.cycleCallbacks = [];

    this.createStats = function(container) {
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);
	return stats;
    };

    this.initScreenEvents = function(game) {
	THREEx.WindowResize(game.renderer, game.camera);
	THREEx.WindowResize(game.renderer, game.cameraOrtho);
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

	    game.stats.update();
	    game.hitCheck(game);

	    // volej všechny zaregistrované callbacky
	    for (callback in game.cycleCallbacks) {
		game.cycleCallbacks[callback](delay);
	    }

	    TWEEN.update();
	};
	animate();
    };

    this.hitCheck = function(game) {
	for (listener in game.keyboardListeners) {
	    listener(game.keyboard);
	}

	// DEBUG
	if (game.keyboard.pressed("h") == true) {
	    var currentTime = game.clock.elapsedTime;
	    // každých 500ms můžu dát úder
	    if (currentTime - game.eventsHelper.lastClickTime > 0.5) {
		game.player.state = GAME.Player.HIT;
		game.eventsHelper.lastClickTime = currentTime;
	    }
	}
    }

    this.willCollide = function(x, y, z, mesh) {
	var originPoint = new THREE.Vector3(x, y, z);

	for (var vertexIndex = 0; vertexIndex < mesh.geometry.vertices.length; vertexIndex++) {
	    var localVertex = mesh.geometry.vertices[vertexIndex].clone();
	    var globalVertex = localVertex.applyMatrix4(mesh.matrix);
	    var directionVector = globalVertex.sub(mesh.position);

	    var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
	    var collisionResults = ray.intersectObjects(game.level.collisionObjects);
	    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
		console.log("HIT");
		return true;
	    }
	}

	return false;
    }

    this.run = function() {

	/*
	 * RENDERER
	 */
	var renderer;
	if (Detector.webgl) {
	    renderer = new THREE.WebGLRenderer({
		antialias : true
	    });
	} else {
	    renderer = new THREE.CanvasRenderer();
	}
	this.renderer = renderer;

	renderer.setClearColor(0x000000, 1);
	renderer.autoClear = false;
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;

	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	this.container.appendChild(this.renderer.domElement);

	/*
	 * CAMERA, SCENE
	 */
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	this.scene.add(this.camera);

	this.cameraOrtho = new THREE.OrthographicCamera(-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
		-SCREEN_HEIGHT / 2, 1, 10);
	this.cameraOrtho.position.z = 10;

	this.scene.fog = new THREE.Fog(0x34583e, 0, 10000);

	/*
	 * EVENT ENGINE
	 */
	this.domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement);

	/*
	 * UTIL OBJEKTY
	 */
	this.hud = new GAME.HUD(this.sceneOrtho);
	this.scene.add(new THREE.AxisHelper(100));
	this.stats = this.createStats(this.container);

	/*
	 * LEVEL
	 */
	this.level = new GAME.Level(this);
	this.player = new GAME.Player(this);

	/*
	 * EVENTS -- již na připravených objektech
	 */
	this.initScreenEvents(this);
	this.playerMover = new GAME.PlayerMover(this);

	this.animateScene();
    };
};