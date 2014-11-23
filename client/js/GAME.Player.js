var GAME = GAME || {};

GAME.Player = function(game) {
    var player = this;
    player.game = game;
    var loader = new THREEx.UniversalLoader()
    loader.load('../models/armature_test.dae', function(object3d) {
	/*
	 * Animační model
	 */
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
	var box = new THREE.Box3().setFromObject(object3d);
	player.height = Math.abs(box.max.y - box.min.y);
	game.scene.add(object3d);

	/*
	 * Fyzikální (kolizní) model
	 */
	var width = (box.max.x - box.min.x) * scale;
	var height = (box.max.y - box.min.y) * scale;
	var depth = (box.max.z - box.min.z) * scale;
	var pMeshGeometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1);
	var pMesh = new Physijs.BoxMesh(pMeshGeometry, new THREE.MeshBasicMaterial({
	    color : 0xaaff00,
	    wireframe : true
	}), 2000);
	pMesh.position.set(0, 50, 0);
	player.mesh = pMesh;
	game.scene.add(pMesh);

	/*
	 * Provázání modelů
	 */
	game.scene.addEventListener('update', function() {

	    var mesh = player.mesh;

	    // hráč se nikdy nepřeklopí apod. -- naopak jeho rotace jsou manuálně a pevně dány
	    mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));

	    // udržuj rychlost -- hráč nesmí zpomalovat nebo se úplně zastav, pokud jsme již na místě
	    if (player.lastTarget != undefined) {
		if (player.isAtTarget(player.lastTarget, mesh)) {
		    player.stop(player);
		} else {
		    pMesh.setLinearVelocity(player.lastSpeedVector);
		    player.state = GAME.Player.WALK;
		}
	    }

	    // přenes nastavení pozice a rotací na animační model
	    object3d.position.set(mesh.position.x, mesh.position.y - height / 2, pMesh.position.z);
	    object3d.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);

	    // console.log(player.mesh.getLinearVelocity());

	    // update pozice kamery
	    player.targetCamera(game.camera, player);
	});

	pMesh.addEventListener('collision', function(other_object, linear_velocity, angular_velocity) {
	    // pokud jsem se zarazil o stěnu apod. -- neplatí pro nepřátele a jiné speciální fyzikální objekty
	    if (other_object.tag == "obstacle") {
		// zastav se a ukoči navigaci
		player.stop(player);
	    }
	});

	player.targetCamera(game.camera, player);
    });

    game.cycleCallbacks.push(function(delta) {
	player.animate(delta, player)
    });

}

GAME.Player.STAND = 0;
GAME.Player.WALK = 1;
GAME.Player.HIT = 2;

GAME.Player.NEAR_TO_STOP = 3;

GAME.Player.prototype = {

    constructor : GAME.Player,
    state : GAME.Player.STAND,
    oldState : undefined,
    height : undefined,
    game : undefined,
    boundingBox : undefined,

    lastSpeedVector : new THREE.Vector3(0, 0, 0),
    lastTarget : undefined,

    isAtTarget : function(target, pMesh) {
	// jo, jsme na místě -- nemám totiž kam navigovat
	if (target == undefined)
	    return true;

	var a = target.z - pMesh.position.z;
	var b = target.x - pMesh.position.x;
	var distance = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
	// console.log("Distance to target: " + distance);
	return distance <= GAME.Player.NEAR_TO_STOP;
    },

    stop : function(player) {
	var pMesh = player.mesh;
	var velocity = pMesh.getLinearVelocity();
	velocity.x = 0;
	velocity.z = 0;
	pMesh.setLinearVelocity(velocity);
	player.lastTarget = undefined;
	player.state = GAME.Player.STAND;
    },

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
	var position = p.mesh.position;
	var target = new THREE.Vector3(targetX, position.y, targetZ);
	p.lastTarget = target;

	var speed = 70; // "diagonálních" jednotek za sekundu
	var a = target.z - position.z;
	var b = target.x - position.x;
	var distance = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
	var zSpeed = (a / distance) * speed; // rychlost na odvěsně a (osa z)
	var xSpeed = (b / distance) * speed; // rychlost na odvěsně b (osa x)

	// musí se udělat clone(), jinak při zastavení reference v p.lastSpeedVector také vynuluje a údaje se ztratí
	var currentSpeedVector = p.mesh.getLinearVelocity().clone();
	currentSpeedVector.x = xSpeed;
	currentSpeedVector.z = zSpeed;
	p.lastSpeedVector = currentSpeedVector;
	p.mesh.setLinearVelocity(p.lastSpeedVector);

	// protáhní stávající cíl jinak se nakonci bude postava koukat jiným směrem
	// (počátek se otočí kolem cílového bodu a pohled se "sveze" jiným směrem)
	// musím zachovat poměr jinak změním směr, takže jednu dám jako 100 a druhou
	// jako 100 * poměr jejich původních délek
	var lookTargetZ = target.z + (a > 0 ? 100 : -100);
	var lookTargetX = target.x + (b > 0 ? 100 : -100) * Math.abs(b / a);
	var lookAtVector = new THREE.Vector3(lookTargetX, position.y, lookTargetZ);
	p.mesh.lookAt(lookAtVector);
	p.mesh.__dirtyRotation = true; // rotace se měnila manuálně

    },
}
