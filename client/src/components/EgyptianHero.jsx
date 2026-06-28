import { motion } from 'framer-motion';
import { useNavigationStore } from '../store/navigationStore';

export default function EgyptianHero({ onEnter }) {
  // Staggered animation variants for the typography
  const textContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const textItem = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section className="relative w-full h-screen bg-[#050505] overflow-hidden flex items-center selection:bg-[#d4af37]/30">
      
      {/* 1. THE NAVIGATION (Consistent with Mythos Branding) */}
      <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-8 md:px-24 py-12 text-xs font-mono tracking-widest uppercase text-gray-500">
        <div 
          onClick={() => useNavigationStore.getState().setPath('/')}
          className="flex items-center gap-3 text-[#d4af37] font-serif tracking-widest text-xl normal-case cursor-pointer hover:brightness-125 transition-all"
        >
          <span className="text-2xl">🏛️</span> MYTHOS
        </div>
        <div className="hidden md:flex gap-12">
          <span onClick={() => useNavigationStore.getState().setPath('/')} className="hover:text-[#d4af37] transition-colors cursor-pointer">Home</span>
          <span onClick={() => useNavigationStore.getState().setPath('/')} className="hover:text-[#d4af37] transition-colors cursor-pointer">Collections</span>
          <span className="text-[#d4af37] border-b border-[#d4af37]/50 pb-1 cursor-pointer transition-colors">Civilizations</span>
          <span className="hover:text-[#d4af37] transition-colors cursor-pointer">The Vault</span>
        </div>
        <button className="grid grid-cols-3 gap-1 opacity-50 hover:opacity-100 hover:text-[#d4af37] transition-all">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-current rounded-full" />
          ))}
        </button>
      </nav>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-24 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        
        {/* 2. THE TYPOGRAPHY (Staggered Entrance) */}
        <motion.div 
          variants={textContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col z-20"
        >
          <motion.h1 variants={textItem} className="text-6xl md:text-[6rem] font-serif tracking-tight text-[#d4af37] leading-[1.1]">
            Reveal the
          </motion.h1>
          <motion.h1 variants={textItem} className="text-6xl md:text-[6rem] font-serif tracking-tight text-[#f2e8d5] leading-[1.1] italic pl-8 md:pl-16 opacity-90">
            Mysteries of
          </motion.h1>
          <motion.h1 variants={textItem} className="text-6xl md:text-[6rem] font-serif tracking-tight text-[#d4af37] leading-[1.1]">
            Ancient Egypt
          </motion.h1>

          <motion.div variants={textItem} className="mt-12 flex items-center gap-6">
            <button 
              onClick={onEnter}
              className="px-8 py-3 rounded-full border border-[#d4af37]/40 text-[#d4af37] text-xs font-mono tracking-widest uppercase hover:bg-[#d4af37]/10 transition-colors backdrop-blur-sm cursor-pointer"
            >
              Enter the Tomb
            </button>
          </motion.div>
        </motion.div>

        {/* 3. THE STATUE & HALO COMPOSITION */}
        <div className="relative h-full flex items-center justify-center z-10">
          
          {/* Rotating Hieroglyph Halo */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full border border-[#d4af37]/20 flex items-center justify-center"
          >
            {/* Inner faint ring */}
            <div className="w-[95%] h-[95%] rounded-full border border-[#d4af37]/10 border-dashed" />
            {/* Subtle glow behind the statue */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]" />
          </motion.div>

          {/* Floating Anubis Statue */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: 1, 
              y: [0, -15, 0] // This creates the buttery smooth floating physics
            }}
            transition={{ 
              opacity: { duration: 1.5, ease: "easeOut" },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" } // Infinite float
            }}
            className="relative z-20 w-full max-w-[500px]"
          >
            {/* NOTE: Replace this src with your transparent Anubis .png file */}
            <img 
              src="/images/anubis-transparent.png" 
              alt="Anubis Statue" 
              className="w-full h-auto object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.8)]"
            />
          </motion.div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-8 md:left-24 flex items-center gap-4 text-xs font-mono tracking-widest text-gray-500 uppercase"
      >
        <div className="w-12 h-[1px] bg-gray-600" />
        Descend into the Archives
      </motion.div>

    </section>
  );
}