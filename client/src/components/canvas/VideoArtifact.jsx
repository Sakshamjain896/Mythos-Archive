import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVideoTexture, Billboard, Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';

export default function VideoArtifact({ videoSrc, position, scale = 1, label, navigateTo }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Load video texture
  const texture = useVideoTexture(videoSrc, {
    loop: true,
    muted: true,
    autoplay: true,
    crossOrigin: 'Anonymous'
  });

  // Cursor interaction
  useCursor(hovered);

  // Hover scale animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetScale = hovered ? scale * 1.1 : scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 5 * delta);
    }
  });

  return (
    <group position={position}>
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <mesh
          ref={meshRef}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
          onPointerOut={() => setHovered(false)}
          onClick={() => { if (navigateTo) window.location.href = navigateTo; }}
        >
          <planeGeometry args={[1.6, 1]} />
          <meshBasicMaterial map={texture} toneMapped={false} transparent opacity={1} side={THREE.DoubleSide} />
        </mesh>

        {/* Floating Label */}
        {label && (
          <Html center position={[0, 0.8, 0]}>
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
              textShadow: '0 4px 12px rgba(0,0,0,0.8)'
            }}>
              {label}
            </div>
          </Html>
        )}
      </Billboard>
    </group>
  );
}
