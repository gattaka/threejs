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
 
	float t1 = sqrt(pow((1.0-pnt.x),2.0) + pow(pnt.y,2.0)) * 2.0 - 0.5; 
	float t2 = sqrt(pow(pnt.x,2.0) + pow(pnt.y,2.0)) * 2.0 - 0.5; 
	float t3 = sqrt(pow(pnt.x,2.0) + pow(1.0-pnt.y,2.0)) * 2.0 - 0.5; 
	float t4 = sqrt(pow((1.0-pnt.x),2.0) + pow(1.0-pnt.y,2.0)) * 2.0 - 0.5; 
	
	t1 = t1 < 0.0 ? 0.0 : t1;
	t1 = t1 > 1.0 ? 1.0 : t1;
	
	t2 = t2 < 0.0 ? 0.0 : t2;
	t2 = t2 > 1.0 ? 1.0 : t2; 
	
	t3 = t3 < 0.0 ? 0.0 : t3;
	t3 = t3 > 1.0 ? 1.0 : t3; 
	
	t4 = t4 < 0.0 ? 0.0 : t4;
	t4 = t4 > 1.0 ? 1.0 : t4; 
 
	// Left Right Top Bottom
	if (direction == 0) {
		// LR pøechod
		gl_FragColor = pnt.x * Cb + (1.0 - pnt.x) * Ca;
	} else if (direction == 1) {
		// LT-BR pøechod	
		gl_FragColor = t1 * Ca + (1.0 - t1) * Cb;
	} else if (direction == 2) {
		// TB pøechod
		gl_FragColor = pnt.y * Ca + (1.0 - pnt.y) * Cb;
	} else if (direction == 3) {
		// TR-LB pøechod	
		gl_FragColor = t2 * Ca + (1.0 - t2) * Cb;
	} else if (direction == 4) { 
		// RL pøechod
		gl_FragColor = pnt.x * Ca + (1.0 - pnt.x) * Cb;		
	} else if (direction == 5) {
		// BR-LT pøechod	
		gl_FragColor = t3 * Ca + (1.0 - t3) * Cb;
	} else if (direction == 6) {
		// BT pøechod
		gl_FragColor = pnt.y * Cb + (1.0 - pnt.y) * Ca;
	} else if (direction == 7) {
		// LB-TR pøechod	
		gl_FragColor = t4 * Ca + (1.0 - t4) * Cb;
	} else {
		// undefined purple
		gl_FragColor = vec4(1.0,0.0,1.0,1.0);
	}
	
}