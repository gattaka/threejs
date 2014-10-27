var GAME = GAME || {} ;
GAME.BlendedMaterial = function(direction, texInner, texOuter, expX, expY) {

    return new THREE.ShaderMaterial({
	uniforms : { // custom uniforms (your textures)
	    tInner : {
		type : "t",
		value : texInner
	    },
	    tOuter: {
		type : "t",
		value : texOuter
	    },
	    direction : {
		type : "i",
		value : direction
	    },
	    expanse_x : {
		type : "f",
		value : expX
	    },
	    expanse_y : {
		type : "f",
		value : expY
	    }
	},
	vertexShader : GAME.Utils.loadString("js/shaders/GAME.BlendedMaterial.vertex.shader"),
	fragmentShader : GAME.Utils.loadString("js/shaders/GAME.BlendedMaterial.fragment.shader"),
	transparent : true
    });
}