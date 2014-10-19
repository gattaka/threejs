var EDITOR = EDITOR || {};
EDITOR = function() {

    this.container = document.body;
    this.renderer = undefined;
    this.scene = new THREE.Scene();
    this.camera = undefined;
    this.terrain = undefined;
    this.controls = undefined;
    this.stats = undefined;
    this.keyboard = new THREEx.KeyboardState();

    this.eventDetails = {
	mouseDown : false,
	face : undefined,
	enabled : true
    };

    this.createTerrain = function(scene) {

	var createTerrainMaterial = function(texturePath) {
	    var texture = new THREE.ImageUtils.loadTexture(texturePath);
	    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	    texture.repeat.set(100, 100);
	    return new THREE.MeshLambertMaterial({
		map : texture,
		side : THREE.DoubleSide,
	    });
	}

	var dirtMaterial = createTerrainMaterial('textures/Dirt 00 seamless.jpg');
	var grassMaterial = createTerrainMaterial('textures/Grass 02 seamless.jpg');

	var terrainWidth = 100;
	var terrainDepth = 100;
	var heightMap = THREEx.Terrain.allocateHeightMap(terrainWidth + 1, terrainDepth + 1);
	THREEx.Terrain.simplexHeightMap(heightMap);
	var geometry = THREEx.Terrain.heightMapToPlaneGeometry(heightMap);

	// materials
	var materials = [];
	materials.push(new THREE.MeshBasicMaterial({
	    color : 'red',
	    wireframe : true
	}));
	materials.push(dirtMaterial);
	materials.push(grassMaterial);

	var circleCenterX = 50;
	var circleCenterZ = 50;
	var circleRadius = 10;

	// assign a material to each face (each face is 2 triangles)
	var l = geometry.faces.length / 2;
	for (var i = 0; i < l; i++) {
	    var materialIndex = 0;
	    var x = i % terrainWidth;
	    var z = Math.floor(i / terrainWidth);

	    var j = 2 * i; // triangle
	    geometry.faces[j].materialIndex = materialIndex;
	    geometry.faces[j + 1].materialIndex = materialIndex;
	}

	// mesh
	var terrain = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

	terrain.rotateX(-Math.PI / 2);
	terrain.scale.x = 2000;
	terrain.scale.y = 2000;
	terrain.scale.z = 20;

	terrain.receiveShadow = true;
	scene.add(terrain);
	return {
	    mesh : terrain,
	    map : heightMap,
	    width : terrainWidth,
	    depth : terrainDepth
	};

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

	    var faceIndex = event.intersect.faceIndex;
	    if (eventDetails.face == faceIndex)
		return;
	    eventDetails.face = faceIndex;

	    console.log("click on terrain, face: " + faceIndex);

	    var geo = editor.terrain.mesh.geometry;
	    geo.faces[faceIndex].materialIndex = geo.faces[faceIndex].materialIndex == 0 ? 1 : 0;
	    // geo.elementsNeedUpdate = true;
	    // geo.colorsNeedUpdate = true;
	    // geo.elementsNeedUpdate = true;
	    geo.groupsNeedUpdate = true;
	    // geo.normalsNeedUpdate = true;
	    // geo.uvsNeedUpdate = true;
	    // geo.verticesNeedUpdate = true;
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
	this.camera.position.set(0, 3000, 0);
	this.camera.lookAt(this.scene.position);
	this.scene.fog = new THREE.Fog(0x34583e, 0, 10000);
	this.terrain = this.createTerrain(this.scene);
	this.controls = new THREE.OrbitControls(this.camera, this.container);
	this.controls.enabled = false;
	this.mouseControls(this.camera, this.renderer, this.terrain.mesh);
	this.stats = this.createStats(this.container);
	this.createLights(this.scene);

	this.animateScene(this);
    }

}