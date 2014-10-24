var SHADER = SHADER || {};

SHADER = function() {

    this.container = document.body;
    this.renderer = undefined;
    this.scene = new THREE.Scene();
    this.camera = undefined;
    this.stats = undefined;

    this.animateScene = function(editor) {
	var animate = function() {
	    requestAnimationFrame(arguments.callee);
	    editor.renderer.render(editor.scene, editor.camera);
	    editor.stats.update();
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
	var dirt = THREE.ImageUtils.loadTexture("textures/terrain/Pavement_Broken_UV_H_CM_1.jpg");

	grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
	dirt.wrapS = dirt.wrapT = THREE.RepeatWrapping;

	var wireframe = new THREE.MeshBasicMaterial({
	    color : 'red',
	    wireframe : true
	});
	var shaderMaterial = new GAME.BlendedMaterial(2,grass,dirt,2,2);

	var facesMaterial = new THREE.MeshFaceMaterial([ wireframe, shaderMaterial ]);

	var sphereGeo = new THREE.PlaneGeometry(50, 50, 2, 2);

	sphereGeo.faces[0].materialIndex = 1;
	sphereGeo.faces[1].materialIndex = 1;

	var sphereMesh = new THREE.Mesh(sphereGeo, facesMaterial);
	sphereMesh.position.set(0, 0, 0);
	sphereMesh.rotation.set(-Math.PI / 2, 0, 0);
	this.scene.add(sphereMesh);

	this.animateScene(this);
    }
}