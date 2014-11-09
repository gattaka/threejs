var GAME = GAME || {};
GAME.HUD = {};
GAME.HUD = function(orthoScene) {
    this.createFrame(orthoScene);
    this.createSkull(orthoScene);
}

GAME.HUD.prototype = {

    constructor : GAME.HUD,

    createFrame : function(orthoScene) {
	var texture = THREE.ImageUtils.loadTexture('textures/frame.png');
	var material = new THREE.SpriteMaterial({
	    map : texture
	});
	var sprite = new THREE.Sprite(material);
	var fw = 198;
	var fh = 247;
	sprite.scale.set(fw, fh, 1.0);
	var sw = window.innerWidth;
	var sh = window.innerHeight;
	var offset = 20;
	sprite.position.set(sw / 2 - fw / 2 - offset, sh / 2 - fh / 2 - offset, 1.0);
	orthoScene.add(sprite);
    },

    createSkull : function(orthoScene) {
	var texture = THREE.ImageUtils.loadTexture('textures/skull.png');
	var material = new THREE.SpriteMaterial({
	    map : texture
	});
	var scale = 1;
	var fw = 44 * scale;
	var fh = 57 * scale;
	var sw = window.innerWidth;
	var sh = window.innerHeight;
	var offset = 20;
	var innerOffset = 10;
	for (var i = 0; i < 10; i++) {
	    var sprite = new THREE.Sprite(material);
	    sprite.scale.set(fw, fh, 1);
	    sprite.position.set(-sw / 2 + fw / 2 + offset + i * (innerOffset + fw), -sh / 2 + fh / 2 + offset, 1.0);
	    orthoScene.add(sprite);
	}
    }

}