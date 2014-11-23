var GAME = GAME || {};
GAME.Utils = {};

GAME.Utils.loadCollada = function(path, modifier, childrenModifier) {
    var loader = new THREEx.UniversalLoader()
    loader.load(path, function(object3d) {
	object3d.traverse(function(child) {
	    child.castShadow = true;
	    child.receiveShadow = true;
	    if (child instanceof THREE.SkinnedMesh) {
		console.log("child.geometry.animation: " + child.geometry.animation);
		if (child.geometry.animation != undefined) {
		    var animation = new THREE.Animation(child, child.geometry.animation);
		    animation.play();
		}
	    }
	    if (childrenModifier) {
		childrenModifier(child);
	    }

	});

	// this function will be notified when the model is loaded
	if (modifier)
	    modifier(object3d);
    });
};

GAME.Utils.createStats = function(container) {
    var stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);
    return stats;
};

GAME.Utils.loadString = function(url) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}

GAME.Utils.showBoundingBox = function(game, mesh) {
    var geometry = mesh.geometry;
    var scale = mesh.scale.x; // předpokladem je, že jsou všechny strany zvětšeny stejně (což většinou je)
    var width = (geometry.boundingBox.max.x - geometry.boundingBox.min.x) * scale;
    var height = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) * scale;
    var depth = (geometry.boundingBox.max.z - geometry.boundingBox.min.z) * scale;
    var box = new THREE.BoxGeometry(width, height, depth, 1, 1, 1);

    var pMesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({
	color : 0xaaff00,
	wireframe : true
    }), 0);
    game.scene.add(pMesh);
    pMesh.position.set(mesh.position.x, mesh.position.y, mesh.position.z);

    // aby se to ukazovalo i během animace
    game.scene.addEventListener('update', function() {
	pMesh.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
	pMesh.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
    });
}