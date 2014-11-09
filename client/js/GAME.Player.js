var GAME = GAME || {};

GAME.Player = function(game) {
    var player = this;
    player.game = game;
    var loader = new THREEx.UniversalLoader()
    loader.load('../models/armature_test.dae', function(object3d) {
	object3d.traverse(function(child) {
	    child.castShadow = true;
	    child.receiveShadow = true;
	    if (child instanceof THREE.SkinnedMesh) {
		player.animation = new THREE.Animation(child, child.geometry.animation);
	    }
	});

	var scale = 1;
	object3d.scale.set(scale, scale, scale);
	object3d.castShadow = true;
	object3d.receiveShadow = true;
	player.mesh = object3d;
	var box = new THREE.Box3().setFromObject(object3d);
	player.height = Math.abs(box.max.y - box.min.y);
	game.scene.add(object3d);

	player.targetCamera(game.camera, player);
    });

    game.cycleCallbacks.push(function(delta) {
	player.animate(delta, player)
    });

}

GAME.Player.STAND = 0;
GAME.Player.WALK = 1;
GAME.Player.HIT = 2;

GAME.Player.prototype = {

    constructor : GAME.Player,
    state : GAME.Player.STAND,
    oldState : undefined,
    height : undefined,
    game : undefined,

    /**
     * Animuje objekt hráče dle zadaného stavu
     */
    animate : function(delta, player) {
	var animation = player.animation;
	if (animation == undefined)
	    return;
	animation.update(delta);

	var keyFrames = animation.data.length * animation.data.fps; // tohle jsou keyFrames !

	// z https://threejsdoc.appspot.com/doc/three.js/src.source/extras/animation/Animation.js.html
	var currentTime = animation.currentTime = animation.currentTime % animation.data.length;
	var currentKeyFrame = Math.min(currentTime * animation.data.fps, animation.data.length * animation.data.fps);

	var newState = !(player.oldState == player.state);

	if (player.state == GAME.Player.STAND) {
	    if (currentKeyFrame >= 2 || newState) {
		animation.stop();
		animation.timeScale = 1 / 50;
		animation.play(0);
	    }
	} else if (player.state == GAME.Player.WALK) {
	    if (currentKeyFrame >= 5 || newState) {
		animation.stop();
		animation.timeScale = 1 / 10;
		animation.play(3 / animation.data.fps);
	    }
	} else if (player.state == GAME.Player.HIT) {
	    if (newState) {
		animation.stop();
		animation.timeScale = 1 / 5;
		animation.play(6 / animation.data.fps);
	    }
	    if (currentKeyFrame >= 9) {
		animation.stop();
		player.state = GAME.Player.STAND;
	    }
	}

	player.oldState = player.state;
    },

    targetCamera : function(camera, player) {
	camera.position.x = player.mesh.position.x + 50;
	camera.position.y = player.mesh.position.y + 100;
	camera.position.z = player.mesh.position.z + 100;
	camera.lookAt(player.mesh.position);
    },

    navigatePlayer : function(game, targetX, targetZ) {
	var p = game.player;
	var position = {
	    x : p.mesh.position.x,
	    z : p.mesh.position.z
	};
	var target = {
	    x : targetX,
	    z : targetZ
	};

	var speed = 0.1; // jednotek za sekundu
	var a = target.z - position.z;
	var b = target.x - position.x;
	var distance = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

	// protáhní stávající cíl jinak se nakonci bude postava koukat jiným směrem
	// (počátek se otočí kolem cílového bodu a pohled se "sveze" jiným směrem)
	// musím zachovat poměr jinak změním směr, takže jednu dám jako 100 a druhou
	// jako 100 * poměr jejich původních délek
	var lookTargetZ = target.z + (a > 0 ? 100 : -100);
	var lookTargetX = target.x + (b > 0 ? 100 : -100) * Math.abs(b / a);

	var tween = new TWEEN.Tween(position).to(target, distance / speed);
	tween.onStart(function() {
	    p.state = GAME.Player.WALK;
	});
	tween.onUpdate(function() {

	    var newYCoord = game.level.getPlantedHeight(position.x, position.z);

	    // if (game.willCollide(position.x, newYCoord, position.z, p.mesh.children[1].children[0])) {
	    // p.state = GAME.Player.STAND;
	    // tween.stop();
	    // return;
	    // }

	    // musí se přepisovat -- v případě, že je během chůze zadán nový cíl, může se stát, že jeho původní
	    // onComplete nastaví předčasně p.state = GAME.Player.STAND; ačkoliv už se pokračuje v novém pochodu
	    p.state = GAME.Player.WALK;
	    p.mesh.position.x = position.x;
	    p.mesh.position.y = newYCoord;
	    p.mesh.position.z = position.z;
	    // počátek je u nohou, takže musí "koukat" na pozici přímo, kde stojí
	    p.mesh.lookAt(new THREE.Vector3(lookTargetX, p.mesh.position.y, lookTargetZ));

	    // CAMERA
	    p.targetCamera(game.camera, p);

	});
	tween.onComplete(function() {
	    p.state = GAME.Player.STAND;
	});
	tween.start();
    },
}
