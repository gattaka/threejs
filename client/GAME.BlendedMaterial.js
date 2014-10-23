var GAME = {} || GAME;
GAME.BlendedMaterial = function(direction, tex1, tex2) {
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
	    }
	},
	vertexShader : "varying vec2 vUv; void main() {	vUv = uv; gl_Position = projectionMatrix * modelViewMatrix* vec4( position, 1.0 );}",
	fragmentShader : "uniform sampler2D tLeft;" + "uniform sampler2D tRight;" + "uniform int direction;" + "varying vec2 vUv;" + "void main(void) {" + "vec3 c;" + "vec4 Cb = texture2D(tLeft, vUv);" + "vec4 Ca = texture2D(tRight, vUv);"
		+ "float t = (vUv.x + vUv.y) / 2.0; " + "float tt = (vUv.x + (1.0 - vUv.y)) / 2.0; " + "if (direction == 1) {" + "	gl_FragColor = vUv.x * Ca + (1.0 - vUv.x) * Cb;" + "} else if (direction == 2) {"
		+ "gl_FragColor = tt * Cb + (1.0 - tt) * Ca;" + "} else if (direction == 3) {" + "gl_FragColor = vUv.y * Ca + (1.0 - vUv.y) * Cb;" + "} else if (direction == 4) {" + "gl_FragColor = t * Ca + (1.0 - t) * Cb;"
		+ "} else if (direction == 5) {" + "gl_FragColor = vUv.x * Cb + (1.0 - vUv.x) * Ca;" + "} else if (direction == 6) {" + "gl_FragColor = tt * Ca + (1.0 - tt) * Cb;" + "} else if (direction == 7) {"
		+ "gl_FragColor = vUv.y * Cb + (1.0 - vUv.y) * Ca;" + "} else if (direction == 8) {" + "gl_FragColor = t * Cb + (1.0 - t) * Ca;" + "} else {" + "gl_FragColor = vec4(1.0,0.0,1.0,1.0);" + "}" + "}",
	transparent : true
    });
}