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
    this.loader = new THREEx.UniversalLoader();

    this.updateFcts = [];

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

    this.createPlayer = function(scene) {
	var texturePath = '../models/texture8.jpg';
	var texture = new THREE.ImageUtils.loadTexture(texturePath);
	var material = new THREE.MeshLambertMaterial({
	    map : texture,
	});

	var texturePath2 = '../models/monster.jpg';
	var texture2 = new THREE.ImageUtils.loadTexture(texturePath2);
	var material2 = new THREE.MeshLambertMaterial({
	    map : texture2,
	});

	var materials = [ new THREE.MeshBasicMaterial({
	    color : 0xFF0000
	}), new THREE.MeshBasicMaterial({
	    color : 0x00FF00
	}), new THREE.MeshBasicMaterial({
	    color : 0x0000FF
	}), new THREE.MeshBasicMaterial({
	    color : 0xAA0000
	}), new THREE.MeshBasicMaterial({
	    color : 0x00AA00
	}), material2 ];

	var geometry = new THREE.IcosahedronGeometry(20, 1);

	var bricks = [ new THREE.Vector2(0, .666), new THREE.Vector2(.5, .666), new THREE.Vector2(.5, 1),
		new THREE.Vector2(0, 1) ];
	geometry.faceVertexUvs[0][0] = [ bricks[0], bricks[1], bricks[3] ];
	geometry.faceVertexUvs[0][1] = [ bricks[1], bricks[2], bricks[3] ];

	var p = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	scene.add(p);
	p.position.set(-20, 0, -20);
	this.rock = p;
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
	this.camera.position.set(-100, 100, -100);
	this.camera.lookAt(this.scene.position);

	this.cameraOrtho = new THREE.OrthographicCamera(-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
		-SCREEN_HEIGHT / 2, 1, 10);
	this.cameraOrtho.position.z = 10;

	this.level = new GAME.Level(this.scene);
	this.hud = new GAME.HUD(this.sceneOrtho);

	this.scene.add(new THREE.AxisHelper(100));
	this.createPlayer(this.scene);
	this.mouseControls(this.camera, this.renderer, this.level.terrain.mesh);

	this.initScreenEvents();
	this.initControls();
	this.stats = this.createStats(this.container);

	this.scene.fog = new THREE.Fog(0x34583e, 0, 10000);

	this.log("rendering...");
	this.animateScene();
    };
};