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

    this.animator = new GAME.Animator();

    this.eventsHelper = {
	mouseDown : false,
	lastMoveTime : 0
    }

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

	    // game.controls.update();

	    game.stats.update();
	    game.hitCheck(game);
	    game.player.animate(delay);

	    TWEEN.update();
	};
	animate();
    };

    this.hitCheck = function(game) {
	// if (game.keyboard.pressed("w") == true) {
	// game.player.state = GAME.Player.WALK;
	// } else {
	// game.player.state = GAME.Player.STAND;
	// }
	// if (game.player.mesh)
	// this.level.plantObject(game.player.mesh);
    }

    this.registerTerrainEvents = function(game) {
	game.domEvents.addEventListener(game.level.terrain.mesh, "mousedown", function(event) {
	    game.eventsHelper.mouseDown = true;
	    game.player.navigatePlayer(game, event);
	});
	game.domEvents.addEventListener(game.level.terrain.mesh, "mouseup", function(event) {
	    game.eventsHelper.mouseDown = false;
	});
	game.domEvents.addEventListener(game.level.terrain.mesh, "mousemove", function(event) {
	    var currentTime = game.clock.elapsedTime;
	    // každých 100ms beru pohyb myši jako novou polohu kam s hráčem jít
	    if (currentTime - game.eventsHelper.lastMoveTime > 0.1) {
		game.player.navigatePlayer(game, event);
		game.eventsHelper.lastMoveTime = currentTime;
	    }
	});
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
	this.registerTerrainEvents(this);
	this.initScreenEvents(this);

	this.animateScene();
    };
};