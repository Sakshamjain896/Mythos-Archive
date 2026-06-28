import { motion } from 'framer-motion';
import { useNavigationStore } from '../store/navigationStore';

export default function IndianHero({ onEnter }) {
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
    <section className="relative w-full h-screen bg-[#070504] overflow-hidden flex items-center selection:bg-[#ff9933]/30">
      
      {/* 1. THE NAVIGATION */}
      <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-8 md:px-24 py-12 text-xs font-mono tracking-widest uppercase text-gray-500">
        <div 
          onClick={() => useNavigationStore.getState().setPath('/')}
          className="flex items-center gap-3 text-[#ff9933] font-serif tracking-widest text-xl normal-case cursor-pointer hover:brightness-125 transition-all"
        >
          <span className="text-2xl">🏛️</span> MYTHOS
        </div>
        <div className="hidden md:flex gap-12">
          <span onClick={() => useNavigationStore.getState().setPath('/')} className="hover:text-[#ff9933] transition-colors cursor-pointer">Home</span>
          <span onClick={() => useNavigationStore.getState().setPath('/')} className="hover:text-[#ff9933] transition-colors cursor-pointer">Collections</span>
          <span className="text-[#ff9933] border-b border-[#ff9933]/50 pb-1 cursor-pointer transition-colors">Civilizations</span>
          <span className="hover:text-[#ff9933] transition-colors cursor-pointer">The Vault</span>
        </div>
        <button className="grid grid-cols-3 gap-1 opacity-50 hover:opacity-100 hover:text-[#ff9933] transition-all" aria-label="Menu grid">
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
          <motion.h1 variants={textItem} className="text-6xl md:text-[6rem] font-serif tracking-tight text-[#ff9933] leading-[1.1]">
            Unlock the
          </motion.h1>
          <motion.h1 variants={textItem} className="text-6xl md:text-[6rem] font-serif tracking-tight text-[#f2e8d5] leading-[1.1] italic pl-8 md:pl-16 opacity-90">
            Sacred Rhythms of
          </motion.h1>
          <motion.h1 variants={textItem} className="text-6xl md:text-[6rem] font-serif tracking-tight text-[#ff9933] leading-[1.1]">
            Ancient India
          </motion.h1>

          <motion.div variants={textItem} className="mt-12 flex items-center gap-6">
            <button 
              onClick={onEnter}
              className="px-8 py-3 rounded-full border border-[#ff9933]/40 text-[#ff9933] text-xs font-mono tracking-widest uppercase hover:bg-[#ff9933]/10 transition-colors backdrop-blur-sm cursor-pointer shadow-[0_0_15px_rgba(255,153,51,0.1)]"
            >
              Enter the Temple
            </button>
          </motion.div>
        </motion.div>

        {/* 3. THE SACRED GEOMETRY HALO & ARTIFACT */}
        <div className="relative h-full flex items-center justify-center z-10">
          
          {/* Rotating Sacred Mandala Halo */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[580px] md:h-[580px] rounded-full border border-[#ff9933]/25 flex items-center justify-center"
          >
            {/* Inner dashed ring */}
            <div className="w-[92%] h-[92%] rounded-full border border-[#ff9933]/10 border-dashed" />
            {/* Subtle glow behind the artifact */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,51,0.06)_0%,transparent_70%)]" />
            
            {/* Tiny rotating stars along the orbit */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff9933] rounded-full blur-[1px]" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff9933] rounded-full blur-[1px]" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#ff9933] rounded-full blur-[1px]" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#ff9933] rounded-full blur-[1px]" />
          </motion.div>

          {/* Floating Indian Artifact Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: 1, 
              y: [0, -16, 0] // Smooth floating physics
            }}
            transition={{ 
              opacity: { duration: 1.5, ease: "easeOut" },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative z-20 w-full max-w-[380px] md:max-w-[440px] aspect-[4/5] rounded-[30px] overflow-hidden border border-[#ff9933]/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
          >
            <img 
              src="/images/india.avif" 
              alt="Indian Civilization Monument" 
              className="w-full h-full object-cover filter brightness-[0.88] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-left">
              <span className="text-[10px] font-mono text-[#ff9933] uppercase tracking-widest">CIVILIZATION PORTRAIT</span>
              <h3 className="font-serif text-lg text-[#f2e8d5] tracking-wide mt-1">Gilded Temples of the Subcontinent</h3>
            </div>
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
