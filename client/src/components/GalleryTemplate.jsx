import { useRef, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll, Environment, } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ChevronLeft, Landmark } from 'lucide-react';
import { useNavigationStore } from '../store/navigationStore';
import CivBackgroundController from './CivBackgroundController';
import HistoryBackground from './ui/HistoryBackground';

const ArtifactScroller = ({ artifact: Artifact, title, subtitle, description, details, themeColor, totalPages }) => {
  const scroll = useScroll();
  const artifactRef = useRef();
  const groupRef = useRef();

  useFrame((state, delta) => {
    const offset = scroll.offset; // 0 to 1
    const endArt = (totalPages > 1) ? 3 / (totalPages - 1) : 1;
    
    const p1 = endArt * 0.2;
    const p2 = endArt * 0.5;
    const p3 = endArt * 0.8;
    const p4 = endArt * 1.0;

    if (offset < p1) {
      const t = offset / p1;
      artifactRef.current.position.x = THREE.MathUtils.lerp(0, -2, t);
      artifactRef.current.position.y = 0;
      artifactRef.current.position.z = 0;
      artifactRef.current.rotation.y = 0;
      artifactRef.current.scale.setScalar(THREE.MathUtils.lerp(1.5, 1, t));
    } 
    else if (offset < p2) {
      const t = (offset - p1) / (p2 - p1);
      artifactRef.current.position.x = -2;
      artifactRef.current.position.y = 0;
      artifactRef.current.position.z = 0;
      artifactRef.current.rotation.y = t * Math.PI;
      artifactRef.current.scale.setScalar(1);
    } 
    else if (offset < p3) {
      const t = (offset - p2) / (p3 - p2);
      artifactRef.current.position.x = THREE.MathUtils.lerp(-2, 0, t);
      artifactRef.current.position.y = 0;
      artifactRef.current.position.z = THREE.MathUtils.lerp(0, 2, t);
      artifactRef.current.rotation.y = Math.PI + (t * Math.PI);
      artifactRef.current.scale.setScalar(1);
    } 
    else if (offset < p4) {
      const t = (offset - p3) / (p4 - p3);
      artifactRef.current.position.x = 0;
      artifactRef.current.position.y = THREE.MathUtils.lerp(0, -1, t);
      artifactRef.current.position.z = 2;
      artifactRef.current.rotation.y = Math.PI * 2;
      artifactRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 0.7, t));
    } 
    else {
      // Transition from Specs to History Background
      const tHistory = Math.min((offset - p4) / 0.1, 1);
      artifactRef.current.position.x = THREE.MathUtils.lerp(0, 2, tHistory);
      artifactRef.current.position.y = THREE.MathUtils.lerp(-1, 0, tHistory);
      artifactRef.current.position.z = THREE.MathUtils.lerp(2, -2, tHistory);
      artifactRef.current.scale.setScalar(THREE.MathUtils.lerp(0.7, 0.5, tHistory));
      artifactRef.current.rotation.y += delta * 0.2; 
    }

    // Subtle floating animation
    groupRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.1 - groupRef.current.position.y;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={artifactRef}>
        <Artifact scale={1} position={[0, 0, 0]} />
      </mesh>
    </group>
  );
};

