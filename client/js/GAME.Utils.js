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