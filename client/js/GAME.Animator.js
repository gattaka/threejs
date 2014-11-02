var GAME = GAME || {};

GAME.Animator = function() {
};

GAME.Animator.prototype = {
    constructor : GAME.Animator,
    listeners : [],

    animate : function(delta) {
	for ( var listener in listeners) {
	    listener.animate(delta);
	}
    }
};
