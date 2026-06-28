import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useCursor, Center } from '@react-three/drei';
import * as THREE from 'three';

export default function RomanArtifact({ position, scale = 1, onSelect }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/7e7b0fd3-43ce-4a67-9bf0-b6dca66ad0dc (1)/base_basic_pbr.glb');
  const [hovered, setHovered] = useState(false);

  // Apply shadows to all meshes in the scene
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
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

    </group>
  );
}

// Preload the model for performance
useGLTF.preload('/models/7e7b0fd3-43ce-4a67-9bf0-b6dca66ad0dc (1)/base_basic_pbr.glb');
