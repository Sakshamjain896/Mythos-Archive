import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PantheonScene() {
  const [hasEntered, setHasEntered] = useState(false);
  const videoRef = useRef(null);

  const handleEnter = () => {
    setHasEntered(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center text-white font-sans">

      {/* LAYER 1: The Video Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video
          ref={videoRef}
          loop
          playsInline
          className="w-full h-full object-cover opacity-60 grayscale-[10%]"
        >
          <source src="/videos/Pantheon.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.95)]" />
      </div>

      {/* LAYER 2: The Cinematic Text Reveal */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center perspective-[1200px]">
        <AnimatePresence mode="wait">
          {!hasEntered ? (
            <motion.button
              key="enter-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              onClick={handleEnter}
              className="px-8 py-4 border border-[#d4af37]/50 rounded-full text-sm tracking-[0.2em] uppercase text-[#d4af37] hover:bg-[#d4af37]/10 transition-all backdrop-blur-md cursor-pointer pointer-events-auto"
            >
              Enter The Pantheon
            </motion.button>
          ) : (
            <motion.div
              key="cinematic-text"
              className="flex flex-col items-center justify-center pointer-events-none"
            >
              <motion.h1
                initial={{ opacity: 0, rotateX: 60, z: -800, filter: "blur(20px)" }}
                animate={{ opacity: 1, rotateX: 0, z: 0, filter: "blur(0px)" }}
                transition={{ duration: 4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="text-7xl lg:text-9xl font-serif font-bold tracking-[0.1em] text-center uppercase drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              >
                The Pantheon
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 3, delay: 2, ease: "easeOut" }}
                className="mt-6 text-xl tracking-[0.4em] text-[#d4af37] uppercase font-light drop-shadow-md"
              >
                A Temple to All Gods
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 5 }}
                className="absolute bottom-12 flex flex-col items-center gap-2"
              >
                <span className="text-xs tracking-widest text-gray-400 uppercase">Discover</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-gray-400 to-transparent animate-pulse" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}