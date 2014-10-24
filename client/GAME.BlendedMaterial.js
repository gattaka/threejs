var GAME = {} || GAME;
GAME.BlendedMaterial = function(direction, tex1, tex2, expX, expY) {
    return new THREE.ShaderMaterial({
	uniforms : { // custom uniforms (your textures)
	    tLeft : {
		type : "t",
		value : tex1
	    },
	    tRight : {
		type : "t",
		value : tex2
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
	vertexShader : $('#vertexshader').text(),
	fragmentShader : $('#fragmentshader').text(),
	transparent : true
    });
}