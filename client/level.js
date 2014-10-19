GAME.Level = function(scene, xml) {

    /**
     * Nahraj level data z XML
     */
    var XML; // TODO

    /**
     * Level Skybox
     */
    this.skybox = GAME.Skybox.create(scene);
    scene.add(this.skybox);

    /**
     * Terrain
     */
    this.createTerrain(scene);

    /**
     * Světla
     */
    this.createLights(scene);

    /**
     * Objekty
     */
    this.createObjects(scene);
}

/**
 * Usazuje objekty dle úrovně terénu
 */
GAME.Level.plantObject = function(object, terrain) {
    object.position.y = THREEx.Terrain.planeToHeightMapCoords(terrain.map, terrain.mesh, object.position.x, object.position.z);
}

GAME.Level.prototype = {

    constructor : GAME.Level,

    skybox : undefined,
    terrain : undefined,
    amblight : undefined,
    spotlight : undefined,

    createTerrain : function(scene) {
	var texturePath = 'textures/Dirt 00 seamless.jpg';
	var texture = new THREE.ImageUtils.loadTexture(texturePath);
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(100, 100);
	var material = new THREE.MeshLambertMaterial({
	    map : texture,
	    side : THREE.DoubleSide
	});
	var heightMap = THREEx.Terrain.allocateHeightMap(100, 200);
	THREEx.Terrain.simplexHeightMap(heightMap);
	var geometry = THREEx.Terrain.heightMapToPlaneGeometry(heightMap);
	var terrain = new THREE.Mesh(geometry, material);

	terrain.rotateX(-Math.PI / 2);
	terrain.scale.x = 2000;
	terrain.scale.y = 2000;
	terrain.scale.z = 20;

	terrain.receiveShadow = true;
	scene.add(terrain);
	this.terrain = {
	    mesh : terrain,
	    map : heightMap
	};
    },

    createLights : function(scene) {
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
    },

    createObjects : function(scene) {

	// var texturePath = 'models/pinet1.png';
	// var texture = new THREE.ImageUtils.loadTexture(texturePath);
	//
	// // Definition 2
	// var geometry = new THREE.BoxGeometry(20, 50, 20);
	// var material = new THREE.MeshLambertMaterial({
	// map : texture,
	// side : THREE.DoubleSide,
	// transparent : true,
	// depthWrite : false
	// });
	// var c1 = new THREE.Mesh(geometry, material);
	// var c2 = new THREE.Mesh(geometry, material);
	//
	// c1.position.set(-20, 0, -20);
	// c2.position.set(-40, 0, -20);
	//
	// GAME.Level.plantObject(c1, this.terrain);
	// GAME.Level.plantObject(c2, this.terrain);
	// scene.add(c1);
	// scene.add(c2);

	var terrain = this.terrain;
	GAME.loadCollada('models/wall.dae', function(obj) {
	    GAME.Level.plantObject(obj, terrain);
	    scene.add(obj);
	}, function(child) {
	    var start = [ 10, 0, 5 ];
	    for (var i = 0; i < 2; i++) {
		var obj = new THREE.Mesh(child.geometry, child.material);
		obj.position.set(start[0] + i * 16, start[1], start[2]);
		obj.castShadow = true;
		obj.receiveShadow = true;
		GAME.Level.plantObject(obj, terrain);
		scene.add(obj);
	    }
	});

	GAME.loadCollada('models/pine.dae', function(obj) {
	    obj.scale.set(10, 10, 10);
	    obj.rotateY(Math.PI / 2);
	    obj.position.set(20, 0, 30);
	    GAME.Level.plantObject(obj, terrain);
	    scene.add(obj);
	}, function(child) {
	    var wrapSize = 10;
	    var step = 30;
	    var offsetX = 50;
	    var offsetZ = 50;

	    for (var i = 0; i < 100; i++) {
		var obj = new THREE.Mesh(child.geometry, child.material);
		obj.castShadow = true;
		obj.receiveShadow = true;
		obj.scale.multiplyScalar(0.1 + Math.random() / 5);
		obj.position.set(offsetX + (i % wrapSize) * step + Math.random() * step/2, 0, offsetZ + (i / wrapSize) * step + Math.random() * step/2);
		GAME.Level.plantObject(obj, terrain);
		scene.add(obj);
	    }
	    if (child.material) {
		child.material.transparent = true;
		child.material.depthWrite = false;
	    }

	    GAME.Level.plantObject(obj, terrain);
	    scene.add(obj);
	});
    }

};