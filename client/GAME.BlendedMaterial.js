var GAME = GAME || {} ;
GAME.BlendedMaterial = function(direction, texInner, texOuter, expX, expY) {

    function get_string_from_URL(url) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, false);
	xmlhttp.send();
	return xmlhttp.responseText;
    }

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
	vertexShader : get_string_from_URL("GAME.BlendedMaterial.vertex.shader"),
	fragmentShader : get_string_from_URL("GAME.BlendedMaterial.fragment.shader"),
	transparent : true
    });
}