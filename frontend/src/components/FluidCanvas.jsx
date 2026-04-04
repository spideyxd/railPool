import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Shader code
const fluidVertexShader = `
  varying vec2 vUv;
  
  uniform float uTime;
  uniform float uMouseX;
  uniform float uMouseY;
  
  void main() {
    vUv = uv;
    
    vec3 pos = position;
    pos.y += sin(pos.x * 3.0 + uTime * 0.5) * 0.15;
    pos.x += cos(pos.y * 3.0 + uTime * 0.3) * 0.15;
    pos.z += sin(uTime * 0.2) * 0.05;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fluidFragmentShader = `
  #ifdef GL_ES
  precision highp float;
  #endif
  
  varying vec2 vUv;
  
  uniform float uTime;
  uniform float uMouseX;
  uniform float uMouseY;
  uniform float uIntensity;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  float smoothstep(float a, float b, float t) {
    t = clamp((t - a) / (b - a), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float maxValue = 0.0;
    
    for(int i = 0; i < 4; i++) {
      value += amplitude * noise(st * frequency + uTime * 0.3 * float(i + 1));
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
    
    // Add mouse influence
    vec2 mouse = vec2(uMouseX, uMouseY);
    uv += (mouse - 0.5) * 0.15;
    
    // Generate patterns
    float n = fbm(uv * 2.5 + uTime * 0.2);
    float n2 = fbm(uv * 1.5 - uTime * 0.15);
    float n3 = noise(uv * 3.5 + uTime * 0.1);
    
    float pattern = n * 0.6 + n2 * 0.3 + n3 * 0.1;
    
    // Define colors
    vec3 colorA = vec3(0.0, 0.75, 0.93);      // Cyan
    vec3 colorB = vec3(0.6, 0.3, 0.95);       // Purple
    vec3 colorC = vec3(0.2, 0.1, 0.35);       // Dark Purple
    
    // Mix colors based on pattern
    vec3 color = mix(colorA, colorB, sin(pattern * 6.28 + uTime * 0.5) * 0.5 + 0.5);
    color = mix(color, colorC, n3 * 0.4);
    
    // Brightness modulation
    float brightness = 0.5 + pattern * 0.7;
    color *= brightness * max(uIntensity, 0.1);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const FluidMesh = ({ mouseX, mouseY, intensity = 1.0 }) => {
  const materialRef = useRef(null);

  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.common,
    {
      uTime: { value: 0 },
      uMouseX: { value: 0.5 },
      uMouseY: { value: 0.5 },
      uIntensity: { value: intensity },
    },
  ]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uIntensity.value = intensity;
    }
  }, [intensity]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
      materialRef.current.uniforms.uMouseX.value = mouseX;
      materialRef.current.uniforms.uMouseY.value = mouseY;
    }
  });

  return (
    <mesh position={[0, 0, 0]} scale={[1, 1, 1]}>
      <planeGeometry args={[2, 2, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={fluidVertexShader}
        fragmentShader={fluidFragmentShader}
        side={THREE.DoubleSide}
        wireframe={false}
      />
    </mesh>
  );
};

const FluidCanvas = ({ className = '', intensity = 0.8 }) => {
  const [mouseX, setMouseX] = useState(0.5);
  const [mouseY, setMouseY] = useState(0.5);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX / window.innerWidth);
      setMouseY(1 - e.clientY / window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Suspense fallback={null}>
        <Canvas
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          camera={{ position: [0, 0, 1], fov: 75, near: 0.1, far: 1000 }}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
          dpr={[1, 2]}
        >
          <FluidMesh mouseX={mouseX} mouseY={mouseY} intensity={intensity} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default FluidCanvas;
