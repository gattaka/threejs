var GAME = {} || GAME;
GAME.BlendedMaterial = function(direction, tex1, tex2, expX, expY) {

    function get_string_from_URL(url) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, false);
	xmlhttp.send();
	return xmlhttp.responseText;
    }

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
	vertexShader : get_string_from_URL("GAME.BlendedMaterial.vertex.shader"),
	fragmentShader : get_string_from_URL("GAME.BlendedMaterial.fragment.shader"),
	transparent : true
    });
}