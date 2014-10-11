// Global scene object
var scene;

// Global camera object
var camera;

// absolutní vzdálenost od středu (trojůhelník x,z,cameraR)
// var cameraR = 6;
var cameraR = 1400;
var cameraYAngle = 135; // počáteční úhel
// var cameraHeight = 2; // osa y (výška kamery)
var cameraHeight = 600;

// Global mesh object of the cube
var cubeMesh;

// Initialize the scene
initializeScene();

// Animate the scene
animateScene();

// Angles to Rads
function toRad(angle) {
	return angle * 3.14 / 180;
}

function log(msg) {
	console.log("SCENE-LOADER:: " + msg);
}

/**
 * Initialze the scene.
 */
function initializeScene() {
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
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;

	// Set the renderers size to the content areas size
	renderer.setSize(canvasWidth, canvasHeight);

	// Get the DIV element from the HTML document by its ID and append the
	// renderers DOM
	// object to it
	// document.getElementById("WebGLCanvas").appendChild(renderer.domElement);
	document.body.appendChild(renderer.domElement);

	// Create the scene, in which all objects are stored (e. g. camera, lights,
	// geometries, ...)
	scene = new THREE.Scene();

	// camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1,
	// 100);
	camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1,
			4000);
	camera.position.y = cameraHeight;
	camera.lookAt(scene.position);

	scene.add(camera);

	// //////////////////////////////////////////////////////////////////////////////////

	var sc = new THREE.ObjectLoader().parse(json);

	geometries = {};
	materials = {};
	textures = {};

	log("loading textures data ...");
	for (var i = 0; i < texdata.length; i++) {
		texture = texdata[i];
		textures[texture.uuid] = texture;
		// log("textures '" + texture.name + "' with UUID '" + texture.uuid + "'
		// stored");
	}

	while (sc.children.length > 0) {
		var object = sc.children[0];
		if (textures[object.material.uuid]) {
			var texture = new THREE.ImageUtils.loadTexture("images/textury/"
					+ textures[object.material.uuid].name);
			object.material = new THREE.MeshBasicMaterial({
				map : texture,
				side : THREE.DoubleSide,
				transparent : true
			});
		}
		scene.add(object);
	}

	log(sc);

	// //////////////////////////////////////////////////////////////////////////////////
}

/**
 * Animate the scene and call rendering.
 */
function animateScene() {

	cameraYAngle += 0.2;
	// cameraYAngle += 1;

	// dopočítej pozici kamery (x, z) dle její vzdálenosti a úhlu od středu
	camera.position.x = Math.cos(toRad(cameraYAngle)) * cameraR;
	camera.position.z = Math.sin(toRad(cameraYAngle)) * cameraR;

	// zaměř kameru na střed scény
	camera.lookAt(scene.position);
	// camera.lookAt(new THREE.Vector3(0,0,100));

	requestAnimationFrame(animateScene);
	renderScene();
}

/**
 * Render the scene. Map the 3D world to the 2D screen.
 */
function renderScene() {
	renderer.render(scene, camera);
}