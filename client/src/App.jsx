import { useEffect, useState, useRef, Component, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment, SpotLight, Sphere, PresentationControls, useCursor, Html, Text3D, Center, useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, BookOpen, Landmark, X } from 'lucide-react';
import Landing from './pages/Landing';
import { useNavigationStore } from './store/navigationStore';
import PharaohMask from './components/canvas/PharaohMask';
import IndianArtifact from './components/canvas/IndianArtifact';
import RomanArtifact from './components/canvas/RomanArtifact';
import MayanArtifact from './components/canvas/MayanArtifact';
import VideoBackground from './components/VideoBackground';
import { initLenis } from './lib/lenis';

// INJECTED: Import the dynamic Archive and Hero components
import EgyptianHero from './components/EgyptianHero';
import EgyptianCollection from './pages/EgyptianCollection';
import RomanArchive from './pages/RomanArchive';
import IndianCollection from './pages/IndianCollection';
import MayanCollection from './pages/MayanCollection';
import IndianHero from './components/IndianHero';

// Simple Error Boundary to catch 404s when the user hasn't added the .glb files yet
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// A wrapper for the fallback primitives to give them the exact same interactions as the Artifact
const InteractivePrimitive = ({ position, label, navigateTo, children }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;

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
      onClick={() => { if (navigateTo) useNavigationStore.getState().setPath(navigateTo); }}
    >
      {children}
      {label && (
        <Html lang="en" center position={[0, 1.5, 0]}>
          <div lang="en" style={{
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
};

function App() {
  const isAuthenticated = useNavigationStore((state) => state.isAuthenticated);
  const setIsAuthenticated = useNavigationStore((state) => state.setIsAuthenticated);
  
  // Read the current path from your store
  const currentPath = useNavigationStore((state) => state.currentPath); 

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
  };

  const [curated, setCurated] = useState(null);
  const { progress } = useProgress();
  const [videoReady, setVideoReady] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    const lenis = initLenis();
    return () => lenis.destroy();
  }, []);

  const modelsLoaded = progress === 100;

  useEffect(() => {
    // Safety timeout to prevent permanent loading
    const timer = setTimeout(() => setIsTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const isActuallyReady = (modelsLoaded && videoReady) || isTimedOut;

  const [enteredEgyptTomb, setEnteredEgyptTomb] = useState(false);
  const [enteredIndiaTomb, setEnteredIndiaTomb] = useState(false);

  useEffect(() => {
    if (currentPath !== '/curate/egypt') {
      setEnteredEgyptTomb(false);
    }
    if (currentPath !== '/curate/india') {
      setEnteredIndiaTomb(false);
    }
  }, [currentPath]);

  // 1. Landing Page Check
  if (!isAuthenticated) {
    return <Landing onAuthenticate={handleAuthenticate} />;
  }

  // 2. Routing Check - Rome (Stacked Hero + Archive)
  if (currentPath === '/curate/rome') {
    return <RomanArchive />;
  }

  // Routing Check - Egypt (Stacked Hero + Collection)
  if (currentPath === '/curate/egypt') {
    return (
      <div className="relative w-full min-h-screen overflow-y-auto bg-[#0a0807]">
        <AnimatePresence mode="wait">
          {!enteredEgyptTomb ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
            >
              <EgyptianHero onEnter={() => setEnteredEgyptTomb(true)} />
            </motion.div>
          ) : (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
            >
              <EgyptianCollection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Routing Check - India
  if (currentPath === '/curate/india') {
    return (
      <div className="relative w-full min-h-screen overflow-y-auto bg-[#070504]">
        <AnimatePresence mode="wait">
          {!enteredIndiaTomb ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
            >
              <IndianHero onEnter={() => setEnteredIndiaTomb(true)} />
            </motion.div>
          ) : (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
            >
              <IndianCollection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Routing Check - Mayan
  if (currentPath === '/curate/mayan') {
    return <MayanCollection />;
  }

  // 4. Default Home Scene (Untouched)
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', inset: 0, background: '#0a0807', overflow: 'hidden' }}>
      {/* Cinematic Sync Loader */}
      <AnimatePresence>
        {!isActuallyReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: '#0a0807', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center',
              pointerEvents: 'all'
            }}
          >
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
              style={{ fontFamily: '"Cinzel Decorative", serif', color: '#d4af37', letterSpacing: '0.4em', fontSize: '0.9rem' }}
            >
              RESTORING HISTORY...
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isActuallyReady ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <VideoBackground onReady={() => setVideoReady(true)} />

      {/* Absolute HTML Overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

        {/* Top Nav */}
        <div style={{ 
          padding: '1.5rem 4rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          pointerEvents: 'auto',
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'relative',
          zIndex: 50
        }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', transition: 'all 0.3s' }}
            onClick={() => setIsAuthenticated(false)}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
          >
            <div style={{ width: '32px', height: '32px', background: '#d4af37', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Landmark size={20} color="#0a0807" />
            </div>
            <h1 style={{ fontFamily: '"Cinzel Decorative", serif', fontSize: '1.4rem', fontWeight: 'bold', color: '#d4af37', margin: 0, letterSpacing: '0.1em' }}>MYTHOS</h1>
          </div>
          <div style={{ display: 'flex', gap: '3rem' }}>
            {['HOME', 'COLLECTIONS', 'CIVILIZATIONS'].map((item) => (
              <button key={item} style={{ background: 'none', border: 'none', color: '#fffaf0', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', cursor: 'pointer', opacity: 0.7 }}>{item}</button>
            ))}
          </div>
          <button style={{ 
            padding: '0.8rem 1.8rem', 
            border: '1px solid #d4af37', 
            background: 'none', 
            color: '#d4af37', 
            fontFamily: 'Inter, sans-serif', 
            fontSize: '0.7rem', 
            letterSpacing: '0.2em', 
            cursor: 'pointer', 
            textTransform: 'uppercase',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(212, 175, 55, 0.1)'; }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}>
            Explore Artifacts
          </button>
        </div>

        {/* Hero Sub-text */}
        <div style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'auto', width: '100%' }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
            style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontSize: '1.1rem', 
              color: '#d4af37', 
              opacity: 0.9, 
              margin: '0 0 2.5rem 0', 
              letterSpacing: '0.4em', 
              textTransform: 'uppercase',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Curate your journey through the annals of history
          </motion.p>
        </div>

        {/* Cinematic Detail Overlay */}
        <AnimatePresence>
          {curated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCurated(null)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '512px',
                  backgroundColor: 'rgba(10, 10, 10, 0.9)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 0 40px rgba(212, 175, 55, 0.1)',
                  padding: '3rem',
                  position: 'relative',
                  borderRadius: '12px'
                }}
              >
                <button 
                  onClick={() => setCurated(null)}
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
                <curated.icon size={40} color="#d4af37" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ fontFamily: '"Cinzel Decorative", serif', color: '#d4af37', fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>CIVILIZATION</h3>
                <h2 style={{ fontFamily: '"Cinzel Decorative", serif', color: '#f2e8d5', fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>{curated.name}</h2>
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#f2e8d5', opacity: 0.8, lineHeight: 1.8, marginBottom: '2.5rem' }}>
                  Explore the legendary artifacts and untold stories of {curated.name.toLowerCase()}. 
                  Our archive contains thousands of high-fidelity 3D scans preserved for eternity.
                </p>
                <button 
                  onClick={() => useNavigationStore.getState().setPath(curated.url)}
                  style={{
                    width: '100%', background: '#d4af37', border: 'none', color: '#110e0c', padding: '1rem',
                    fontFamily: '"Cinzel Decorative", serif', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f2e8d5'}
                  onMouseLeave={(e) => e.target.style.background = '#d4af37'}
                >
                  CURATE COLLECTION
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Nav */}
        <div style={{
          borderTop: '1px solid rgba(212, 175, 55, 0.2)', padding: '1.5rem 4rem',
          display: 'flex', justifyContent: 'center', gap: '5rem', pointerEvents: 'auto',
          background: 'linear-gradient(to top, rgba(17,14,12,0.9), transparent)'
        }}>
          {[
            { icon: Landmark, label: "ROMAN HISTORY", url: "/curate/rome" },
            { icon: Compass, label: "INDIAN HISTORY", url: "/curate/india" },
            { icon: BookOpen, label: "EGYPTIAN HISTORY", url: "/curate/egypt" },
            { icon: Landmark, label: "MAYAN CIVILIZATION", url: "/curate/mayan" }
          ].map((item, idx) => (
            <div key={idx} 
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', color: curated?.name === item.label ? '#d4af37' : '#f2e8d5', 
                opacity: curated?.name === item.label ? 1 : 0.7,
                cursor: 'pointer', transition: 'all 0.3s', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', letterSpacing: '0.1em'
              }}
              onClick={() => setCurated({ id: idx, name: item.label, icon: item.icon, url: item.url })}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#d4af37'; }}
              onMouseLeave={(e) => { if (curated?.name !== item.label) { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.color = '#f2e8d5'; } }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 1, 9], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false
        }}
        shadows={{ type: THREE.PCFShadowMap }}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 5, 
          pointerEvents: 'auto' 
        }}
      >
        <ambientLight intensity={1.2} color="#ffffff" />
        <SpotLight position={[0, 10, 5]} intensity={3.5} color="#ffeedd" penumbra={0.8} angle={0.5} castShadow />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>

        {/* 3D Cinematic Title */}
        <Suspense fallback={null}>
          <Center position={[0, 1.4, -2]} top>
            <Text3D
              font="/fonts/cinzel_fixed.json"
              size={0.48}
              height={0.2}
              curveSegments={12}
              bevelEnabled
              bevelThickness={0.02}
              bevelSize={0.02}
              bevelOffset={0}
              bevelSegments={5}
              castShadow
            >
              {`TIMELESS LEGACIES.\nONE HUMAN STORY.`}
              <meshPhysicalMaterial
                color="#d4af37"
                metalness={0.9}
                roughness={0.3}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
                envMapIntensity={1.5}
              />
            </Text3D>
          </Center>
        </Suspense>

        <PresentationControls
          global
          rotation={[0, 0, 0]}
          polar={[-0.1, 0.1]}
          azimuth={[-0.2, 0.2]}
          config={{ mass: 2, tension: 400 }}
        >
          <ErrorBoundary fallback={<InteractivePrimitive position={[-4.5, -0.2, 0]} label="ROMAN HISTORY" navigateTo="/curate/rome"><Sphere args={[0.7, 32, 32]}><meshStandardMaterial color="#d4af37" roughness={0.1} metalness={0.9} /></Sphere></InteractivePrimitive>}>
            <Suspense fallback={<InteractivePrimitive position={[-4.5, -0.2, 0]} label="LOADING..." navigateTo={null}><Sphere args={[0.6, 32, 32]}><meshStandardMaterial color="#d4af37" roughness={0.1} metalness={0.9} /></Sphere></InteractivePrimitive>}>
              <RomanArtifact
                position={[-4.5, -0.2, 0]}
                scale={1.2}
                onSelect={() => setCurated({ id: 3, name: "ROMAN HISTORY", icon: Landmark, url: "/curate/rome" })}
              />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary fallback={<InteractivePrimitive position={[-1.5, -0.2, 0]} label="INDIAN HISTORY" navigateTo="/curate/india"><Sphere args={[0.7, 32, 32]}><meshStandardMaterial color="#d4af37" roughness={0.1} metalness={0.9} /></Sphere></InteractivePrimitive>}>
            <Suspense fallback={<InteractivePrimitive position={[-1.5, -0.2, 0]} label="LOADING..." navigateTo={null}><Sphere args={[0.6, 32, 32]}><meshStandardMaterial color="#d4af37" roughness={0.1} metalness={0.9} /></Sphere></InteractivePrimitive>}>
              <IndianArtifact
                position={[-1.5, -0.2, 0]}
                scale={1.0}
                onSelect={() => setCurated({ id: 2, name: "INDIAN HISTORY", icon: Compass, url: "/curate/india" })}
              />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary fallback={<InteractivePrimitive position={[1.5, -0.2, 0]} label="EGYPTIAN HISTORY" navigateTo="/curate/egypt"><Sphere args={[0.7, 32, 32]}><meshStandardMaterial color="#d4af37" roughness={0.1} metalness={0.9} /></Sphere></InteractivePrimitive>}>
            <Suspense fallback={<InteractivePrimitive position={[1.5, -0.2, 0]} label="LOADING..." navigateTo={null}><Sphere args={[0.6, 32, 32]}><meshStandardMaterial color="#d4af37" roughness={0.1} metalness={0.9} /></Sphere></InteractivePrimitive>}>
              <PharaohMask
                position={[1.5, -0.2, 0]}
                scale={1.5}
                onSelect={() => setCurated({ id: 1, name: "EGYPTIAN HISTORY", icon: BookOpen, url: "/curate/egypt" })}
              />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary fallback={<InteractivePrimitive position={[4.5, -0.2, 0]} label="MAYAN CIVILIZATION" navigateTo="/curate/mayan"><Sphere args={[0.7, 32, 32]}><meshStandardMaterial color="#5c6356" roughness={0.9} metalness={0.1} /></Sphere></InteractivePrimitive>}>
            <Suspense fallback={<InteractivePrimitive position={[4.5, -0.2, 0]} label="LOADING..." navigateTo={null}><Sphere args={[0.6, 32, 32]}><meshStandardMaterial color="#5c6356" roughness={0.1} metalness={0.9} /></Sphere></InteractivePrimitive>}>
              <MayanArtifact
                position={[4.5, -0.2, 0]}
                scale={1.3}
                onSelect={() => setCurated({ id: 4, name: "MAYAN CIVILIZATION", icon: Landmark, url: "/curate/mayan" })}
              />
            </Suspense>
          </ErrorBoundary>
        </PresentationControls>
      </Canvas>
      </motion.div>
    </div>
  );
}

export default App;