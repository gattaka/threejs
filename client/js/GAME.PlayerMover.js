/**
 * GAME.PlayerMover -- prpojuje události myši, zjišťování cílového polohy z terénu/prostředí a volání navigace hráče na
 * tuto polohu -- odděluje tak GAME.Player od GAME.Game a cílového povrchu
 */
var GAME = GAME || {};

GAME.PlayerMover = function(game) {
    var playerMover = this;

    var updatePosition = function(event) {
	playerMover.mouseLastPostion.x = (event.clientX / window.innerWidth) * 2 - 1;
	playerMover.mouseLastPostion.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    document.addEventListener('mousedown', function(event) {
	playerMover.mouseDown = true;
	updatePosition(event);
    }, false);
    document.addEventListener('mouseup', function(event) {
	playerMover.mouseDown = false;
	updatePosition(event);
    }, false);
    document.addEventListener('mousemove', function(event) {
	updatePosition(event);
    }, false);

    game.cycleCallbacks.push(function() {
	playerMover.navigatePlayer(game, playerMover)
    });
}

GAME.PlayerMover.prototype = {

    constructor : GAME.PlayerMover,
    projector : new THREE.Projector(),

    /**
     * Je zmáčknuté tlačtíko myši?
     */
    mouseDown : false,
    /**
     * Kde naposledy byla myš?
     */
    mouseLastPostion : {
	x : 0,
	y : 0
    },
    /**
     * Kdy jsme naposledy navigovali?
     */
    lastTimeOfNavigation : 0,
    /**
     * Za jak dlouho nejdříve lze provést další navigaci?
     */
    minDelayFromLastNavigation : 0.1, // 100ms

    navigatePlayer : function(game, mover) {
	var p = game.player;
	// pokud ještě neexistuje objekt hráče nebo není zmáčknutý myš nemá cenu provádět navigaci
	if (p.mesh == undefined || mover.mouseDown == false)
	    return;

	// každých Xms beru pohyb myši jako novou polohu kam s hráčem jít
	// toto je potřeba pro případ, kdy se naviguje pomocí mouseDown -- bez časového filtrování by se hra značně
	// zpomalila, protože by požadavky na novou navigaci byly "chrleny" prakticky s rychlostí FPS
	var currentTime = game.clock.elapsedTime;
	if (currentTime - mover.lastTimeOfNavigation < mover.minDelayFromLastNavigation)
	    return;
	// prošlo, updatuj poslední čas navigace
	mover.lastTimeOfNavigation = currentTime;

	// create a Ray with origin at the mouse position
	// and direction into the scene (camera direction)
	var vector = new THREE.Vector3(mover.mouseLastPostion.x, mover.mouseLastPostion.y, 1);
	mover.projector.unprojectVector(vector, game.camera);
	var ray = new THREE.Raycaster(game.camera.position, vector.sub(game.camera.position).normalize());

	// create an array containing all objects in the scene with which the ray intersects
	var intersects = ray.intersectObjects(game.level.getObjectsForNavigation());

	if (intersects.length == 0)
	    return;

	// Musí brát až poslední průnik, jinak se bude snažit lézt i na ty transparentní sloupy, které jsou zatím
	// součástí stejného meshe jako je povrch po kterém se naviguje -- TODO jak to udělat, aby se tedy nenavigovalo
	// do "děr" apod.? Na druhou stranu ... do díry hráč spadnou vlastně může
	var intersect = intersects[intersects.length - 1];
	var x = intersect.point.x;
	var z = intersect.point.z;

	game.player.navigatePlayer(game, x, z);

    }
}
