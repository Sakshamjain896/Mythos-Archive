import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useCursor, Html, Center } from '@react-three/drei';
import * as THREE from 'three';

export default function GreekArtifact({ position, scale = 1, onSelect }) {
  const groupRef = useRef();
  
  // NOTE TO USER: Update this path once the Greek model is uploaded
  const { scene } = useGLTF('/models/greek.glb');
  
  const [hovered, setHovered] = useState(false);

  // Apply Polished White Marble Material
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshPhysicalMaterial({
          color: '#f0f0f0',
          roughness: 0.3,
          metalness: 0.05,
          clearcoat: 0.5,
          clearcoatRoughness: 0.1
        });
      }
    });
  }, [scene]);

  useCursor(hovered);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Continuous buttery smooth 360 rotation
      groupRef.current.rotation.y += 0.005;
      
      // Subtle hovering animation on the Y axis
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;

      // Interaction Scale Lerp
      const targetScale = hovered ? scale * 1.1 : scale;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 5 * delta);
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect();
      }}
    >
      <Center bottom>
        <primitive object={scene} />
      </Center>

      {/* Spatial UI Label */}
      <Html center position={[0, 1.8, 0]}>
        <div style={{
          opacity: hovered ? 1 : 0,
          transform: `translateY(${hovered ? '0' : '10px'})`,
          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          fontFamily: '"Cinzel Decorative", serif',
          color: '#d4af37',
          fontSize: '1rem',
          letterSpacing: '0.15em',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          textShadow: '0 4px 12px rgba(0,0,0,0.8)',
          textAlign: 'center'
        }}>
          GREEK MYTHOLOGY
        </div>
      </Html>
    </group>
  );
}

// useGLTF.preload('/models/greek.glb');
