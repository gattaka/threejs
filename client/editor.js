var EDITOR = EDITOR || {};

EDITOR = function() {

    Menu = function(editor) {
	this.material = 1;
	this.brushSize = 1;
	this.save = function() {
	    window.open("data:application/octet-stream;charset=utf-8;base64," + window.btoa(editor.terrain.save()), "_self");
	};
    };

    this.container = document.body;
    this.renderer = undefined;
    this.scene = new THREE.Scene();
    this.camera = undefined;
    this.controls = undefined;
    this.stats = undefined;
    this.keyboard = new THREEx.KeyboardState();
    this.terrain = undefined;
    this.menu = new Menu(this);
    this.gui = undefined;
    this.eventDetails = {
	mouseDown : false,
	face : undefined,
	enabled : true
    };

    this.createMenu = function(scene) {
	var gui = new dat.GUI();
	gui.add(this.menu, 'material', [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);
	gui.add(this.menu, 'brushSize', [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);
	gui.add(this.menu, 'save');
	this.gui = gui;
    }

    this.mouseControls = function(camera, renderer, mesh) {
	var editor = this;
	var domEvents = new THREEx.DomEvents(camera, renderer.domElement)
	var eventDetails = editor.eventDetails;

	var changeFace = function(event) {
	    if (eventDetails.enabled == false)
		return;
	    if (eventDetails.mouseDown == false)
		return;

	    // pokud je to stále stejná face jako posledně, nevykresluj
	    var faceIndex = event.intersect.faceIndex;
	    if (eventDetails.face == faceIndex)
		return;
	    eventDetails.face = faceIndex;
	    editor.terrain.paintByFaceIndex(faceIndex, editor.menu.material, editor.menu.brushSize);
	}

	domEvents.addEventListener(mesh, "mousedown", function(event) {
	    eventDetails.mouseDown = true;
	    changeFace(event);
	}, false);
	domEvents.addEventListener(mesh, "mouseup", function(event) {
	    eventDetails.mouseDown = false;
	    eventDetails.face = undefined;
	    changeFace(event);
	}, false);
	domEvents.addEventListener(mesh, "mousemove", function(event) {
	    changeFace(event);
	}, false);
    }

    this.createLights = function(scene) {
	var amblight = new THREE.AmbientLight(0x555544);
	scene.add(amblight);
	this.amblight = amblight;

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
	this.spotlight = spotlight;
    }

    this.animateScene = function(editor) {
	var animate = function() {
	    requestAnimationFrame(arguments.callee);
	    editor.renderer.render(editor.scene, editor.camera);
	    editor.controls.update();
	    editor.stats.update();

	    // orbit controls budou fungovat pouze za stisku shiftu
	    editor.controls.enabled = editor.keyboard.pressed("shift");
	    editor.eventDetails.enabled = !editor.controls.enabled;
	}
	animate();
    };

    this.createStats = function(container) {
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);
	return stats;
    };

    this.createTerrain = function(scene) {
	var terrain = new GAME.Terrain(100, 50);

	// var loader = new THREE.ImageLoader();
	// var image = loader.load("textures/terrain.png");
	// var texture = new THREE.Texture(image);
	// // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	// texture.repeat.set(100 * 20 / 1024, 50 * 20 / 1024);
	// texture.offset.set(0, 0);
	// texture.needsUpdate = true;
	// material = new THREE.MeshLambertMaterial({
	// map : texture,
	// side : THREE.DoubleSide,
	// });

	var texnames = [ "textures/terrain/Dirt 00 seamless.jpg", "textures/terrain/Grass 02 seamless.jpg" ];
	terrain.registerMaterialsFromPath(texnames);

	// var geo = new THREE.PlaneGeometry(20, 20, 20, 20);
	// var geo = new THREE.BoxGeometry(5, 5, 5);
	// var geo = new THREE.SphereGeometry(10, 10, 10);

	// var mat = new THREE.MeshBasicMaterial({
	// wireframe : true
	// });
	// var mat = new THREE.MeshFaceMaterial(materials)

	// var tex1 = THREE.ImageUtils.loadTexture("textures/terrain/Dirt 00
	// seamless.jpg");
	// var tex2 = THREE.ImageUtils.loadTexture("textures/terrain/Grass 02
	// seamless.jpg");
	// var mat = new GAME.BlendedMaterial(1, tex1, tex2);
	//
	// var terrain = {
	// mesh : new THREE.Mesh(geo, mat)
	// };
	// terrain.mesh.rotation.set(-Math.PI / 2, 0, 0);
	// terrain.mesh.scale.set(80, 80, 80);

	this.terrain = terrain;
	scene.add(this.terrain.mesh);
    }

    this.run = function() {
	if (Detector.webgl) {
	    this.renderer = new THREE.WebGLRenderer({
		antialias : true
	    });
	} else {
	    this.renderer = new THREE.CanvasRenderer();
	}

	this.renderer.setClearColor(0x000000, 1);
	this.renderer.autoClear = false;
	this.renderer.shadowMapEnabled = true;
	this.renderer.shadowMapType = THREE.PCFSoftShadowMap;

	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;

	this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	this.container.appendChild(this.renderer.domElement);

	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	this.scene.add(this.camera);
	this.camera.position.set(0, 2000, 0);
	this.camera.lookAt(this.scene.position);

	this.createMenu();
	this.stats = this.createStats(this.container);

	this.scene.fog = new THREE.Fog(0x34583e, 0, 10000);
	this.createLights(this.scene);
	this.createTerrain(this.scene);

	this.controls = new THREE.OrbitControls(this.camera, this.container);
	this.controls.enabled = false;
	this.mouseControls(this.camera, this.renderer, this.terrain.mesh);

	this.animateScene(this);
    }

}