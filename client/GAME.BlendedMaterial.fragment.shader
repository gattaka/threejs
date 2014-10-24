uniform sampler2D tLeft;
uniform sampler2D tRight;
 
uniform int direction;
uniform float expanse_x;
uniform float expanse_y;
 
varying vec2 pos;
 
void main(void)
{

	float prec = 100.0;
	float limit = 1.0; // UV je 0..1
	float x1 = mod(pos.x * prec * expanse_x, limit * prec) / prec;
	float y1 = mod(pos.y * prec * expanse_y, limit * prec) / prec;
    vec2 pnt = vec2(x1,y1);
    vec4 Cb = texture2D(tLeft, pnt);
    vec4 Ca = texture2D(tRight, pnt);
 
	float t = (pnt.x + pnt.y) / 2.0; 
	float tt = (pnt.x + (1.0 - pnt.y)) / 2.0; 
 
	// Left Right Top Bottom
	if (direction == 0) {
		// LR pøechod
		gl_FragColor = pnt.x * Cb + (1.0 - pnt.x) * Ca;
	} else if (direction == 1) {
		// LT-BR pøechod	
		gl_FragColor = tt * Cb + (1.0 - tt) * Ca;
	} else if (direction == 2) {
		// TB pøechod
		gl_FragColor = pnt.y * Ca + (1.0 - pnt.y) * Cb;
	} else if (direction == 3) {
		// TR-LB pøechod	
		gl_FragColor = t * Ca + (1.0 - t) * Cb;
	} else if (direction == 4) { 
		// RL pøechod
		gl_FragColor = pnt.x * Ca + (1.0 - pnt.x) * Cb;		
	} else if (direction == 5) {
		// BR-LT pøechod	
		gl_FragColor = tt * Ca + (1.0 - tt) * Cb;
	} else if (direction == 6) {
		// BT pøechod
		gl_FragColor = pnt.y * Cb + (1.0 - pnt.y) * Ca;
	} else if (direction == 7) {
		// LB-TR pøechod	
		gl_FragColor = t * Cb + (1.0 - t) * Ca;
	} else {
		// undefined purple
		gl_FragColor = vec4(1.0,0.0,1.0,1.0);
	}
	
}