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

    this.initStats = function() {
	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';
	this.stats.domElement.style.zIndex = 100;
	this.container.appendChild(this.stats.domElement);
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

    this.loadCollada = function(path, scene, modifier) {
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

    this.createItems = function(scene) {
	// this.loadCollada('models/lava_test.dae', scene, function(o) {
	// o.scale.set(10, 10, 10);
	// o.position.set(50, 70, 100);
	// });
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

	if (keyboard.pressed("h") == true) {

	    var rockMaterial = rock.material;

	    var sphere_geometry = new THREE.IcosahedronGeometry(80, 1);
	    var sphere_mesh = new THREE.Mesh(sphere_geometry);
	    sphere_mesh.position.z = 110;
	    sphere_mesh.position.x = -100 + (Math.random() * 1000) % 200;
	    sphere_mesh.position.y = 0 + (Math.random() * 1000) % 200;
	    var sphere_bsp = new ThreeBSP(sphere_mesh);
	    var cube_bsp = new ThreeBSP(rock);
	    var subtract_bsp = cube_bsp.subtract(sphere_bsp);
	    var rock2 = subtract_bsp.toMesh(rockMaterial);

	    for (i = 0; i < 2; i++) {

		var side = 200;
		var supplementGeo = new THREE.BoxGeometry(side, side, side);
		var supplementMesh = new THREE.Mesh(supplementGeo, rockMaterial);
		supplementMesh.position.set(0, 100, 0);

		var supplement_bsp = new ThreeBSP(supplementMesh);
		var cube_bsp = new ThreeBSP(rock2);
		var subtract_bsp = supplement_bsp.subtract(cube_bsp);
		var rock2 = subtract_bsp.toMesh(rockMaterial);
		rock2.geometry.computeVertexNormals();

	    }
	    
	    rock2.castShadow = true;
	    rock2.receiveShadow = true;

	    scene.remove(rock);
	    scene.add(rock2);
	    game.rock = rock2;
	    
	    keyboard.lastTime = 0
	}
    }

    this.createCSG = function(scene) {

	var rockTexture = new THREE.ImageUtils.loadTexture('models/texture8.jpg');
	var rockMaterial = new THREE.MeshLambertMaterial({
	    shading : THREE.SmoothShading,
	    map : rockTexture,
	    wireframe : true
	});

	var side = 200;
	var rockGeometry = new THREE.BoxGeometry(side, side, side);
	var rock = new THREE.Mesh(rockGeometry, rockMaterial);

	rock.castShadow = true;
	rock.receiveShadow = true;
	rock.scale.set(1, 1, 1);
	rock.position.set(0, side / 2, 0);

	this.rock = rock;

	scene.add(rock);
    };

    this.createSkybox = function(scene) {
	var imagePrefix = "textures/Skybox-";
	var directions = [ "Right", "Left", "Top", "Bottom", "Front", "Back" ];
	var imageSuffix = ".bmp";
	var skyGeometry = new THREE.BoxGeometry(5000, 5000, 5000);

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
	this.camera.position.set(500, 200, 500);
	this.camera.lookAt(this.scene.position);

	this.cameraOrtho = new THREE.OrthographicCamera(-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, -SCREEN_HEIGHT / 2, 1, 10);
	this.cameraOrtho.position.z = 10;

	this.createPlane(this.scene);
	this.createLights(this.scene);
	this.createSkybox(this.scene);
	this.createItems(this.scene);
	this.createCSG(this.scene);
	this.createFrame(this.scene);

	this.scene.add(new THREE.AxisHelper(100));

	this.initScreenEvents();
	this.initControls();
	this.initStats();

	this.log("rendering...");
	this.animateScene();
    };
};