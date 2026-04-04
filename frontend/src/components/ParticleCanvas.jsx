import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const particleVertexShader = `
  uniform float uTime;
  uniform float uScale;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // Create particle movement
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Size attenuation
    gl_PointSize = uScale * (300.0 / length(mvPosition.xyz));
    
    // Color based on position
    vColor = color;
    vAlpha = 0.8;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  uniform sampler2D texture1;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
    gl_FragColor *= texture2D(texture1, gl_PointCoord);
  }
`;

const ParticleSystem = ({ count = 1000, colors = ['#0ea5e9', '#8b5cf6'] }) => {
  const pointsRef = useRef(null);

  useEffect(() => {
    if (!pointsRef.current) return;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors_array = new Float32Array(count * 3);

    // Create color array from hex strings
    const colorObjs = colors.map((hex) => {
      const c = new THREE.Color(hex);
      return c;
    });

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const color = colorObjs[i % colorObjs.length];
      colors_array[i * 3] = color.r;
      colors_array[i * 3 + 1] = color.g;
      colors_array[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors_array, 3));

    pointsRef.current.geometry = geometry;
  }, [count, colors]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x += 0.0001;
      pointsRef.current.rotation.y += 0.0002;

      const positions = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.01;
        positions[i + 1] += Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.01;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <pointsMaterial
        sizeAttenuation
        size={0.1}
        sizeRange={[0.1, 100]}
        transparent
        opacity={0.6}
        vertexColors
      />
    </points>
  );
};

const ParticleCanvas = ({ className = '', colors }) => {
  return (
    <div className={`${className} absolute inset-0 pointer-events-none`}>
      <Canvas
        camera={{ position: [0, 0, 5] }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <ParticleSystem colors={colors} count={500} />
      </Canvas>
    </div>
  );
};

export default ParticleCanvas;
