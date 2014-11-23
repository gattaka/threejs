var GAME = GAME || {};
GAME.Physics = function() {

    this.container = document.body;
    this.renderer = undefined;

    this.camera = undefined;
    this.cameraOrtho = undefined;

    this.scene = undefined;
    this.sceneOrtho = new THREE.Scene();

    this.composer = undefined;

    this.hud = undefined;
    this.level = undefined;
    this.player = undefined;

    this.controls = undefined;

    this.keyboard = new THREEx.KeyboardState();
    this.clock = new THREE.Clock();
    this.stats = undefined;

    this.playerMover = undefined;

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

	    game.scene.simulate();

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
	    game.controls.update();

	    requestAnimationFrame(arguments.callee);
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
	 * PHYSIJS
	 */
	Physijs.scripts.worker = '/js/physijs_worker.js';
	Physijs.scripts.ammo = '/js/ammo.js';
	this.scene = new Physijs.Scene();
	this.scene.setGravity(new THREE.Vector3(0, -30, 0));

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
	this.scene.add(new THREE.AxisHelper(100));
	this.stats = this.createStats(this.container);

	/*
	 * EVENTS -- již na připravených objektech
	 */
	this.initScreenEvents(this);
	this.controls = new THREE.OrbitControls(this.camera, this.container);

	/*
	 * TEST FYZIKY
	 */
	this.camera.position.set(100, 200, 200);
	this.camera.lookAt(new THREE.Vector3(0, 0, 0));

	// Skybox
	var skybox = new GAME.Skybox();
	this.scene.add(skybox);

	// Světla
	var amblight = new THREE.AmbientLight(0x555544);
	this.scene.add(amblight);
	var spotlight = new THREE.SpotLight(0xffffaa);
	spotlight.position.set(-700, 700, 700);
	spotlight.shadowCameraVisible = false;
	spotlight.shadowDarkness = 0.75;
	spotlight.intensity = 0.7;
	spotlight.castShadow = true;
	this.scene.add(spotlight);

	// Box
	// var box = new Physijs.BoxMesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({
	// color : 0x888888
	// }));
	// box.mass = 0; // aby nepadala
	// box.position.set(0, 10, 0);
	// this.scene.add(box);
	// this.testbox = box;

	var box2 = new Physijs.BoxMesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({
	    color : 0x00ff00
	}));
	box2.position.set(5, 5, 1);
	this.scene.add(box2);
	this.testbox2 = box2;

	// TEST MODULŮ

	var loader = new THREE.JSONLoader();

	// var ground_geometry = new THREE.PlaneGeometry(300, 300, 100, 100);
	// for (var i = 0; i < ground_geometry.vertices.length; i++) {
	// var vertex = ground_geometry.vertices[i];
	// // vertex.y = NoiseGen.noise( vertex.x / 30, vertex.z / 30 ) * 1;
	// }
	// ground_geometry.computeFaceNormals();
	// ground_geometry.computeVertexNormals();

	// If your plane is not square as far as face count then the HeightfieldMesh
	// takes two more arguments at the end: # of x faces and # of z faces that were passed to THREE.PlaneMaterial
	// ground = new Physijs.HeightfieldMesh(ground_geometry, new THREE.MeshBasicMaterial({
	// color : 0xaabbdd
	// }), 0 // mass
	// );
	// ground.rotation.x = -Math.PI / 2;
	// ground.receiveShadow = true;
	// this.scene.add(ground);

	loader.load("../models/modul/column_ground.json", function(geometry, materials) {
	    var scale = 100;
	    var mesh = new Physijs.BoxMesh(geometry, new THREE.MeshFaceMaterial(materials));
	    mesh.mass = 0;
	    mesh.scale.set(scale, scale, scale);
	    mesh.position.set(0, 0, 0);
	    mesh.castShadow = true;
	    mesh.receiveShadow = true;
	    game.scene.add(mesh);
	});

	loader.load("../models/modul/column.json", function(geometry, materials) {
	    var scale = 10;
	    var mesh = new Physijs.BoxMesh(geometry, new THREE.MeshFaceMaterial(materials));
	    mesh.scale.set(scale, scale, scale);
	    // var height = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) * scale;
	    // mesh.position.set(50, height / 2, 70);
	    mesh.position.set(20, 0, 20);
	    mesh.castShadow = true;
	    mesh.receiveShadow = true;
	    mesh.mass = 0;

	    // identifikátor překážek
	    mesh.tag = "obstacle";

	    game.scene.add(mesh);

	    GAME.Utils.showBoundingBox(game, mesh);
	});

	loader.load("../models/modul/angel.json", function(geometry, materials) {
	    var scale = 5;
	    var mesh = new Physijs.BoxMesh(geometry, new THREE.MeshFaceMaterial(materials));
	    mesh.scale.set(scale, scale, scale);
	    mesh.position.set(-20, 10, -20);
	    mesh.castShadow = true;
	    mesh.receiveShadow = true;
	    mesh.mass = 5000;
	    game.angel = mesh;
	    game.scene.add(mesh);

	    game.move(game);
	    GAME.Utils.showBoundingBox(game, mesh);
	});

	this.animateScene();
    };

    this.move = function(game) {

	var p = game.angel;
	p.setLinearVelocity(new THREE.Vector3(50, 0, 50));

	 var position = {
	 x : p.position.x,
	 z : p.position.z
	 };
	 var target = {
	 x : 20,
	 z : 20
	 };
	
	 var speed = 0.01; // jednotek za sekundu
	 var a = target.z - position.z;
	 var b = target.x - position.x;
	 var distance = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
	
	p.addEventListener('collision', function(other_object, linear_velocity, angular_velocity) {
	    if (other_object.tag == "obstacle") {
		// zastav otáčení a posuv způsobený nárazem
		p.setLinearVelocity(new THREE.Vector3(0, 0, 0));
		p.setAngularVelocity(new THREE.Vector3(0, 0, 0));
	    }
	});
	// tween.start();
    }

};