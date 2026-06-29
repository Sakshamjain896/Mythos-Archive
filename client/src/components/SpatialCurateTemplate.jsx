import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls, Center, ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigationStore } from '../store/navigationStore';
import { Compass, Music, VolumeX, MessageSquare } from 'lucide-react';

// --- ERA CONFIGURATIONS & THEMATIC AESTHETICS ---
const ERA_THEMES = {
  roman: {
    accent: '#d4af37', // Gold
    secondary: '#e11d48', // Crimson
    glow: 'rgba(225, 29, 72, 0.15)',
    textColor: 'text-[#f2e8d5]',
    bgGrad: 'from-[#070505] via-[#180d0f] to-[#070505]',
    ambientColor: '#ffffff',
    spotColor: '#ffeebb',
    spotIntensity: 3.5,
    spotAngle: 0.45,
    shadowColor: '#120507',
    particleColor: '#d4af37',
    decorText: 'SPQR • SENATUS POPULUSQUE ROMANUS',
    decorEmblem: '🏛️'
  },
  egyptian: {
    accent: '#c5a880', // Sandstone
    secondary: '#14100c', // Obsidian
    glow: 'rgba(197, 168, 128, 0.15)',
    textColor: 'text-[#ece5d8]',
    bgGrad: 'from-[#050403] via-[#14100c] to-[#050403]',
    ambientColor: '#c5a880',
    spotColor: '#ffeebb',
    spotIntensity: 4.0,
    spotAngle: 0.35,
    shadowColor: '#0a0807',
    particleColor: '#ffe5b4',
    decorText: 'KV62 • ARCHIVES OF THE NILE VALLEY',
    decorEmblem: '𓋹'
  },
  indian: {
    accent: '#ff9933', // Saffron
    secondary: '#8a4c10', // Bronze
    glow: 'rgba(255, 153, 51, 0.18)',
    textColor: 'text-[#fffaf0]',
    bgGrad: 'from-[#070504] via-[#200f08] to-[#070504]',
    ambientColor: '#ffcc99',
    spotColor: '#ffaa66',
    spotIntensity: 3.0,
    spotAngle: 0.5,
    shadowColor: '#150a05',
    particleColor: '#ff9933',
    decorText: 'धर्म • SAMSARA CURATION DASHBOARD',
    decorEmblem: 'ॐ'
  },
  mayan: {
    accent: '#10b981', // Jade Green
    secondary: '#064e3b', // Deep Forest
    glow: 'rgba(16, 185, 129, 0.18)',
    textColor: 'text-[#f0fdf4]',
    bgGrad: 'from-[#030504] via-[#081a11] to-[#030504]',
    ambientColor: '#a7f3d0',
    spotColor: '#34d399',
    spotIntensity: 3.2,
    spotAngle: 0.4,
    shadowColor: '#030a06',
    particleColor: '#34d399',
    decorText: 'TZOLK\'IN • VOICES OF THE SACRED FOREST',
    decorEmblem: '🐆'
  }
};

// --- VFX: VOLUMETRIC DUST & EMBERS ---
function VFXParticles({ count = 80, color }) {
  const pointsRef = useRef();
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 6;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 5;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 5;
      speeds[i] = 0.2 + Math.random() * 0.8;
    }
    return { positions: temp, speeds };
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += 0.002 * particles.speeds[i];
        if (positions[i * 3 + 1] > 2.5) {
          positions[i * 3 + 1] = -2.5;
        }
        positions[i * 3] += Math.sin(time + i) * 0.001;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y += 0.0008;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.06}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// --- VFX: COSMIC MANDALA RINGS (Vedic/Indian Era) ---
