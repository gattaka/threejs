var GAME = GAME || {};
GAME.Level = function(scene, xml) {

    /**
     * Nahraj level data z XML
     */
    var XML; // TODO

    /**
     * Level Skybox
     */
    this.createSkybox(scene);

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
    plantObject : function(object) {
	object.position.y = THREEx.Terrain.planeToHeightMapCoords(this.terrain.heightMap, this.terrain.mesh,
		object.position.x, object.position.z);
    },

    createSkybox : function(scene) {
	this.skybox = new GAME.Skybox();
	scene.add(this.skybox);
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
	var level = this;

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