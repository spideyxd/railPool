// Fluid Dynamics Vertex Shader
varying vec2 vUv;
varying float vTime;

uniform float uTime;
uniform float uMouseX;
uniform float uMouseY;

void main() {
  vUv = uv;
  vTime = uTime;
  
  vec3 pos = position;
  
  // Add wave distortion based on time
  pos.y += sin(pos.x * 3.0 + uTime * 0.5) * 0.1;
  pos.x += cos(pos.y * 3.0 + uTime * 0.3) * 0.1;
  
  // Mouse interaction
  float mouseInfluence = 0.3;
  pos.x += sin(uMouseX * 10.0 + uTime) * mouseInfluence;
  pos.y += cos(uMouseY * 10.0 + uTime) * mouseInfluence;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
