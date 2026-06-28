import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCursor, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function ProceduralArtifact({ position, scale = 1, label, navigateTo }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Use hand cursor on hover
  useCursor(hovered);

  // Animate rotation and scaling
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Continuous slow rotation
      groupRef.current.rotation.y += 0.01;
      groupRef.current.rotation.z += 0.005;

      // Subtle floating movement
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;

      // Smooth scaling on hover
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
      onClick={() => { if (navigateTo) window.location.href = navigateTo; }}
    >
      {/* Premium Dark Marble Outer Shell */}
      <mesh castShadow receiveShadow>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#111111"
          roughness={0.1}
          metalness={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          reflectivity={1}
          envMapIntensity={2}
        />
      </mesh>

      {/* Glowing Gold Wireframe Core */}
      <mesh scale={[0.98, 0.98, 0.98]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#d4af37"
          wireframe={true}
          emissive="#d4af37"
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Floating HTML Label */}
      {label && (
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
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}
