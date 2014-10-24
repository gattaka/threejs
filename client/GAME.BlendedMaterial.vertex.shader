varying vec2 pos;
 
void main()
{
	pos = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}