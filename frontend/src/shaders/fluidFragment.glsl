// Fluid Dynamics Fragment Shader
precision highp float;

varying vec2 vUv;
varying float vTime;

uniform float uTime;
uniform float uMouseX;
uniform float uMouseY;
uniform float uIntensity;

// Pseudo-random function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Smooth noise function
float smoothNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fractal Brownian Motion
float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float maxValue = 0.0;
  
  for(int i = 0; i < 5; i++) {
    value += amplitude * smoothNoise(st * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return value / maxValue;
}

void main() {
  vec2 uv = vUv;
  
  // Add movement based on time
  uv += vec2(sin(uTime * 0.3) * 0.1, cos(uTime * 0.2) * 0.1);
  
  // Mouse influence
  vec2 mousePos = vec2(uMouseX, uMouseY);
  uv += (mousePos - 0.5) * 0.2;
  
  // Create flowing pattern
  float n = fbm(uv * 3.0 + uTime * 0.5);
  float n2 = fbm(uv * 2.0 - uTime * 0.3);
  float n3 = smoothNoise(uv * 4.0 + uTime * 0.2);
  
  // Combine noise patterns
  float pattern = n * 0.5 + n2 * 0.3 + n3 * 0.2;
  
  // Create flowing color
  vec3 colorA = vec3(0.0, 0.74, 0.93); // Cyan
  vec3 colorB = vec3(0.55, 0.36, 0.96); // Purple
  vec3 colorC = vec3(0.2, 0.2, 0.4); // Dark blue
  
  // Mix colors based on pattern
  vec3 color = mix(colorA, colorB, sin(pattern * 3.14159 + uTime * 0.5) * 0.5 + 0.5);
  color = mix(color, colorC, n3);
  
  // Add brightness variation
  float brightness = 0.4 + pattern * 0.6;
  color *= brightness * uIntensity;
  
  // Add edge detection for fluid effect
  float edgePattern = length(vec2(
    dFdx(pattern),
    dFdy(pattern)
  )) * 2.0;
  
  color += edgePattern * vec3(0.1, 0.2, 0.3) * uIntensity;
  
  gl_FragColor = vec4(color, 0.8);
}
