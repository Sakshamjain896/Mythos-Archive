import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import {useSpring } from 'framer-motion';
import * as THREE from 'three';
import { AtmosphereShader } from '../lib/AtmosphereShader';

const BackgroundAtmosphere = ({ themeColor = '#4a2c00', noiseScale = 1.5, speed = 0.1 }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const { viewport, mouse } = useThree();
  
  // Smooth mouse springs for parallax
  const springX = useSpring(0, { stiffness: 50, damping: 20 });
  const springY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value = new THREE.Color(themeColor);
      materialRef.current.uniforms.uNoiseScale.value = noiseScale;
      materialRef.current.uniforms.uSpeed.value = speed;
    }
  }, [themeColor, noiseScale, speed]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Animate opacity for cinematic reveal
      if (materialRef.current.uniforms.uOpacity.value < 0.6) {
        materialRef.current.uniforms.uOpacity.value += 0.005;
      }

      // Parallax updates
      springX.set(mouse.x);
      springY.set(mouse.y);
      materialRef.current.uniforms.uMouse.value.set(springX.get() * 0.05, springY.get() * 0.05);
    }
  });

  return (
    <group position={[0, 0, -10]}>
      {/* Volumetric Fog Plane */}
      <mesh ref={meshRef} scale={[viewport.width * 2, viewport.height * 2, 1]}>
        <planeGeometry />
        <shaderMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          {...AtmosphereShader}
        />
      </mesh>

      {/* Motes of History Particles */}
      <Sparkles
        count={150}
        scale={20}
        size={2}
        speed={0.1}
        color={themeColor}
        opacity={0.4}
      />
      
      {/* Central God Ray Glow */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[15, 15]} />
        <meshBasicMaterial
          color={themeColor}
          transparent
          opacity={0.05}
          map={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/lensflare/lensflare0.png')}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default BackgroundAtmosphere;
