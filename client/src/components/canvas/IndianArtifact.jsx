import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useTexture, useCursor, Center } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';

export default function IndianArtifact({ position, scale = 1, onSelect }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Load the OBJ model
  const obj = useLoader(OBJLoader, '/models/3029d3ce-5872-4d55-8be0-0b621e3108f6/base.obj');

  // Load PBR Textures
  const textures = useTexture({
    map: '/models/3029d3ce-5872-4d55-8be0-0b621e3108f6/texture_diffuse.png',
    normalMap: '/models/3029d3ce-5872-4d55-8be0-0b621e3108f6/texture_normal.png',
    roughnessMap: '/models/3029d3ce-5872-4d55-8be0-0b621e3108f6/texture_roughness.png',
    metalnessMap: '/models/3029d3ce-5872-4d55-8be0-0b621e3108f6/texture_metallic.png',
  });

  // Apply textures and shadows to all children
  useMemo(() => {
    obj.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshPhysicalMaterial({
          map: textures.map,
          normalMap: textures.normalMap,
          roughnessMap: textures.roughnessMap,
          metalnessMap: textures.metalnessMap,
          metalness: 1.0,
          roughness: 0.2,
          envMapIntensity: 1,
        });
      }
    });
  }, [obj, textures]);

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
        <primitive object={obj} scale={1.5} /> {/* Increased scale to 1.5 to match Pharaoh mask */}
      </Center>

    </group>
  );
}
