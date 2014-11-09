var GAME = GAME || {};
GAME.Level = function(game, xml) {

    /**
     * Nahraj level data z XML
     */
    var XML; // TODO

    /**
     * Level Skybox
     */
    this.createSkybox(game.scene);

    /**
     * Bloky -- prostředí
     */
    this.createBlocks(game);

    /**
     * Světla
     */
    this.createLights(game.scene);

    /**
     * Objekty
     */
    this.createObjects(game);
}

GAME.Level.prototype = {

    constructor : GAME.Level,

    skybox : undefined,
    blocks : [],
    amblight : undefined,
    spotlight : undefined,
    collisionObjects : [],

    /**
     * Usazuje objekty dle úrovně terénu
     */
    plantObject : function(object) {
	object.position.y = this.getPlantedHeight(object.position.x, object.position.z);
    },

    getPlantedHeight : function(x, z) {
	// return THREEx.Terrain.planeToHeightMapCoords(this.terrain.heightMap, this.terrain.mesh, x, z);
	return 2;
    },

    createSkybox : function(scene) {
	this.skybox = new GAME.Skybox();
	scene.add(this.skybox);
    },

    /**
     * Získá objekty, na kterých lze přes raycasting zjišťovat polohu pro navigaci hráče -- tedy objekty, po kterých
     * může hráč nebo jiné postavy chodit
     */
    getObjectsForNavigation : function() {
	// aktuálně to jsou všechny blocks
	return this.blocks;
    },

    /**
     * Registruje události, které se mají stát při nějaké akci na daném bloku -- nejde o události navigace, ta je řešena
     * jinde -- aktuálně jí řeší GAME.PlayerMover
     */
    registerBlockActions : function(game, mesh) {
	// TODO časem ...
    },

    createBlocks : function(game) {
	var level = this;

	/*
	 * MODUL
	 */
	loader = new THREE.JSONLoader();
	loader.load("../models/modul/modul.json", function(geometry, materials) {
	    var scale = 5;
	    var width = 10 * scale;
	    var depth = 10 * scale;
	    var start = [ -5.5 * width, 1, -5 * depth ];
	    var grid = 10;
	    for (var i = 0; i < grid * grid; i++) {
		mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(scale, scale, scale);
		mesh.position.set(start[0] + (i % grid) * width, start[1], start[2] + Math.floor(i / grid) * depth);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		game.scene.add(mesh);
		level.collisionObjects.push(mesh);
		level.blocks.push(mesh);
		level.registerBlockActions(game, mesh);
	    }
	});
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
	// spotlight.shadowMapWidth = 1024; // default is 512
	// spotlight.shadowMapHeight = 1024; // default is 512
	// must enable shadow casting ability for the light
	spotlight.castShadow = true;
	scene.add(spotlight);
	this.spotlight = spotlight;
    },

    createObjects : function(game) {

	var level = this;

	/*
	 * TESTBOX
	 */
	var geometry = new THREE.BoxGeometry(20, 20, 20);
	var c1 = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
	    color : 0xffaabb
	}));
	game.scene.add(c1);
	c1.receiveShadow = true;
	c1.castShadow = true;
	c1.position.set(-50, 20, -50);

	var c2 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
	    color : 0xff0000,
	    side : THREE.BackSide
	}));
	c2.position.set(c1.position.x, c1.position.y, c1.position.z);
	c2.scale.multiplyScalar(1.02);

	game.domEvents.addEventListener(c1, "mouseover", function(event) {
	    game.scene.add(c2);
	});
	game.domEvents.addEventListener(c2, "mouseout", function(event) {
	    game.scene.remove(c2);
	});

	level.collisionObjects.push(c1);

	// GAME.Utils.loadCollada('../models/pine.dae', function(obj) {
	// obj.scale.set(10, 10, 10);
	// obj.rotateY(Math.PI / 2);
	// obj.position.set(20, 0, 30);
	// level.plantObject(obj, level.terrain);
	// scene.add(obj);
	// }, function(child) {
	// var wrapSize = 5;
	// var step = 30;
	// var offsetX = 50;
	// var offsetZ = 50;
	//
	// for (var i = 0; i < 20; i++) {
	// var obj = new THREE.Mesh(child.geometry, child.material);
	// obj.castShadow = true;
	// obj.receiveShadow = true;
	// obj.scale.multiplyScalar(0.1 + Math.random() / 5);
	// obj.position.set(offsetX + (i % wrapSize) * step + Math.random() * step / 2, 0, offsetZ
	// + (i / wrapSize) * step + Math.random() * step / 2);
	// level.plantObject(obj, level.terrain);
	// scene.add(obj);
	// }
	// if (child.material) {
	// child.material.transparent = true;
	// child.material.depthWrite = false;
	// }
	//
	// level.plantObject(obj, level.terrain);
	// scene.add(obj);
	// });

	// GAME.Utils.loadCollada('../models/House4/House4Upload.dae', function(obj) {
	// obj.position.x = -50;
	// obj.position.z = -50;
	// level.plantObject(obj, level.terrain);
	// scene.add(obj);
	// }, function(child) {
	// // var start = [ 10, 0, 5 ];
	// // for (var i = 0; i < 2; i++) {
	// // var obj = new THREE.Mesh(child.geometry, child.material);
	// // obj.position.set(start[0] + i * 16, start[1], start[2]);
	// // obj.castShadow = true;
	// // obj.receiveShadow = true;
	// // GAME.Level.plantObject(obj, terrain);
	// // scene.add(obj);
	// // }
	// });

	// var loader = new THREEx.UniversalLoader()
	// loader.load('../models/armature_test.dae', function(object3d) {
	// object3d.traverse(function(child) {
	// child.castShadow = true;
	// child.receiveShadow = true;
	// if (child instanceof THREE.SkinnedMesh) {
	// console.log("child.geometry.animation: " + child.geometry.animation);
	// var animation = new THREE.Animation(child, child.geometry.animation);
	// animation.play();
	// }
	//
	// });
	//
	// // this function will be notified when the model is loaded
	// object3d.scale.set(5, 5, 5);
	// level.plantObject(object3d, level.terrain);
	// object3d.castShadow = true;
	// object3d.receiveShadow = true;
	// scene.add(object3d);
	// });

	// GAME.Utils.loadCollada('../models/BeetleGolem_v3.dae', function(obj) {
	// // obj.position.x = -100;
	// // obj.position.z = -100;
	// obj.scale.set(1, 1, 1);
	// level.plantObject(obj, level.terrain);
	// scene.add(obj);
	// }, function(child) {
	// // var start = [ 10, 0, 5 ];
	// // for (var i = 0; i < 2; i++) {
	// // var obj = new THREE.Mesh(child.geometry, child.material);
	// // obj.position.set(start[0] + i * 16, start[1], start[2]);
	// // obj.castShadow = true;
	// // obj.receiveShadow = true;
	// // GAME.Level.plantObject(obj, terrain);
	// // scene.add(obj);
	// // }
	// });

	// function enableSkinning(skinnedMesh) {
	// var materials = skinnedMesh.material.materials;
	// for (var i = 0, length = materials.length; i < length; i++) {
	// var mat = materials[i];
	// mat.skinning = true;
	// }
	// }
	//
	// var loader = new THREE.JSONLoader;
	// var animation;
	// loader.load('../models/animation.js', function(geometry, materials) {
	// skinnedMesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
	// enableSkinning(skinnedMesh);
	//	    
	// skinnedMesh.castShadow = true;
	// skinnedMesh.receiveShadow = true;
	// scene.add(skinnedMesh);
	// level.plantObject(skinnedMesh, level.terrain);
	//	    
	// THREE.AnimationHandler.add(skinnedMesh.geometry.animation);
	// // animation = new THREE.Animation(skinnedMesh, "ArmatureAction", THREE.AnimationHandler.CATMULLROM);
	// animation = new THREE.Animation(skinnedMesh, skinnedMesh.geometry.animation);
	// animation.play();
	// });

    }

};