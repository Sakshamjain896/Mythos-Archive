import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useCursor, Center } from '@react-three/drei';
import * as THREE from 'three';

export default function MayanArtifact({ position, scale = 1, onSelect }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Load the new Mayan GLB model
  const { scene } = useGLTF('/models/6bdfac52-bf6b-4bd6-84ba-993e3972b16f/base_basic_pbr.glb');

  // Re-apply original textures and ensure material reacts to lighting
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Keep the original texture map if it exists in the GLB
        const originalMap = child.material.map;

        // Create a new material that reacts to scene lighting
        child.material = new THREE.MeshStandardMaterial({
          map: originalMap,
          roughness: 0.8, // Textured stone aesthetic
          metalness: 0.1,
          color: originalMap ? 0xffffff : '#5c6356' // Fallback to Mayan stone color if no map
        });

        child.material.needsUpdate = true;
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

// Preload for performance
useGLTF.preload('/models/6bdfac52-bf6b-4bd6-84ba-993e3972b16f/base_basic_pbr.glb');