const UIOverlay = ({ title, subtitle, description, details, themeColor, historyData }) => {
  const scroll = useScroll();
  const [opacity, setOpacity] = useState(0);

  useFrame(() => {
    setOpacity(scroll.offset);
  });

  const letterVariants = {
    initial: { y: 20, opacity: 0 },
    animate: i => ({
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }
    })
  };

  return (
    <Scroll html>
      <div style={{ width: '100vw', pointerEvents: 'none' }}>
        {/* Section 1: Title */}
        <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <motion.h1 
              style={{ fontFamily: '"Cinzel Decorative", serif', fontSize: '5rem', color: themeColor, margin: 0 }}
            >
              {title.split('').map((char, i) => (
                <motion.span key={i} custom={i} variants={letterVariants} initial="initial" animate="animate">
                  {char}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.5em', color: '#fffaf0', opacity: 0.6 }}
            >
              {subtitle}
            </motion.p>
          </div>
        </section>

        {/* Section 2: Discovery */}
        <section style={{ height: '100vh', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 10%' }}>
          <motion.div 
            style={{ maxWidth: '400px', pointerEvents: 'auto' }}
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
          >
            <h2 style={{ fontFamily: '"Cinzel Decorative", serif', color: themeColor }}>THE DISCOVERY</h2>
            <p style={{ color: '#fffaf0', opacity: 0.8, lineHeight: '1.8' }}>{description}</p>
          </motion.div>
        </section>

        {/* Section 3: Details */}
        <section style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <motion.div 
            style={{ textAlign: 'center', pointerEvents: 'auto' }}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
          >
            <h2 style={{ fontFamily: '"Cinzel Decorative", serif', color: themeColor, fontSize: '3rem' }}>ETERNAL MASTERY</h2>
            <p style={{ color: '#fffaf0', opacity: 0.6, letterSpacing: '0.2em' }}>SCRUTINIZE EVERY TEXTURE</p>
          </motion.div>
        </section>

        {/* Section 4: Specs */}
        <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '5% 10%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4rem', pointerEvents: 'auto' }}>
            {details.map((detail, i) => (
              <motion.div key={i} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.2 }}>
                <h4 style={{ color: themeColor, fontSize: '0.7rem', letterSpacing: '0.2em' }}>{detail.label}</h4>
                <p style={{ color: '#fffaf0', fontSize: '1.2rem', fontFamily: '"Cinzel Decorative", serif' }}>{detail.value}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Dynamic History Timeline (Scrollytelling) */}
        {historyData && historyData.map((epoch, i) => (
          <section key={epoch.id} style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: epoch.alignment === 'left' ? 'flex-start' : 'flex-end', padding: '0 10%' }}>
            <motion.div 
              style={{
                width: '45%',
                background: 'rgba(10, 8, 7, 0.6)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${themeColor}44`,
                padding: '3rem',
                borderRadius: '8px',
                pointerEvents: 'auto',
                boxShadow: `0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)`
              }}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h4 style={{ color: themeColor, fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{epoch.subtitle}</h4>
              <h2 style={{ fontFamily: '"Cinzel Decorative", serif', color: '#fffaf0', fontSize: '2.5rem', margin: '0 0 1.5rem 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{epoch.title}</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', color: '#fffaf0', opacity: 0.85, lineHeight: '1.8', fontSize: '1.05rem' }}>{epoch.content}</p>
              
              <div style={{ marginTop: '2.5rem', padding: '1rem', border: `1px solid ${themeColor}33`, background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                <p style={{ color: themeColor, fontSize: '0.65rem', letterSpacing: '0.15em', margin: 0, fontWeight: 'bold' }}>[ CINEMATIC ASSET REQUIRED ]</p>
                <p style={{ color: '#fffaf0', opacity: 0.6, fontSize: '0.8rem', margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>{epoch.imageAssetRequirement}</p>
              </div>
            </motion.div>
          </section>
        ))}
      </div>
    </Scroll>
  );
};

const GalleryTemplate = (props) => {
  const totalPages = 4 + (props.historyData ? props.historyData.length : 0);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0807' }}>
      {/* Cinematic history background — only rendered when history data exists */}
      {props.historyData && <HistoryBackground category={props.category} />}
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} shadows>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <CivBackgroundController category={props.category} />
          <ScrollControls pages={totalPages} damping={0.2}>
            <ArtifactScroller {...props} totalPages={totalPages} />
            <UIOverlay {...props} />
          </ScrollControls>
        </Suspense>

        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.9} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          <Noise opacity={0.05} />
        </EffectComposer>
      </Canvas>
      {/* Global Header Logo */}
      <div 
        style={{ 
          position: 'fixed', top: '2.5rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', zIndex: 100,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 12px rgba(212, 175, 55, 0.5))'; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
      >
        <div style={{ width: '32px', height: '32px', background: props.themeColor, borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: `0 0 20px ${props.themeColor}33` }}>
          <Landmark size={20} color="#0a0807" />
        </div>
        <h1 style={{ fontFamily: '"Cinzel Decorative", serif', fontSize: '1.4rem', fontWeight: 'bold', color: props.themeColor, margin: 0, letterSpacing: '0.15em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>MYTHOS</h1>
      </div>

      {/* Dynamic Back Button */}
      <motion.button
        onClick={() => {
          useNavigationStore.getState().setPath('/');
        }}
        style={{
          position: 'fixed', top: '2.5rem', left: '4rem',
          background: 'none', border: `1px solid ${props.themeColor}55`,
          color: props.themeColor, padding: '0.8rem 1.8rem',
          fontFamily: 'Inter, sans-serif', fontSize: '0.7rem',
          letterSpacing: '0.25em', cursor: 'pointer', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          backdropFilter: 'blur(10px)',
          textTransform: 'uppercase'
        }}
        whileHover={{ 
          scale: 1.05, 
          borderColor: props.themeColor, 
          backgroundColor: `${props.themeColor}11`,
          x: -5
        }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft size={16} />
        Return to Archive
      </motion.button>
    </div>
  );
};

export default GalleryTemplate;
