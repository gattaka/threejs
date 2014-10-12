var GAME = GAME || {};

GAME = function() {

    this.container = document.body;
    this.scene = new THREE.Scene();
    this.renderer = undefined;
    this.camera = undefined;
    this.keyboard = new THREEx.KeyboardState();
    this.clock = new THREE.Clock();
    this.controls = undefined;
    this.stats = undefined;
    this.loader = new THREEx.UniversalLoader();

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

    this.initStats = function() {
	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';
	this.stats.domElement.style.zIndex = 100;
	this.container.appendChild(this.stats.domElement);
    };

    this.initScreenEvents = function() {
	THREEx.WindowResize(this.renderer, this.camera);
	THREEx.FullScreen.bindKey({
	    charCode : 'm'.charCodeAt(0)
	});
    };

    // Animate the scene and call rendering.
    this.animateScene = function() {
	// closure !
	var animate = function(renderer, scene, camera, controls, stats, clock) {
	    return function() {
		requestAnimationFrame(arguments.callee);
		renderer.render(scene, camera);
		THREE.AnimationHandler.update(clock.getDelta());
		controls.update();
		stats.update();
	    };
	};
	var animateClosure = animate(this.renderer, this.scene, this.camera, this.controls, this.stats, this.clock);
	animateClosure();
    };

    this.createRulerPlane = function(scene) {
	// floor: mesh to receive shadows
	var floorTexture = new THREE.ImageUtils.loadTexture('textures/Pavement_Broken_UV_H_CM_1.jpg');
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set(10, 10);
	// Note the change to Lambert material.
	var floorMaterial = new THREE.MeshLambertMaterial({
	    map : floorTexture,
	    side : THREE.DoubleSide
	});
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	// Note the mesh is flagged to receive shadows
	floor.receiveShadow = true;
	scene.add(floor);
    };

    this.createSphere = function(scene) {
	// Sphere parameters: radius, segments along width, segments along
	// height
	var sphereGeometry = new THREE.SphereGeometry(50, 32, 16);
	// use a "lambert" material rather than "basic" for realistic lighting.
	// (don't forget to add (at least one) light!)
	var sphereMaterial = new THREE.MeshLambertMaterial({
	    color : 0x8888ff
	});
	var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	sphere.position.set(100, 50, -50);
	sphere.castShadow = true;
	scene.add(sphere);
    };

    this.createLights = function(scene) {
	// spotlight #1 -- yellow, dark shadow
	var spotlight = new THREE.SpotLight(0xffffaa);
	spotlight.position.set(-700, 700, 700);
	// nechci aby byla vidět "kamera" světla
	spotlight.shadowCameraVisible = false;
	spotlight.shadowDarkness = 0.75;
	spotlight.intensity = 0.7;
	// must enable shadow casting ability for the light
	spotlight.castShadow = true;
	scene.add(spotlight);
    };

    this.loadCollada = function(path, modifier) {
	var scene = this.scene;
	this.loader.load(path, function(object3d) {
	    object3d.traverse(function(child) {
		child.castShadow = true;
		child.receiveShadow = true;
		if (child instanceof THREE.SkinnedMesh) {
		    var animation = new THREE.Animation(child, child.geometry.animation);
		    animation.play();
		}
	    });

	    // this function will be notified when the model is loaded
	    if (modifier)
		modifier(object3d);
	    scene.add(object3d);
	});
    };

    this.loadMonster = function() {
	this.loadCollada('models/monster.dae', function(o) {
	    o.castShadow = true;
	    o.receiveShadow = true;
	});
    };

    this.loadSkybox = function(scene) {
	var imagePrefix = "textures/Skybox-";
	var directions = [ "Right", "Left", "Top", "Bottom", "Front", "Back" ];
	var imageSuffix = ".bmp";
	var skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000);

	var materialArray = [];
	for (var i = 0; i < 6; i++)
	    materialArray.push(new THREE.MeshBasicMaterial({
		map : THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
		side : THREE.BackSide
	    }));
	var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
	var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
	skyBox.castShadow = false;
	scene.add(skyBox);
    };

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
	this.renderer.shadowMapEnabled = true;
	this.renderer.shadowMapType = THREE.PCFSoftShadowMap;

	// Get the size of the inner window (content area) to create a full size
	// renderer
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	// Set the renderers size to the content areas size
	this.renderer.setSize(canvasWidth, canvasHeight);

	// Get the DIV element from the HTML document by its ID and append the
	// renderers DOM object to it
	// document.getElementById("WebGLCanvas").appendChild(renderer.domElement);
	this.container.appendChild(this.renderer.domElement);

	// set the view size in pixels (custom or according to window size)
	// var SCREEN_WIDTH = 400, SCREEN_HEIGHT = 300;
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	// camera attributes
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	// set up camera
	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	// add the camera to the scene
	this.scene.add(this.camera);
	// the camera defaults to position (0,0,0)
	// so pull it back (z = 400) and up (y = 100) and set the angle towards
	// the scene origin
	this.camera.position.set(600, 400, -600);
	this.camera.lookAt(this.scene.position);

	this.createRulerPlane(this.scene);
	this.createSphere(this.scene);
	this.createLights(this.scene);
	// this.scene.add(new THREE.AxisHelper(100));
	this.loadSkybox(this.scene);
	this.loadMonster();

	this.initScreenEvents();
	this.initControls();
	this.initStats();

	this.log("rendering...");
	this.animateScene();
    };
};