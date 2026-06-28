import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Volume2, MessageSquare, X, Info, 
  Sparkles, Shield, Compass, Landmark, Music, VolumeX, Eye
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { PresentationControls, Stage, useGLTF } from '@react-three/drei';
import PantheonScene from '../components/PantheonScene';
import { useNavigationStore } from '../store/navigationStore';

// --- 3D VAULT MODEL AND DIALOGUE ---
const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.3} />;
};

const ArtifactVault = ({ onClose, itemTitle }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#0a0807]/85"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-[#d4af37] hover:text-white transition-all z-50 p-4 border border-[#d4af37]/30 rounded-full bg-black/55 hover:scale-105 cursor-pointer"
      >
        <X size={24} />
      </button>

      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }}>
          <Suspense fallback={null}>
            <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.1, Math.PI / 4]} azimuth={[-Infinity, Infinity]}>
              <Stage environment="city" intensity={0.6} contactShadow opacity={0.8} blur={2}>
                <Model url="/models/placeholder.glb" />
              </Stage>
            </PresentationControls>
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none flex flex-col gap-2">
        <h3 className="text-white font-serif text-lg tracking-wide">{itemTitle}</h3>
        <span className="text-[#d4af37] tracking-[0.3em] text-[10px] uppercase font-mono bg-black/50 px-6 py-2.5 rounded-full border border-[#d4af37]/20">
          Hold click & drag to rotate 3D relic
        </span>
      </div>
    </motion.div>
  );
};

