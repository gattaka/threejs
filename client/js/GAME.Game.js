var GAME = GAME || {};
GAME.Game = function() {

    this.container = document.body;
    this.renderer = undefined;

    this.scene = new THREE.Scene();
    this.camera = undefined;

    this.sceneOrtho = new THREE.Scene();
    this.cameraOrtho = undefined;

    this.level = undefined;
    this.hud = undefined;

    this.keyboard = new THREEx.KeyboardState();
    this.clock = new THREE.Clock();
    this.controls = undefined;
    this.stats = undefined;

    this.animator = new GAME.Animator();

    this.player = undefined;

    this.initControls = function() {
	this.controls = new THREE.OrbitControls(this.camera, this.container);
    };

    this.createStats = function(container) {
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);
	return stats;
    };

    this.initScreenEvents = function() {
	THREEx.WindowResize(this.renderer, this.camera);
	THREEx.WindowResize(this.renderer, this.cameraOrtho);
	THREEx.FullScreen.bindKey({
	    charCode : 'm'.charCodeAt(0)
	});
    };

    // Animate the scene and call rendering.
    this.animateScene = function() {

	var game = this;

	// closure !
	var animate = function() {

	    var delay = game.clock.getDelta();

	    requestAnimationFrame(arguments.callee);
	    game.renderer.clear();
	    game.renderer.render(game.scene, game.camera);
	    game.renderer.clearDepth();
	    game.renderer.render(game.sceneOrtho, game.cameraOrtho);
	    THREE.AnimationHandler.update(delay);

	    game.controls.update();
	    game.stats.update();
	    game.hitCheck(game);
	    game.player.animate(delay);

	    TWEEN.update();
	};
	animate();
    };

    this.hitCheck = function(game) {
	// if (game.keyboard.pressed("w") == true) {
	// game.player.state = GAME.Player.WALK;
	// } else {
	// game.player.state = GAME.Player.STAND;
	// }
	// if (game.player.mesh)
	// this.level.plantObject(game.player.mesh);
    }

    this.createPlayer = function(scene) {
	var player = new GAME.Player(scene);
	this.player = player;
    }

    this.mouseControls = function(game) {
	var domEvents = new THREEx.DomEvents(game.camera, game.renderer.domElement)
	var p = game.player;
	domEvents.addEventListener(game.level.terrain.mesh, "click", function(event) {
	    if (p.mesh == undefined)
		return;
	    var position = {
		x : p.mesh.position.x,
		z : p.mesh.position.z
	    };
	    var target = {
		x : event.intersect.point.x,
		z : event.intersect.point.z
	    };

	    var speed = 0.3; // jednotek za sekundu
	    var a = target.z - position.z;
	    var b = target.x - position.x;
	    var distance = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

	    // protáhní stávající cíl jinak se nakonci bude postava koukat jiným směrem
	    // (počátek se otočí kolem cílového bodu a pohled se "sveze" jiným směrem)
	    // musím zachovat poměr jinak změním směr, takže jednu dám jako 100 a druhou
	    // jako 100 * poměr jejich původních délek
	    var lookTargetZ = target.z + (a > 0 ? 100 : -100);
	    var lookTargetX = target.x + (b > 0 ? 100 : -100) * Math.abs(b/a);

	    var line;
	    var tween = new TWEEN.Tween(position).to(target, distance / speed);
	    tween.onStart(function() {
		p.state = GAME.Player.WALK;
		var material = new THREE.LineBasicMaterial({
		    color : 0x0000ff
		});
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(position.x, 50, position.z));
		geometry.vertices.push(new THREE.Vector3(target.x, 50, target.z));
		line = new THREE.Line(geometry, material);
		game.scene.add(line);
	    });
	    tween.onUpdate(function() {
		// musí se přepisovat -- v případě, že je během chůze zadán nový cíl, může se stát, že jeho původní
		// onComplete nastaví předčasně p.state = GAME.Player.STAND; ačkoliv už se pokračuje v novém pochodu
		p.state = GAME.Player.WALK;
		p.mesh.position.x = position.x;
		p.mesh.position.z = position.z;
		game.level.plantObject(p.mesh);
		// počátek je u nohou, takže musí "koukat" na pozici přímo, kde stojí
		p.mesh.lookAt(new THREE.Vector3(lookTargetX, p.mesh.position.y, lookTargetZ));
	    });
	    tween.onComplete(function() {
		p.state = GAME.Player.STAND;
		game.scene.remove(line);
	    });
	    tween.start();
	}, false);
    }

    this.run = function() {
	if (Detector.webgl) {
	    this.renderer = new THREE.WebGLRenderer({
		antialias : true
	    });
	} else {
	    this.renderer = new THREE.CanvasRenderer();
	}

	// Set the background color of the renderer to black, with full opacity
	this.renderer.setClearColor(0x000000, 1);
	this.renderer.autoClear = false;
	this.renderer.shadowMapEnabled = true;
	// this.renderer.shadowMapType = THREE.PCFShadowMap;
	this.renderer.shadowMapType = THREE.PCFSoftShadowMap;

	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;

	this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	this.container.appendChild(this.renderer.domElement);

	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	this.scene.add(this.camera);
	// this.camera.position.set(50, 40, -80);
	this.camera.position.set(200, 300, 400);
	this.camera.lookAt(this.scene.position);

	this.cameraOrtho = new THREE.OrthographicCamera(-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
		-SCREEN_HEIGHT / 2, 1, 10);
	this.cameraOrtho.position.z = 10;

	this.level = new GAME.Level(this.scene);
	this.hud = new GAME.HUD(this.sceneOrtho);

	this.scene.add(new THREE.AxisHelper(100));
	this.createPlayer(this.scene);
	this.mouseControls(this);

	this.initScreenEvents();
	this.initControls();
	this.stats = this.createStats(this.container);

	this.scene.fog = new THREE.Fog(0x34583e, 0, 10000);

	this.animateScene();
    };
};