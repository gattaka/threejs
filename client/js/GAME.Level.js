var GAME = GAME || {};
GAME.Level = {};
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

GAME.Level.prototype = {

    constructor : GAME.Level,

    skybox : undefined,
    terrain : undefined,
    amblight : undefined,
    spotlight : undefined,

    /**
     * Usazuje objekty dle úrovně terénu
     */
    plantObject : function(object, terrain) {
	object.position.y = THREEx.Terrain.planeToHeightMapCoords(terrain.heightMap, terrain.mesh, object.position.x,
		object.position.z);
    },

    createTerrain : function(scene) {
	// TODO nahrávat z XML
	var data = GAME.Utils.loadString('../maps/map.dat');
	var terrain = GAME.Terrain.load(data);

	terrain.mesh.receiveShadow = true;
	terrain.mesh.castShadow = true;
	this.terrain = terrain;
	scene.add(terrain.mesh);
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
	// this.plantObject(c1, this.terrain);
	// this.plantObject(c2, this.terrain);
	// scene.add(c1);
	// scene.add(c2);

	// var terrain = this.terrain;
	// GAME.loadCollada('models/wall.dae', function(obj) {
	// GAME.Level.plantObject(obj, terrain);
	// scene.add(obj);
	// }, function(child) {
	// var start = [ 10, 0, 5 ];
	// for (var i = 0; i < 2; i++) {
	// var obj = new THREE.Mesh(child.geometry, child.material);
	// obj.position.set(start[0] + i * 16, start[1], start[2]);
	// obj.castShadow = true;
	// obj.receiveShadow = true;
	// GAME.Level.plantObject(obj, terrain);
	// scene.add(obj);
	// }
	// });

	var level = this;
	GAME.Utils.loadCollada('../models/pine.dae', function(obj) {
	    obj.scale.set(10, 10, 10);
	    obj.rotateY(Math.PI / 2);
	    obj.position.set(20, 0, 30);
	    level.plantObject(obj, level.terrain);
	    scene.add(obj);
	}, function(child) {
	    var wrapSize = 5;
	    var step = 30;
	    var offsetX = 50;
	    var offsetZ = 50;

	    for (var i = 0; i < 20; i++) {
		var obj = new THREE.Mesh(child.geometry, child.material);
		obj.castShadow = true;
		obj.receiveShadow = true;
		obj.scale.multiplyScalar(0.1 + Math.random() / 5);
		obj.position.set(offsetX + (i % wrapSize) * step + Math.random() * step / 2, 0, offsetZ
			+ (i / wrapSize) * step + Math.random() * step / 2);
		level.plantObject(obj, level.terrain);
		scene.add(obj);
	    }
	    if (child.material) {
		child.material.transparent = true;
		child.material.depthWrite = false;
	    }

	    level.plantObject(obj, level.terrain);
	    scene.add(obj);
	});

	GAME.Utils.loadCollada('../models/House4/House4Upload.dae', function(obj) {
	    obj.position.x = -50;
	    obj.position.z = -50;
	    level.plantObject(obj, level.terrain);
	    scene.add(obj);
	}, function(child) {
	    // var start = [ 10, 0, 5 ];
	    // for (var i = 0; i < 2; i++) {
	    // var obj = new THREE.Mesh(child.geometry, child.material);
	    // obj.position.set(start[0] + i * 16, start[1], start[2]);
	    // obj.castShadow = true;
	    // obj.receiveShadow = true;
	    // GAME.Level.plantObject(obj, terrain);
	    // scene.add(obj);
	    // }
	});
    }

};