function MandalaRings({ color }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.1;
    }
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 6, 0, 0]}>
      {/* Outer Mandala Ring */}
      <mesh>
        <torusGeometry args={[1.4, 0.012, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} wireframe />
      </mesh>
      {/* Middle dashed/divided ring */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.1, 0.008, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} wireframe />
      </mesh>
      {/* Inner ring */}
      <mesh>
        <torusGeometry args={[0.8, 0.006, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// --- VFX: VOLUMETRIC GOD RAYS (Egyptian Era) ---
function GodRays({ color }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.opacity = 0.12 + Math.sin(state.clock.getElapsedTime() * 0.6) * 0.04;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1.4, -0.4]} rotation={[0.25, 0, 0.1]}>
      <coneGeometry args={[0.75, 2.8, 32, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// --- VFX: JUNGLE DAPPLED SHADOW LIGHTS (Mayan Era) ---
function DappledShadows({ color }) {
  const lightRef = useRef();
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.6;
      lightRef.current.position.z = Math.cos(state.clock.getElapsedTime() * 0.25) * 0.4;
    }
  });

  return (
    <spotLight
      ref={lightRef}
      position={[0, 3.8, 1]}
      intensity={2.8}
      angle={0.55}
      penumbra={0.95}
      color={color}
      castShadow
    />
  );
}

// --- MASTER TEMPLATE: SPATIAL CURATE TEMPLATE ---
export default function SpatialCurateTemplate({
  era = 'roman',
  title = '',
  description = '',
  ArtifactComponent = null,
  modelScale = 1.0,
  rightPanelContent = null,
  leftPanelContent = null,
  lobbyPath = '/',
  isSoundActive = false,
  onToggleSound = null,
  onConsultAI = null
}) {
  const theme = ERA_THEMES[era] || ERA_THEMES.roman;
  
  // Parallax Spring Setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { mass: 1, tension: 80, friction: 26 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Parallax Mappings
  const bgX = useTransform(springX, [-0.5, 0.5], ['-15px', '15px']);
  const bgY = useTransform(springY, [-0.5, 0.5], ['-15px', '15px']);
  const stageX = useTransform(springX, [-0.5, 0.5], ['-25px', '25px']);
  const stageY = useTransform(springY, [-0.5, 0.5], ['-25px', '25px']);
  const uiX = useTransform(springX, [-0.5, 0.5], ['5px', '-5px']);
  const uiY = useTransform(springY, [-0.5, 0.5], ['5px', '-5px']);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) - 0.5;
    const y = (clientY / innerHeight) - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <main 
      onMouseMove={handleMouseMove}
      className={`relative w-full h-screen overflow-hidden bg-black text-[#fffaf0] select-none flex flex-col font-sans`}
    >
      {/* 1. BACKGROUND PARALLAX LAYER */}
      <motion.div 
        style={{ x: bgX, y: bgY }}
        className={`absolute inset-[-40px] z-0 bg-gradient-to-b ${theme.bgGrad} pointer-events-none filter saturate-[1.1]`}
      >
        {era === 'roman' && (
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)]" 
               style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        )}
        {era === 'egyptian' && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_30%,#000_100%)] opacity-85" />
        )}
        {era === 'indian' && (
          <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_center,transparent_60%,#000_100%)]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1200&auto=format&fit=crop')] bg-cover opacity-20 filter hue-rotate-[240deg]" />
          </div>
        )}
        {era === 'mayan' && (
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,transparent_40%,#000_100%)]"
               style={{ 
                 backgroundImage: 'repeating-linear-gradient(45deg, #10b981 0px, #10b981 1px, transparent 1px, transparent 10px)',
                 backgroundSize: '40px 40px'
               }} />
        )}
      </motion.div>

      {/* 2. CORE 3D RELIC ENGINE CANVAS (STAGE) */}
      <motion.div 
        style={{ x: stageX, y: stageY }}
        className="absolute inset-0 z-10 pointer-events-auto"
      >
        <Canvas
          camera={{ position: [0, 0.1, 3.2], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          shadows
        >
          <ambientLight intensity={era === 'roman' ? 1.0 : 1.2} color={theme.ambientColor} />
          
          {era === 'roman' && (
            <spotLight 
              position={[4, 5, 4]} 
              intensity={theme.spotIntensity} 
              angle={theme.spotAngle} 
              penumbra={0.6} 
              color={theme.spotColor}
              castShadow 
            />
          )}
          {era === 'egyptian' && (
            <>
              <spotLight position={[0, 4, 3]} intensity={theme.spotIntensity} angle={theme.spotAngle} penumbra={0.9} color={theme.spotColor} castShadow />
              <GodRays color={theme.accent} />
            </>
          )}
          {era === 'indian' && (
            <>
              <spotLight position={[3, 4, 3]} intensity={theme.spotIntensity} angle={theme.spotAngle} penumbra={0.8} color={theme.spotColor} castShadow />
              <MandalaRings color={theme.accent} />
              <Stars radius={100} depth={50} count={120} factor={4} saturation={0.5} fade speed={1} />
            </>
          )}
          {era === 'mayan' && (
            <>
              <ambientLight intensity={0.8} color="#0d2b1f" />
              <DappledShadows color={theme.spotColor} />
            </>
          )}

          <pointLight position={[-4, -4, -2]} intensity={0.4} color="#ffffff" />
          
          <PresentationControls
            global
            zoom={0.9}
            polar={[-0.15, 0.35]}
            azimuth={[-Infinity, Infinity]}
            config={{ mass: 1, tension: 180 }}
          >
            <Center>
              <Suspense fallback={
                <mesh castShadow>
                  <sphereGeometry args={[0.35, 32, 32]} />
                  <meshStandardMaterial color={theme.accent} roughness={0.2} metalness={0.9} />
                </mesh>
              }>
                {ArtifactComponent ? (
                  <group scale={modelScale} position={[0, -0.15, 0]}>
                    <ArtifactComponent />
                  </group>
                ) : (
                  <mesh castShadow>
                    <dodecahedronGeometry args={[0.42]} />
                    <meshPhysicalMaterial color={theme.accent} metalness={0.9} roughness={0.1} clearcoat={1.0} />
                  </mesh>
                )}
              </Suspense>
            </Center>
          </PresentationControls>

          <ContactShadows 
            position={[0, -0.7, 0]} 
            opacity={era === 'roman' ? 0.85 : 0.65} 
            scale={2.2} 
            blur={2.4} 
            far={1.8} 
            color={theme.shadowColor} 
          />
          <VFXParticles count={era === 'indian' ? 90 : 65} color={theme.particleColor} />
        </Canvas>
      </motion.div>

      {/* 3. FLOATING GLASSMORPHIC UI CONTAINER */}
      <motion.div 
        style={{ x: uiX, y: uiY }}
        className="relative z-20 w-full h-full flex flex-col justify-between pointer-events-none p-6 md:p-8 lg:p-10 select-none"
      >
        {/* Editorial Top Bar Header */}
        <header className="w-full flex items-center justify-between pointer-events-auto">
          {/* Back Action */}
          <button 
            onClick={() => useNavigationStore.getState().setPath(lobbyPath)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border bg-black/60 backdrop-blur-md text-xs font-mono tracking-widest uppercase transition-all hover:bg-white/10 cursor-pointer"
            style={{ 
              color: theme.accent, 
              borderColor: `${theme.accent}30` 
            }}
          >
            <Compass size={14} /> Lobby
          </button>

          {/* Central Monospace Era Ledger */}
          <div className="hidden md:flex flex-col items-center text-center">
            <span className="text-[9px] font-mono tracking-[0.4em] uppercase font-bold" style={{ color: theme.accent }}>
              {theme.decorText}
            </span>
            <div className="h-[1px] w-24 mt-1" style={{ backgroundColor: `${theme.accent}25` }} />
          </div>

          {/* Utility Controls */}
          <div className="flex items-center gap-3">
            {onToggleSound && (
              <button
                onClick={onToggleSound}
                className="p-3 bg-black/60 border rounded-full text-xs font-mono transition-all cursor-pointer flex items-center justify-center hover:scale-105"
                style={{ 
                  color: isSoundActive ? theme.accent : '#9ca3af',
                  borderColor: isSoundActive ? theme.accent : 'rgba(255,255,255,0.1)' 
                }}
              >
                {isSoundActive ? <Music size={14} className="animate-pulse" /> : <VolumeX size={14} />}
              </button>
            )}

            {onConsultAI && (
              <button 
                onClick={onConsultAI}
                className="p-3 hover:scale-105 transition-all text-black rounded-full cursor-pointer shadow-lg flex items-center justify-center"
                style={{ backgroundColor: theme.accent }}
              >
                <MessageSquare size={15} />
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Split Screen Body Layout */}
        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-6 overflow-hidden">
          {/* Left Column: Context Info & Custom controls */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full justify-center pointer-events-auto">
            {leftPanelContent ? (
              leftPanelContent
            ) : (
              <div className="bg-black/35 border border-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-xl">
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase leading-none" style={{ color: theme.accent }}>
                  {theme.decorEmblem} Era curations
                </span>
                <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-white leading-tight font-medium">
                  {title}
                </h1>
                <div className="h-[2px] w-12 rounded-full" style={{ backgroundColor: theme.accent }} />
                <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed mt-2">
                  {description}
                </p>
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-4">
                  Drag the central 3D relic to inspect detail.
                </span>
              </div>
            )}
          </div>

          {/* Center Column Spacer: Holds R3F canvas interaction sphere */}
          <div className="lg:col-span-3 h-full hidden lg:block" />

          {/* Right Column: Cards Curation Shelf */}
          <div className="lg:col-span-5 flex flex-col h-full justify-center overflow-y-auto pointer-events-auto scrollbar-none pr-1">
            {rightPanelContent}
          </div>
        </div>

        {/* Bottom decorative bar */}
        <footer className="w-full flex justify-between items-center text-[8px] font-mono tracking-widest text-gray-600 uppercase border-t border-white/5 pt-4">
          <span>Mythos Archive • Curation Vol {era === 'roman' ? 'I' : era === 'egyptian' ? 'II' : era === 'indian' ? 'III' : 'IV'}</span>
          <span>© 2026 Timeless Legacies</span>
        </footer>
      </motion.div>
    </main>
  );
}
