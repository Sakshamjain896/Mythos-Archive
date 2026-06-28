import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useCursor, Center } from '@react-three/drei';
import * as THREE from 'three';

export default function PharaohMask({ position, scale = 1.1, onSelect }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/12e078ca-a932-47df-ba3b-8db9f63b6bc6/base_basic_pbr.glb');
  const [hovered, setHovered] = useState(false);

  // Set the hand cursor on hover for a better UX
  useCursor(hovered);

  // Ensure the mask interacts beautifully with the lighting
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Continuous buttery smooth 360 rotation
      groupRef.current.rotation.y += 0.005;

      // Subtle hovering animation on the Y axis
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;

      // Premium scale lerp for interactive feedback
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

// Preload the model for instant viewing
useGLTF.preload('/models/12e078ca-a932-47df-ba3b-8db9f63b6bc6/base_basic_pbr.glb');
