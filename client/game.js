var GAME = function() {

    var container = document.body;

    var scene;
    var renderer;
    var camera;
    var keyboard = new THREEx.KeyboardState();
    var clock = new THREE.Clock();
    var controls;
    var stats;

    // Angles to Rads
    function toRad(angle) {
	return angle * 3.14 / 180;
    }

    function log(msg) {
	console.log("GAME:: " + msg);
    }

    // Render the scene. Map the 3D world to the 2D screen.
    function renderScene() {
	renderer.render(scene, camera);
    }

    function update() {
	// delta = change in time since last call (in seconds)
	var delta = clock.getDelta();

	controls.update();
	stats.update();
    }

    // Animate the scene and call rendering.
    function animateScene() {
	requestAnimationFrame(animateScene);
	renderScene();
	update();
    }

    function createRulerPlane() {
	var geo = new THREE.PlaneGeometry(1000, 1000, 100, 100);
	var mat = new THREE.MeshBasicMaterial({
	    color : 0xaaaaaa,
	    wireframe : true
	});
	var plane = new THREE.Mesh(geo, mat);
	plane.rotateX(toRad(90));
	return plane;
    }

    function createSphere() {
	// Set the size of the ball by adjusting its radius
	var radius = 15;
	// Used twice to set the detail of the Geometry, once for width of the
	// Sphere, and once for the height
	var detail = 16;
	var geometry1 = new THREE.SphereGeometry(radius, detail, detail);
	// Add a BasicMaterial to our Geometry, color green, in wireframe-mode
	var material1 = new THREE.MeshBasicMaterial({
	    color : 0x00ff00,
	    wireframe : false
	});
	return new THREE.Mesh(geometry1, material1);
    }

    function createLight() {
	// Light
	var light = new THREE.PointLight(0xffffff);
	light.position.x = 20;
	light.position.y = 20;
	light.position.z = 100;
	return light;
    }

    function initControls() {
	// move mouse and: left click to rotate,
	// middle click to zoom,
	// right click to pan
	controls = new THREE.OrbitControls(camera, container);
    }

    function initStats() {
	// displays current and past frames per second attained by scene
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);
    }

    function initScreenEvents() {
	// automatically resize renderer
	THREEx.WindowResize(renderer, camera);
	// toggle full-screen on given key press
	THREEx.FullScreen.bindKey({
	    charCode : 'm'.charCodeAt(0)
	});
    }

    this.run = function() {

	if (Detector.webgl) {
	    renderer = new THREE.WebGLRenderer({
		antialias : true
	    });
	} else {
	    renderer = new THREE.CanvasRenderer();
	}

	// Set the background color of the renderer to black, with full opacity
	renderer.setClearColor(0x000000, 1);

	// Get the size of the inner window (content area) to create a full size
	// renderer
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	// Set the renderers size to the content areas size
	renderer.setSize(canvasWidth, canvasHeight);

	// Get the DIV element from the HTML document by its ID and append the
	// renderers DOM object to it
	// document.getElementById("WebGLCanvas").appendChild(renderer.domElement);
	container.appendChild(renderer.domElement);

	// Create the scene, in which all objects are stored (e. g. camera,
	// lights, geometries, ...)
	scene = new THREE.Scene();

	// set the view size in pixels (custom or according to window size)
	// var SCREEN_WIDTH = 400, SCREEN_HEIGHT = 300;
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	// camera attributes
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	// set up camera
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	// add the camera to the scene
	scene.add(camera);
	// the camera defaults to position (0,0,0)
	// so pull it back (z = 400) and up (y = 100) and set the angle towards
	// the scene origin
	camera.position.set(0, 150, 400);
	camera.lookAt(scene.position);

	scene.add(createRulerPlane());
	scene.add(createSphere());
	scene.add(createLight());
	scene.add(new THREE.AxisHelper(100));

	initScreenEvents();
	initControls();
	initStats();

	log("rendering...");
	animateScene();
    };
};