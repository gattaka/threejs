var GAME = GAME || {};
GAME.loadCollada = function(path, scene, modifier, childrenModifier) {
    var loader = new THREEx.UniversalLoader()
    loader.load(path, function(object3d) {
	object3d.traverse(function(child) {
	    child.castShadow = true;
	    child.receiveShadow = true;
	    if (child instanceof THREE.SkinnedMesh) {
		var animation = new THREE.Animation(child, child.geometry.animation);
		animation.play();
	    }
	    if (childrenModifier) {
		childrenModifier(child);
	    }
	    
	});

	// this function will be notified when the model is loaded
	if (modifier)
	    modifier(object3d);
	scene.add(object3d);
    });
};

GAME.createStats = function(container) {
    var stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);
    return stats;
};