// --- CHAT DRAWER COMPONENT ---
const CuratorChat = ({ isOpen, onClose, prefillQuery }) => {
  const [messages, setMessages] = useState([
    { text: "Greetings, citizen of Rome. I am the Curator. Ask me about the campaigns of Julius Caesar, the architecture of the Colosseum, Roman law, or legionary logistics.", sender: "ai" }
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (prefillQuery) {
      setInputText(prefillQuery);
    }
  }, [prefillQuery]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const currentText = inputText;
    const currentImage = selectedImage;

    setMessages(prev => [
      ...prev, 
      { text: currentText, image: currentImage, sender: "user" },
      { text: "", sender: "ai" } 
    ]);
    
    setInputText("");
    setSelectedImage(null);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentText, imageBase64: currentImage })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].text += parsed.text;
                  return newMessages;
                });
              }
            } catch { /* Ignore chunk errors */ }
          }
        }
      }
    } catch {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = "Error: Connection to the imperial archives was broken.";
        return newMessages;
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/75 backdrop-blur-md z-[2000]" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 180 }} className="fixed right-0 top-0 bottom-0 w-full md:w-[460px] bg-[#0c0808]/98 border-l border-[#d4af37]/30 shadow-[-20px_0_60px_rgba(0,0,0,0.95)] z-[2100] flex flex-col backdrop-blur-3xl">
            <div className="p-6 border-b border-[#d4af37]/20 flex justify-between items-center bg-black/55">
              <div>
                <h3 className="text-[#d4af37] font-serif text-2xl tracking-wide">The Imperial Scribe</h3>
                <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">AI Curation Terminal</span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-[#d4af37] transition-all p-2 rounded-full hover:bg-white/5 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-[#d4af37]/20 font-sans">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#f2e8d5]' : 'bg-white/[0.03] border border-white/10 text-gray-300'}`}>
                    {msg.image && <img src={msg.image} alt="Upload" className="w-full rounded-lg mb-3 border border-[#d4af37]/20 max-h-[160px] object-cover" />}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text || "Consulting military records..."}</p>
                  </div>
                  <span className="text-[9px] mt-2 text-gray-600 uppercase tracking-widest font-mono pl-1">{msg.sender === 'user' ? 'Tribunus' : 'Scribe'}</span>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[#d4af37]/20 bg-black/55 flex flex-col gap-3">
              <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider pl-1">
                🛡️ Imperial Tribune channel encrypted
              </span>

              {selectedImage && (
                <div className="relative inline-block self-start">
                  <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded border border-[#d4af37]/50" />
                  <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-black text-[#d4af37] rounded-full p-1 border border-[#d4af37]/50 cursor-pointer" aria-label="Remove image">
                    <X size={10} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" aria-label="Upload image" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full bg-white/5 text-[#d4af37] hover:bg-[#d4af37]/25 transition-all border border-[#d4af37]/10 hover:border-[#d4af37]/30 cursor-pointer" aria-label="Attach file">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                <input 
                  type="text" 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  placeholder="Inquire of the Scribe..." 
                  className="flex-1 bg-white/5 border border-[#d4af37]/20 rounded-full px-5 py-3 text-sm text-[#f2e8d5] focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder-gray-700" 
                />
                <button type="submit" className="p-3 rounded-full bg-[#d4af37] text-black hover:scale-105 transition-transform cursor-pointer" aria-label="Send message">
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- DATA: ROMAN BELONGINGS ---
const ROMAN_BELONGINGS = [
  {
    id: "galea",
    title: "Centurion Brass Crest Galea",
    subtitle: "Militaria Collection • Legio X Equestris",
    metric: "Weight: 1.8 kg • Early Empire (c. 50 CE)",
    material: "Polished Iron, Brass & Crimson Horsehair",
    description: "The iconic helmet worn by Roman Centurions, defined by its transverse red horsehair crest. The sideways orientation allowed battlefield legionaries to instantly locate their officers amidst tactical chaos, serving as a beacon of leadership and absolute authority.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "gladius",
    title: "Legionary Gladius Sword",
    subtitle: "Legionary Armoury • Rhine Frontier Cache",
    metric: "Length: 65 cm • Pax Romana (c. 120 AD)",
    material: "Tempered Carbon Steel, Bone & Boxwood",
    description: "The primary thrusting sword of the Roman army. Crafted with a carved bone grip and spherical wooden pommel, its short, broad, double-edged steel blade was optimized for ruthless, close-quarters stabbing underneath the protection of the massive Scutum shield wall.",
    image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "cameo",
    title: "Gemma Augustea Cameo",
    subtitle: "Imperial Treasury • Dynasty of Augustus",
    metric: "Material: Arabian Onyx & Sardonyx • c. 10 AD",
    material: "Double-layered Arabian Sardonyx Plaque",
    description: "A masterful sardonyx gemstone cameo celebrating the divine authority of Augustus Caesar. It depicts the emperor crowned by Oikoumene, sitting beside Roma, while Roman soldiers raise a trophy of victory below him.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "aureus",
    title: "Julius Caesar Dictator Aureus",
    subtitle: "Mint of Rome • Late Republic (c. 44 BCE)",
    metric: "Purity: 99% Gold • Weight: 8.1 g",
    material: "24-Karat Struck Gold Currency",
    description: "A pure gold coin minted during the final dictatorship of Julius Caesar. Circulated across the Roman provinces as dynamic political propaganda, it represents the consolidation of financial and absolute military power.",
    image: "https://images.unsplash.com/photo-1620616611484-9fa572de674a?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "aquila",
    title: "Gilded Legionary Aquila Standard",
    subtitle: "Sacred Reliquary • Legio XII Fulminata",
    metric: "Height: 1.2m (pole-mount) • c. 115 AD",
    material: "Gilded Bronze & Fine Silver Inlays",
    description: "The sacred silver-and-gold eagle standard representing the soul of the legion. Guarded by the Aquilifer, the standard was considered divine. To lose the Aquila was the ultimate military disgrace, resulting in immediate unit decimation and disbandment.",
    image: "https://images.unsplash.com/photo-1555029352-870ba934372d?q=80&w=800&auto=format&fit=crop"
  }
];

// --- LEGION AND RANK CORRESPONDENCES ---
const ROMAN_LEGIONS = [
  { id: "X", name: "Legio X Equestris", emblem: "🐂 Bull", motto: "Pia Fidelis (Loyal & Faithful)" },
  { id: "XII", name: "Legio XII Fulminata", emblem: "⚡ Lightning", motto: "Certa Constans (Sure & Steadfast)" },
  { id: "XI", name: "Legio XI Claudia", emblem: "🔱 Trident", motto: "Pia Fidelis Domitiana" },
  { id: "V", name: "Legio V Alaudae", emblem: "🪶 Lark", motto: "Virtus Romana" }
];

export default function RomanArchive() {
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [nameInput, setNameInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState("");
  const [activeVaultItem, setActiveVaultItem] = useState(null);
  const [isSounding, setIsSounding] = useState(false);

  // Audio synthesizer nodes ref
  const audioCtxRef = useRef(null);
  const synthNodesRef = useRef([]);

  const activeItem = ROMAN_BELONGINGS[activeItemIdx];

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Web Audio API Synthesizer for Roman Cornu (military horn) and chimes
  const toggleSoundscape = () => {
    if (isSounding) {
      stopRomanAudio();
      setIsSounding(false);
    } else {
      startRomanAudio();
      setIsSounding(true);
    }
  };

  const startRomanAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.5);
      mainGain.connect(ctx.destination);

      // 1. Emulate Roman Cornu horn drone (low sawtooth oscillator with resonant filter sweep)
      const cornuOsc = ctx.createOscillator();
      cornuOsc.type = 'sawtooth';
      cornuOsc.frequency.value = 55; // Low A

      const cornuFilter = ctx.createBiquadFilter();
      cornuFilter.type = 'lowpass';
      cornuFilter.frequency.setValueAtTime(120, ctx.currentTime);
      cornuFilter.Q.value = 8.0;

      const cornuGain = ctx.createGain();
      cornuGain.gain.value = 0.35;

      cornuOsc.connect(cornuFilter);
      cornuFilter.connect(cornuGain);
      cornuGain.connect(mainGain);
      cornuOsc.start();

      // slow LFO sweeping the filter to simulate heavy wind gusts
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05; // 20s cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 80;

      lfo.connect(lfoGain);
      lfoGain.connect(cornuFilter.frequency);
      lfo.start();

      // 2. Synthesize temple bronze chimes
      const playChime = () => {
        if (!audioCtxRef.current || !isSounding) return;
        const now = ctx.currentTime;
        const chimeOsc = ctx.createOscillator();
        chimeOsc.type = 'sine';
        // Pentatonic bronze notes
        const freqs = [523.25, 587.33, 659.25, 783.99, 880.00];
        const randomFreq = freqs[Math.floor(Math.random() * freqs.length)];
        chimeOsc.frequency.setValueAtTime(randomFreq, now);

        const chimeGain = ctx.createGain();
        chimeGain.gain.setValueAtTime(0, now);
        chimeGain.gain.linearRampToValueAtTime(0.025, now + 0.05);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(mainGain);
        chimeOsc.start(now);
        chimeOsc.stop(now + 3.2);
      };

      const intervalId = setInterval(playChime, 4500);

      synthNodesRef.current = [cornuOsc, lfo, { stop: () => clearInterval(intervalId) }];
      this.mainGainNode = mainGain;

    } catch (e) {
      console.warn("Roman Audio synthesis failed:", e);
    }
  };

  const stopRomanAudio = () => {
    if (this.mainGainNode && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      this.mainGainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setTimeout(() => {
        if (synthNodesRef.current) {
          synthNodesRef.current.forEach(node => {
            try { node.stop(); } catch(err){}
          });
          synthNodesRef.current = [];
        }
      }, 900);
    }
  };

  useEffect(() => {
    return () => {
      if (synthNodesRef.current) {
        synthNodesRef.current.forEach(node => {
          try { node.stop(); } catch(err){}
        });
      }
    };
  }, []);

  // Roman military diploma calculator
  const getLatinizedName = (name) => {
    if (!name) return "";
    let base = name.trim().toUpperCase();
    if (base.endsWith('Y')) {
      return base.slice(0, -1) + "IUS";
    }
    if (base.endsWith('D') || base.endsWith('N') || base.endsWith('L') || base.endsWith('R')) {
      return base + "US";
    }
    if (!base.endsWith('S') && !base.endsWith('A') && !base.endsWith('O')) {
      return base + "IUS";
    }
    return base;
  };

  const getLegionAssignment = (name) => {
    if (!name) return null;
    const len = name.length;
    const legionIdx = len % ROMAN_LEGIONS.length;
    return ROMAN_LEGIONS[legionIdx];
  };

  const getCohortRank = (name) => {
    if (!name) return "";
    const len = name.length;
    if (len <= 4) return "Legionarius (Foot Soldier)";
    if (len <= 8) return "Centurio (Century Commander)";
    return "Legatus Legionis (Imperial General)";
  };

  const latinName = getLatinizedName(nameInput);
  const legion = getLegionAssignment(nameInput);
  const rank = getCohortRank(nameInput);

  return (
    <main className="relative w-full h-screen overflow-y-auto overflow-x-hidden bg-[#070505] text-[#f4efe6] scroll-smooth">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative&family=Marcellus&display=swap" />

      {/* Volumetric dust/ash particles floating in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => {
          const delay = `${(i * 1.5).toFixed(1)}s`;
          const duration = `${(10 + Math.random() * 8).toFixed(1)}s`;
          const xDist = `${(-100 + Math.random() * 200).toFixed(0)}px`;
          const leftPos = `${(5 + Math.random() * 90).toFixed(0)}%`;
          return (
            <div 
              key={i} 
              className="dust-particle" 
              style={{
                left: leftPos,
                '--delay': delay,
                '--duration': duration,
                '--x-distance': xDist
              }}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes float-dust {
          0% { transform: translateY(100vh) translateX(0) scale(0.8); opacity: 0; }
          25% { opacity: 0.45; }
          75% { opacity: 0.45; }
          100% { transform: translateY(-10vh) translateX(var(--x-distance)) scale(0.3); opacity: 0; }
        }
        .dust-particle {
          position: absolute;
          bottom: -20px;
          width: 3.5px;
          height: 3.5px;
          background: #d4af37;
          border-radius: 50%;
          filter: blur(1.2px);
          box-shadow: 0 0 8px #f5d77f, 0 0 15px #d4af37;
          animation: float-dust var(--duration) linear infinite;
          animation-delay: var(--delay);
        }
        .font-cinzel {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
        }
        .font-marcellus {
          font-family: 'Marcellus', serif;
        }
        .roman-arch-border {
          border: 6px double #d4af37;
          border-top-left-radius: 12rem;
          border-top-right-radius: 12rem;
          box-shadow: 0 0 35px rgba(212, 175, 55, 0.12), inset 0 0 25px rgba(0,0,0,0.85);
        }
        .pedestal-border {
          border-left: 2px solid rgba(212, 175, 55, 0.15);
          border-right: 2px solid rgba(212, 175, 55, 0.15);
          background: linear-gradient(to right, rgba(255,255,255,0.01) 0%, rgba(212,175,55,0.05) 50%, rgba(255,255,255,0.01) 100%);
        }
      `}</style>

      {/* 3D Vault Overlay */}
      <AnimatePresence>
        {activeVaultItem && (
          <ArtifactVault onClose={() => setActiveVaultItem(null)} itemTitle={activeVaultItem.title} />
        )}
      </AnimatePresence>

      <CuratorChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} prefillQuery={chatPrefill} />

      {/* HEADER CONTROLS */}
      <div className="fixed top-8 left-8 right-8 z-40 flex items-center justify-between pointer-events-none">
        
        {/* Return Button */}
        <motion.button
          onClick={() => useNavigationStore.getState().setPath('/')}
          className="pointer-events-auto px-6 py-2.5 rounded-full border border-[#d4af37]/40 bg-[#070505]/75 text-[#d4af37] text-xs font-mono tracking-widest uppercase hover:bg-[#d4af37]/15 transition-all cursor-pointer flex items-center gap-2"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <Compass size={14} /> Lobby
        </motion.button>

        {/* Global Logo Title */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer pointer-events-auto bg-[#070505]/65 px-5 py-2.5 rounded-full border border-white/5 backdrop-blur-md"
          onClick={() => useNavigationStore.getState().setPath('/')}
        >
          <div className="w-7 h-7 bg-[#d4af37] rounded flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.35)]">
            <Landmark size={16} color="#070505" />
          </div>
          <h1 className="font-cinzel text-base tracking-[0.18em] text-[#d4af37] font-bold margin-0 select-none">MYTHOS</h1>
        </div>

        {/* Sound & Curator triggers */}
        <div className="flex items-center gap-3.5 pointer-events-auto">
          <button
            onClick={toggleSoundscape}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
              isSounding 
                ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)]' 
                : 'bg-[#070505]/75 border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {isSounding ? <Music size={12} className="animate-pulse" /> : <VolumeX size={12} />}
            <span className="hidden sm:inline">{isSounding ? "Cornu Active" : "Play Cornu"}</span>
          </button>
          
          <button 
            onClick={() => { setChatPrefill(`Tell me more about Roman ${activeItem.title}.`); setIsChatOpen(true); }}
            className="p-3 bg-[#d4af37] hover:bg-[#ebd48a] hover:scale-105 transition-all text-black rounded-full cursor-pointer shadow-lg"
          >
            <MessageSquare size={16} />
          </button>
        </div>

      </div>

      {/* 1. CINEMATIC VIDEO BACKGROUND LAYER (STICKY) */}
      <section className="sticky top-0 h-screen w-full z-0 flex-shrink-0">
        <PantheonScene />
      </section>

      {/* 2. THE PREMIUM ROMAN ATRIUM VAULT (SCROLLABLE BODY) */}
      <div className="relative z-10 w-full bg-[#0a0808]/96 border-t border-[#d4af37]/20 shadow-[0_-20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl px-6 md:px-12 py-20">
        
        {/* Atrium Header statistics */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-8 mb-16 gap-6 font-mono text-[10px] tracking-[0.25em] text-[#d4af37]/80 uppercase">
          <div className="flex items-center gap-3">
            <span>🛡️ Era: Pax Romana</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/45" />
            <span>🏛️ Chamber: Imperial Vaults</span>
          </div>
          <div className="h-[1px] w-12 bg-[#d4af37]/25 hidden md:block" />
          <div className="text-center font-marcellus text-sm tracking-[0.15em] text-white">
            SPQR • SENATUS POPULUSQUE ROMANUS
          </div>
          <div className="h-[1px] w-12 bg-[#d4af37]/25 hidden md:block" />
          <div className="flex items-center gap-3">
            <span>📍 Region: Forum Romanum</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/45" />
            <span>🏺 Decorum: High Corinthian</span>
          </div>
        </div>

        {/* 3. CENTRAL TRIUMPHAL ARCH CURATION STAGE */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Left Column: Triumphal Archway Image Frame */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <motion.div 
              key={activeItem.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[420px] aspect-[4/5] relative flex items-center justify-center p-8 bg-black/60 roman-arch-border"
            >
              {/* Outer arch inlays */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[0.3em] text-[#d4af37]/50 uppercase font-bold">
                Triumphal Arch of Titus
              </div>

              <div className="w-full h-full rounded-[10rem] overflow-hidden relative border border-white/5 shadow-inner">
                <img 
                  src={activeItem.image} 
                  alt={activeItem.title} 
                  className="w-full h-full object-cover filter sepia-[20%] brightness-[0.7] contrast-[1.08] hover:scale-105 transition-transform duration-500"
                />
                {/* Dark vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-85 pointer-events-none" />
              </div>

              {/* Hologram badge */}
              <div 
                onClick={() => setActiveVaultItem(activeItem)}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 border border-[#d4af37]/40 bg-black hover:bg-[#d4af37]/15 rounded-full font-mono text-[9px] tracking-widest text-[#d4af37] uppercase cursor-pointer hover:scale-105 transition-all shadow-lg flex items-center gap-1.5"
              >
                <Eye size={12} /> Volumetric 3D Inspect
              </div>
            </motion.div>
          </div>

          {/* Right Column: Historical details */}
          <div className="lg:col-span-6 flex flex-col gap-6 lg:pl-6 font-sans">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-[#d4af37] font-mono text-[10px] uppercase tracking-[0.25em] font-bold">
                  {activeItem.subtitle}
                </span>
                <button 
                  onClick={() => handleSpeak(activeItem.description)}
                  className="p-2 border border-[#d4af37]/30 hover:bg-[#d4af37]/10 rounded-full text-[#d4af37] transition-all cursor-pointer"
                  title="Play vocal narrative guide"
                >
                  <Volume2 size={14} />
                </button>
              </div>

              <h2 className="text-4xl md:text-5xl font-marcellus text-[#f4efe6] tracking-wide mt-2">
                {activeItem.title}
              </h2>
              <div className="h-[2px] w-16 bg-[#d4af37] rounded-full" />

              <p className="text-gray-400 text-sm md:text-base font-light leading-loose mt-4 max-w-xl">
                {activeItem.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-2xl p-4 flex flex-col gap-1.5 shadow-inner">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest leading-none">Materiality</span>
                  <span className="text-xs text-white font-medium">{activeItem.material}</span>
                </div>
                <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-2xl p-4 flex flex-col gap-1.5 shadow-inner">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest leading-none">Chronology</span>
                  <span className="text-xs text-[#d4af37] font-bold">{activeItem.metric}</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* 4. MARBLE PEDESTAL SELECTOR SLIDER */}
        <div className="max-w-7xl mx-auto flex flex-col gap-4 mb-24 border-t border-white/5 pt-12">
          <span className="text-center font-mono text-[9px] tracking-[0.3em] text-[#d4af37]/60 uppercase font-bold">
            Select Imperial Belonging
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mt-4">
            {ROMAN_BELONGINGS.map((item, idx) => {
              const isSelected = activeItemIdx === idx;
              return (
                <div 
                  key={item.id}
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setActiveItemIdx(idx);
                  }}
                  className={`flex flex-col items-center gap-4 cursor-pointer group transition-all duration-300 ${
                    isSelected ? 'scale-105' : 'hover:scale-102 opacity-70 hover:opacity-95'
                  }`}
                >
                  {/* Thumbnail display */}
                  <div className={`w-28 h-28 rounded-full overflow-hidden border-2 relative flex items-center justify-center p-1 transition-all ${
                    isSelected ? 'border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)]' : 'border-white/10 group-hover:border-white/20'
                  }`}>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover rounded-full filter sepia-[15%] brightness-[0.7]" 
                    />
                  </div>

                  {/* Column Pedestal Base */}
                  <div className={`w-full text-center py-2.5 rounded-md pedestal-border transition-all flex flex-col items-center relative ${
                    isSelected ? 'border-t border-[#d4af37]/45' : 'border-t border-white/5'
                  }`}>
                    {isSelected && (
                      <div className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
                    )}
                    <span className="font-mono text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                      PEDESTAL {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-serif text-[10px] text-white tracking-wider mt-1 truncate max-w-[120px] uppercase font-bold">
                      {item.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. INTERACTIVE BRONZE DIPLOMA & COHORT STAMP GENERATOR */}
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 border-t border-white/5 pt-16">
          <div className="flex flex-col items-center text-center gap-1.5">
            <span className="font-mono text-[9px] tracking-[0.3em] text-[#d4af37] uppercase font-bold">SPQR Civic Inscriptions</span>
            <h3 className="font-marcellus text-2xl tracking-wider text-white">Military Diploma & Legion stamp</h3>
            <p className="text-gray-500 text-xs font-light max-w-md mt-1 leading-relaxed">
              Enter your name to draft your official bronze military diploma (*Tabula Honestae Missionis*). Receive your Latin title, ranking, and legion assignment.
            </p>
          </div>

          <input 
            type="text"
            value={nameInput}
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
              setNameInput(val);
            }}
            maxLength={16}
            placeholder="Enter Citizen Name (e.g. MARCUS)"
            className="w-full max-w-sm bg-black/60 border border-[#d4af37]/30 focus:border-[#d4af37] text-white rounded-full px-5 py-3.5 outline-none transition-all font-mono text-center tracking-widest uppercase placeholder-gray-700 text-xs shadow-inner"
          />

          <div className="w-full border-[5px] border-[#8b7765]/80 bg-[#161210] rounded-[2rem] p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative border-double max-w-2xl text-[#eeddbb] font-sans">
            
            {/* Bronze diploma hanging tags */}
            <div className="absolute -top-3.5 left-12 w-3.5 h-7 bg-[#8b7765]/90 rounded-full" />
            <div className="absolute -top-3.5 right-12 w-3.5 h-7 bg-[#8b7765]/90 rounded-full" />

            <div className="flex justify-between items-center border-b border-[#8b7765]/30 pb-3">
              <span className="font-mono text-[9px] tracking-wider text-gray-500 uppercase">Honestae Missionis Tabula</span>
              <span className="font-mono text-[9px] text-[#d4af37]/80 uppercase">Cohort Seal: SPQR</span>
            </div>

            {!nameInput ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-600">
                <Shield size={28} className="stroke-1 animate-pulse text-[#d4af37]/50" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37]/60">Drafting Imperial Seals...</span>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Left side: wax seal stamp */}
                <div className="flex flex-col items-center gap-2 border border-[#d4af37]/15 p-4 rounded-xl bg-black/30 min-w-[140px] text-center shadow-inner">
                  <div className="w-14 h-14 bg-[#a32638] rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(163,38,56,0.35)] relative border border-[#a32638]/70">
                    <span className="font-mono text-white text-[10px] font-bold tracking-widest">SPQR</span>
                    {/* Ring edge details */}
                    <div className="absolute inset-1 border border-dashed border-white/20 rounded-full" />
                  </div>
                  <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mt-1">Cohors Stamp</span>
                  <span className="font-mono text-[9px] text-[#d4af37] font-bold uppercase tracking-wider truncate max-w-[130px]">{latinName}</span>
                </div>

                {/* Right side: details */}
                <div className="flex-1 flex flex-col gap-3 font-sans">
                  <div>
                    <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Assigned Garrison</span>
                    <h4 className="text-[#d4af37] text-base font-serif tracking-wider font-bold uppercase mt-0.5">{legion?.name}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Rank</span>
                      <p className="text-white text-xs font-semibold mt-0.5">{rank}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Motto</span>
                      <p className="text-gray-300 text-xs italic mt-0.5">{legion?.motto}</p>
                    </div>
                  </div>

                  <div className="bg-black/35 border border-[#8b7765]/25 rounded-xl p-3.5 mt-2 shadow-inner">
                    <p className="text-xs italic leading-relaxed text-[#eeddbb]/90 font-light">
                      "I, <strong className="text-[#d4af37]">{latinName}</strong>, swear by the light of Jupiter and the genius of the Emperor to serve <strong className="text-white">{legion?.name}</strong> with sword, shield, and absolute loyalty. Rome stands eternal."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </main>
  );
}