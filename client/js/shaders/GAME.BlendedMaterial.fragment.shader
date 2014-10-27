uniform sampler2D tInner;
uniform sampler2D tOuter;
 
uniform int direction;
uniform float expanse_x;
uniform float expanse_y;
 
varying vec2 pos;
 
// o�ez�n� hodnoty >1.0 a <0.0 by zp�sobily, 
// �e by se barvy textur m�chaly i mimo rozsah RGBA hodnot  
float cutBlend(float f) {
	f = f < 0.0 ? 0.0 : f;
	return f > 1.0 ? 1.0 : f;
}
 
void main(void)
{

	// p�ev�d� do cel�ch ��sel, aby �lo pou��t modulo
	float prec = 100.0;
	float limit = 1.0; // UV je 0..1
	
	// p�evod na v�cen�sobn� opakov�n� textury
	float x1 = mod(pos.x * prec * expanse_x, limit * prec) / prec;
	float y1 = mod(pos.y * prec * expanse_y, limit * prec) / prec;
    vec2 pnt = vec2(x1,y1);
    vec4 pI = texture2D(tInner, pnt);
    vec4 pO = texture2D(tOuter, pnt);
 
 	// jak ostr� m� b�t p�echod (default = 1.0)
 	float blendingSpeed = 6.0;

 	// norm�ln� je p�echod dlouh� 1.0, s blendingSpeed = 4.0
 	// bude dlouh� 0.25, polovinu z toho je pot�eba posunout, 
 	// aby byl p�echod v p�lce plochy, jinak o�ez�n�m za�ne
 	// v p�lce teprve p�echod r�st -- uv�d�no pro sm�r ze st�edu
 	float blendingCenter = 0.5; 
 	float blendingOffset = blendingCenter - (1.0 / blendingSpeed) / 2.0;
 	float blendingReversedOffset = (1.0 - blendingCenter) - (1.0 / blendingSpeed) / 2.0;
 
 	// diagon�ln� p�echody, kv�li roh�m -- zakulacen� je provedeno pomoc� p�epony
	float t1 = cutBlend((sqrt(pow((1.0-pnt.x),2.0) + pow(pnt.y,2.0)) - blendingOffset) * blendingSpeed); 
	float t2 = cutBlend((sqrt(pow(pnt.x,2.0) + pow(pnt.y,2.0)) - blendingOffset) * blendingSpeed); 
	float t3 = cutBlend((sqrt(pow(pnt.x,2.0) + pow(1.0-pnt.y,2.0)) - blendingOffset) * blendingSpeed); 
	float t4 = cutBlend((sqrt(pow((1.0-pnt.x),2.0) + pow(1.0-pnt.y,2.0)) - blendingOffset) * blendingSpeed); 
	
	// horizont�ln� a vertik�ln� p�echody -- u sm�r� n1 a n2 tedy LR a TB
	// jsou offsety oto�eny proto�e m��� ze st�edu do z�porn� ��sti sou�adnic
	float n1 = cutBlend((pnt.x - blendingReversedOffset) * blendingSpeed);
 	float n2 = cutBlend((pnt.y - blendingOffset) * blendingSpeed);
 	float n3 = cutBlend((pnt.x - blendingOffset) * blendingSpeed);
 	float n4 = cutBlend((pnt.y - blendingReversedOffset) * blendingSpeed);  
 
 	// 1 2 3
 	// 0 * 4   
 	// 7 6 5
 
	if (direction == 0) {
		gl_FragColor = (1.0 - n1) * pO + n1 * pI;
	} else if (direction == 1) {
		gl_FragColor = t1 * pO + (1.0 - t1) * pI;
	} else if (direction == 2) {
		gl_FragColor = n2 * pO + (1.0 - n2) * pI;
	} else if (direction == 3) {
		gl_FragColor = t2 * pO + (1.0 - t2) * pI;
	} else if (direction == 4) { 
		gl_FragColor = n3 * pO + (1.0 - n3) * pI;		
	} else if (direction == 5) {
		gl_FragColor = t3 * pO + (1.0 - t3) * pI;
	} else if (direction == 6) {
		gl_FragColor = n4 * pI + (1.0 - n4) * pO;
	} else if (direction == 7) {
		gl_FragColor = t4 * pO + (1.0 - t4) * pI;
	} else {
		// chyba v zad�n� -- nedefinovan� sm�r, 
		// signalizuj fialovou barvou
		gl_FragColor = vec4(1.0,0.0,1.0,1.0);
	}
	
}