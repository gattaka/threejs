var GAME = GAME || {};

GAME.Player = function(scene) {
    var player = this;
    var loader = new THREEx.UniversalLoader()
    loader.load('../models/armature_test.dae', function(object3d) {
	object3d.traverse(function(child) {
	    child.castShadow = true;
	    child.receiveShadow = true;
	    if (child instanceof THREE.SkinnedMesh) {
		player.animation = new THREE.Animation(child, child.geometry.animation);
	    }
	});

	object3d.scale.set(5, 5, 5);
	object3d.castShadow = true;
	object3d.receiveShadow = true;
	player.mesh = object3d;
	var box = new THREE.Box3().setFromObject(object3d);
	player.height = Math.abs(box.max.y - box.min.y);
	scene.add(object3d);
    });

}

GAME.Player.STAND = 0;
GAME.Player.WALK = 1;

GAME.Player.prototype = {

    constructor : GAME.Player,
    state : GAME.Player.STAND,
    oldState : undefined,
    height : undefined,

    animate : function(delta) {
	var animation = this.animation;
	if (animation == undefined)
	    return;
	animation.update(delta);

	var keyFrames = animation.data.length * animation.data.fps; // tohle jsou keyFrames !

	// z https://threejsdoc.appspot.com/doc/three.js/src.source/extras/animation/Animation.js.html
	var currentTime = animation.currentTime = animation.currentTime % animation.data.length;
	var currentKeyFrame = Math.min(currentTime * animation.data.fps, animation.data.length * animation.data.fps);

	var newState = !(this.oldState == this.state);

	if (this.state == GAME.Player.STAND) {
	    if (currentKeyFrame >= 2 || newState) {
		animation.stop();
		animation.timeScale = 1 / 50;
		animation.play(0);
	    }
	} else if (this.state == GAME.Player.WALK) {
	    if (currentKeyFrame >= 5 || newState) {
		animation.stop();
		animation.timeScale = 1 / 10;
		animation.play(3 / animation.data.fps);
	    }
	}

	// console.log("currentTime: " + currentTime);
	// console.log("currentKeyFrame: " + currentKeyFrame);

	this.oldState = this.state;
    },
}
