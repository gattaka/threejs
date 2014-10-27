var GAME = GAME || {};
GAME.HUD = {};
GAME.HUD = function(orthoScene) {

    var frame = this.createFrame();
    orthoScene.add(frame);

}

GAME.HUD.prototype = {

    constructor : GAME.HUD,

    createFrame : function() {
	var texture = THREE.ImageUtils.loadTexture('textures/frame.png');
	var material = new THREE.SpriteMaterial({
	    map : texture
	});
	var frameSprite = new THREE.Sprite(material);
	var fw = 198;
	var fh = 247;
	frameSprite.scale.set(fw, fh, 1.0);
	var sw = window.innerWidth;
	var sh = window.innerHeight;
	var offset = 20;
	frameSprite.position.set(sw / 2 - fw / 2 - offset, sh / 2 - fh / 2 - offset, 1.0);
	return frameSprite;
    }

}