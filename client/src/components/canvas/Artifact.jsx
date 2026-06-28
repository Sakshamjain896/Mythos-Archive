import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center, useCursor, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function Artifact({ url, scale = 1, position = [0, 0, 0], navigateTo, label }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Changes cursor to pointer on hover
  useCursor(hovered);

  // Ensure every mesh within the model casts and receives shadows
  useMemo(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.envMapIntensity = 1.5;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [scene]);

  // Floating animation & Hover scale physics
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Very slow continuous rotation on the Y-axis
      groupRef.current.rotation.y += 0.002;
      
      // Floating sine wave
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      
      // Hover physics: smoothly scale up by 10% when hovered
      const targetScale = hovered ? 1.1 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 5 * delta);
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={() => { if (navigateTo) window.location.href = navigateTo; }}
    >
      {/* Center aligns the model's origin to its bounding box bottom */}
      <Center bottom>
        <primitive object={scene} scale={scale} />
      </Center>

      {/* The Floating Label overlay */}
      {label && (
        <Html center position={[0, 2.5, 0]}>
          <div style={{
            opacity: hovered ? 1 : 0,
            transform: `translateY(${hovered ? '0' : '10px'})`,
            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            fontFamily: '"Cinzel Decorative", serif',
            color: '#d4af37',
            fontSize: '1.2rem',
            letterSpacing: '0.15em',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            textShadow: '0 4px 12px rgba(0,0,0,0.8)'
          }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// Preload the models if the URLs are known and static
// useGLTF.preload('/models/artifact1.glb');
// useGLTF.preload('/models/artifact2.glb');
// useGLTF.preload('/models/artifact3.glb');
