var SHADER = SHADER || {};

SHADER = function() {

    this.container = document.body;
    this.renderer = undefined;
    this.scene = new THREE.Scene();
    this.camera = undefined;
    this.stats = undefined;
    this.controls = undefined;

    this.animateScene = function(editor) {
	var animate = function() {
	    requestAnimationFrame(arguments.callee);
	    editor.renderer.render(editor.scene, editor.camera);
	    editor.stats.update();
	    editor.controls.update();
	    // editor.uniforms.delta.value += 0.1;
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

    this.createBlendedMaterial

    this.run = function() {
	if (Detector.webgl) {
	    this.renderer = new THREE.WebGLRenderer({
		antialias : true
	    });
	} else {
	    this.renderer = new THREE.CanvasRenderer();
	}
	this.renderer.setClearColor(0x000000, 1);
	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;
	this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	this.container.appendChild(this.renderer.domElement);
	this.stats = this.createStats(this.container);

	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	this.camera.position.set(0, 100, 0);
	this.camera.lookAt(this.scene.position);
	this.scene.add(this.camera);

	var grass = THREE.ImageUtils.loadTexture("textures/terrain/Grass 02 seamless.jpg");
	var dirt = THREE.ImageUtils.loadTexture("textures/terrain/Dirt 00 seamless.jpg");

	grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
	dirt.wrapS = dirt.wrapT = THREE.RepeatWrapping;

	var wireframe = new THREE.MeshBasicMaterial({
	    color : 'red',
	    wireframe : true
	});

	var ti = 3;
	var facesMaterial = new THREE.MeshFaceMaterial([ wireframe, 
	                                                 new GAME.BlendedMaterial(0,grass,dirt,ti,ti), 
	                                                 new GAME.BlendedMaterial(1,grass,dirt,ti,ti), 
	                                                 new GAME.BlendedMaterial(2,grass,dirt,ti,ti),
	                                                 new GAME.BlendedMaterial(3,grass,dirt,ti,ti),
	                                                 new GAME.BlendedMaterial(4,grass,dirt,ti,ti),
	                                                 new GAME.BlendedMaterial(5,grass,dirt,ti,ti),
	                                                 new GAME.BlendedMaterial(6,grass,dirt,ti,ti),
	                                                 new GAME.BlendedMaterial(7,grass,dirt,ti,ti),
	                                                 //---
	                                                 new GAME.BlendedMaterial(1,dirt,grass,ti,ti),
	                                                 new GAME.BlendedMaterial(3,dirt,grass,ti,ti),
	                                                 new GAME.BlendedMaterial(5,dirt,grass,ti,ti),
	                                                 new GAME.BlendedMaterial(7,dirt,grass,ti,ti),
	                                                 ]);

	var sphereGeo = new THREE.PlaneGeometry(50, 50, ti, ti);

	sphereGeo.faces[0].materialIndex = 2;
	sphereGeo.faces[1].materialIndex = 2;
	
	sphereGeo.faces[2].materialIndex = 3;
	sphereGeo.faces[3].materialIndex = 3;
	
	sphereGeo.faces[4].materialIndex = 4;
	sphereGeo.faces[5].materialIndex = 4;
	
	sphereGeo.faces[6].materialIndex = 1;
	sphereGeo.faces[7].materialIndex = 1;
	
	sphereGeo.faces[8].materialIndex = 0;
	sphereGeo.faces[9].materialIndex = 0;
	
	sphereGeo.faces[10].materialIndex = 5;
	sphereGeo.faces[11].materialIndex = 5;
	
	sphereGeo.faces[12].materialIndex = 8;
	sphereGeo.faces[13].materialIndex = 8;
	
	sphereGeo.faces[14].materialIndex = 7;
	sphereGeo.faces[15].materialIndex = 7;
	
	sphereGeo.faces[16].materialIndex = 6;
	sphereGeo.faces[17].materialIndex = 6;
	
//	sphereGeo.faces[0].materialIndex = 9;
//	sphereGeo.faces[1].materialIndex = 9;
//	
//	sphereGeo.faces[2].materialIndex = 7;
//	sphereGeo.faces[3].materialIndex = 7;
//	
//	sphereGeo.faces[4].materialIndex = 10;
//	sphereGeo.faces[5].materialIndex = 10;
//	
//	sphereGeo.faces[6].materialIndex = 5;
//	sphereGeo.faces[7].materialIndex = 5;
//	
//	sphereGeo.faces[8].materialIndex = 0;
//	sphereGeo.faces[9].materialIndex = 0;
//	
//	sphereGeo.faces[10].materialIndex = 1;
//	sphereGeo.faces[11].materialIndex = 1;
//	
//	sphereGeo.faces[12].materialIndex = 12;
//	sphereGeo.faces[13].materialIndex = 12;
//	
//	sphereGeo.faces[14].materialIndex = 3;
//	sphereGeo.faces[15].materialIndex = 3;
//	
//	sphereGeo.faces[16].materialIndex = 11;
//	sphereGeo.faces[17].materialIndex = 11;

	var sphereMesh = new THREE.Mesh(sphereGeo, facesMaterial);
	sphereMesh.position.set(0, 0, 0);
	sphereMesh.rotation.set(-Math.PI / 2, 0, 0);
	this.scene.add(sphereMesh);
	
	this.controls = new THREE.OrbitControls(this.camera, this.container);

	this.animateScene(this);
    }
}