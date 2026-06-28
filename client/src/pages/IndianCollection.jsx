import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Volume2, MessageSquare, X, Info, 
  HelpCircle, Sparkles, Compass, Award, Anchor, Sun, Flame, Shield, BookOpen, Music, VolumeX
} from 'lucide-react';
import { useNavigationStore } from '../store/navigationStore';

// --- SANSKRIT DICTIONARY & MAP ---
const LETTER_TO_SANSKRIT = {
  A: { char: "अ", name: "Ananta (Infinite)" },
  B: { char: "ब", name: "Bala (Strength)" },
  C: { char: "च", name: "Chandra (Moon)" },
  D: { char: "द", name: "Dharma (Law)" },
  E: { char: "ए", name: "Eka (Unity)" },
  F: { char: "फ", name: "Phala (Reward)" },
  G: { char: "ग", name: "Guru (Guide)" },
  H: { char: "ह", name: "Hridaya (Heart)" },
  I: { char: "इ", name: "Indra (Ruler)" },
  J: { char: "ज", name: "Jaya (Victory)" },
  K: { char: "क", name: "Karma (Action)" },
  L: { char: "ल", name: "Lila (Play)" },
  M: { char: "म", name: "Mudra (Gesture)" },
  N: { char: "न", name: "Nitya (Eternal)" },
  O: { char: "ओ", name: "Omkara (Primordial)" },
  P: { char: "प", name: "Prana (Life force)" },
  Q: { char: "ऋ", name: "Rishi (Sage)" },
  R: { char: "र", name: "Raga (Melody)" },
  S: { char: "स", name: "Satya (Truth)" },
  T: { char: "त", name: "Tejas (Splendor)" },
  U: { char: "उ", name: "Utsava (Festival)" },
  V: { char: "व", name: "Vidya (Wisdom)" },
  W: { char: "व्य", name: "Vyasa (Compiler)" },
  X: { char: "क्ष", name: "Kshama (Mercy)" },
  Y: { char: "य", name: "Yoga (Union)" },
  Z: { char: "झ", name: "Jyoti (Light)" }
};

// --- INDIAN ARTIFACTS DATABASE ---
const INDIAN_ARTIFACTS = {
  indus: [
    {
      title: "The Priest-King Bust",
      subtitle: "Mohenjo-Daro • Indus Valley Civilization (c. 2000 BCE)",
      desc: "A highly detailed steatite sculpture depicting a bearded figure dressed in a trefoil-patterned robe. Thought to represent a high priest or a civic governor, it exemplifies the exceptional stone carving mastery of Harappan artisans.",
      metric: "Material: Carved Steatite Soapstone",
      image: "https://images.unsplash.com/photo-1608958416715-4fa769eb0707?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Lost-Wax Dancing Girl",
      subtitle: "Mohenjo-Daro • Indus Valley Civilization (c. 2300 BCE)",
      desc: "A globally renowned copper-bronze casting showing a young woman adorned in bangles standing confidently. It indicates a remarkably advanced understanding of metallurgy and lost-wax casting three millennia ago.",
      metric: "Material: Cast Bronze & Copper",
      image: "https://images.unsplash.com/photo-1620616611484-9fa572de674a?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Pashupati Sacred Seal",
      subtitle: "Harappa Cache • Indus Valley Civilization (c. 2500 BCE)",
      desc: "An intaglio steatite seal displaying a horned, three-faced figure seated in a meditative yogic posture, surrounded by wild beasts. Historically regarded as a proto-historic representation of Shiva.",
      metric: "Relic: Intaglio Carved Steatite Seal",
      image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=600&auto=format&fit=crop"
    }
  ],
  vedic: [
    {
      title: "Rigveda Palm-Leaf Manuscript",
      subtitle: "Vedic Plains • Early Iron Age Era (c. 1500 BCE)",
      desc: "Early written transcriptions of the oldest Sanskrit hymns. These texts preserve sacred sonic chants detailing the Vedic concepts of Rta (cosmic order), creation hymns, and natural elements.",
      metric: "Script: Early Sanskrit on Palm Leaves",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Sulba Sutra Vedic Altar Bricks",
      subtitle: "Ganga Valley • Later Vedic Period (c. 800 BCE)",
      desc: "Sacred brick altar constructions built with absolute mathematical precision. The Sulba Sutras defined complex geometry, circle squaring, and altar proportions essential for fire sacrifices.",
      metric: "Geometry: Baked Clay Altar Bricks",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "The Saraswati Veena",
      subtitle: "Indus Plains • Vedic Musical Tradition",
      desc: "A classical hollow jackwood lute originating from Vedic references. Inscribed as the instrument of Saraswati, it represents the ancient science of sonic frequencies and cosmic acoustics.",
      metric: "Instrument: Hand-Carved Jackwood Lute",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop"
    }
  ],
  maurya: [
    {
      title: "Lion Capital of Ashoka",
      subtitle: "Sarnath Temple • Mauryan Empire (c. 250 BCE)",
      desc: "A colossal, mirror-polished sandstone capital presenting four Asiatic lions back-to-back. It stands atop a lotus base decorated with wheels (dharmachakras), symbolizing imperial and spiritual law.",
      metric: "Craft: High-Gloss Polished Sandstone",
      image: "https://images.unsplash.com/photo-1600577916048-804c9191e36c?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Edict Pillars of Dhamma",
      subtitle: "Subcontinent Borderlands • Mauryan Empire (c. 250 BCE)",
      desc: "Monolithic sandstone pillars erected by Emperor Ashoka. Carved in Prakrit Brahmi script, these pillars contain public decrees outlining religious tolerance, peace, and human rights.",
      metric: "Height: 15-Meter Sandstone Monoliths",
      image: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Silver Punch-Marked Currency",
      subtitle: "Pataliputra Treasury • Mauryan Empire",
      desc: "Irregularly shaped silver coins carrying punch-marked stamps of wheels, suns, mountains, and wildlife, demonstrating the complex economic trade system of the empire.",
      metric: "Metal: Stamped Pure Silver Bullion",
      image: "https://images.unsplash.com/photo-1613143577717-a0f60baee436?q=80&w=600&auto=format&fit=crop"
    }
  ],
  gupta: [
    {
      title: "Aryabhata's Solar Astrolabe",
      subtitle: "Kusumapura Observatory • Gupta Empire (c. 499 CE)",
      desc: "Astronomical copper dials and star charts used by Aryabhata. This mathematics school calculated the value of Pi, discovered the heliocentric earth rotation, and introduced the decimal system.",
      metric: "Science: Heliocentric Star Charts",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Iron Pillar of Delhi",
      subtitle: "Mehrauli Sanctuary • Gupta Golden Age (c. 402 CE)",
      desc: "A massive wrought iron column standing 7.2 meters tall. Built for King Chandragupta II, it is globally celebrated for its exceptional rust-resistant alloy composition.",
      metric: "Material: Corrosion-Resistant Wrought Iron",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Seated Sarnath Buddha",
      subtitle: "Sarnath Excavation • Gupta Golden Age (c. 475 CE)",
      desc: "A sandstone sculpture depicting Gautama Buddha in the wheel-turning Mudra. It represents the height of Gupta artistic elegance, renowned for its serene facial expression.",
      metric: "Sculpture: Carved Chunar Sandstone",
      image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=600&auto=format&fit=crop"
    }
  ],
  chola: [
    {
      title: "Lost-Wax Shiva Nataraja",
      subtitle: "Thanjavur Palace • Chola Empire (c. 10th Century CE)",
      desc: "A beautiful representation of Shiva doing the Tandava cosmic dance. Cast using lost-wax bronze molds, it depicts the cosmic cycles of creation, protection, and destruction.",
      metric: "Process: Lost-Wax Bronze Sculpture",
      image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Brihadisvara Granite Temple Model",
      subtitle: "Thanjavur Citadel • Chola Golden Age (c. 1010 CE)",
      desc: "A structural mockup of the great Brihadisvara Vimana tower. Built entirely from interlocking granite stones without mortar, it stands as a triumph of medieval construction.",
      metric: "Architecture: Monolithic Granite Vimana",
      image: "https://images.unsplash.com/photo-1608958416715-4fa769eb0707?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Imperial Chola Tiger Charter",
      subtitle: "Maritime Archives • Chola Empire (c. 1050 CE)",
      desc: "Copper charter plates bound together by a heavy bronze ring bearing the imperial emblem of the Tiger, Bow, and Fish. Authorized trade grants with Southeast Asian ports.",
      metric: "Relic: Bronze Copper Charter Plates",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop"
    }
  ]
};

// --- CHAT DRAWER COMPONENT ---
const CuratorChatDrawer = ({ isOpen, onClose, prefill }) => {
  const [messages, setMessages] = useState([
    { text: "Welcome, traveler. I am the Curator of India's timelines. Inquire of the Indus trade systems, Vedic philosophy, Gupta astronomical sciences, Chola maritime power, or upload your artifacts for analysis.", sender: "ai" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (prefill) {
      setInputValue(prefill);
    }
  }, [prefill]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageFile(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() && !imageFile) return;

    const currentText = inputValue;
    const currentImage = imageFile;

    setMessages(prev => [
      ...prev,
      { text: currentText, image: currentImage, sender: "user" },
      { text: "", sender: "ai" }
    ]);

    setInputValue("");
    setImageFile(null);

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
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].text += parsed.text;
                  return newMsgs;
                });
              }
            } catch { /* Ignore chunk errors */ }
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].text = "Error: Connection to the Indian Epigraphy Archives was broken.";
        return newMsgs;
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[2000]"
          />
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 26, stiffness: 180 }} 
            className="fixed right-0 top-0 bottom-0 w-full md:w-[460px] bg-[#0d0907]/98 border-l border-[#ff9933]/30 shadow-[-20px_0_60px_rgba(0,0,0,0.95)] z-[2100] flex flex-col backdrop-blur-3xl"
          >
            <div className="p-6 border-b border-[#ff9933]/20 flex justify-between items-center bg-black/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-[#ff9933]/50 flex items-center justify-center bg-[#ff9933]/15">
                  <Sparkles size={16} className="text-[#ff9933]" />
                </div>
                <div>
                  <h3 className="text-[#ff9933] font-serif text-xl tracking-wide">The Vedic Curator</h3>
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Epigraphy & Shastras</span>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-[#ff9933] transition-all p-2 rounded-full hover:bg-white/5 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-[#ff9933]/20 font-sans">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#ff9933]/10 border border-[#ff9933]/20 text-[#f2e8d5]' : 'bg-white/[0.03] border border-white/10 text-gray-300'}`}>
                    {msg.image && <img src={msg.image} alt="Upload" className="w-full rounded-lg mb-3 border border-[#ff9933]/20 max-h-[160px] object-cover" />}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text || "Searching library shastras..."}</p>
                  </div>
                  <span className="text-[9px] mt-2 text-gray-600 uppercase tracking-widest font-mono pl-1">{msg.sender === 'user' ? 'Traveler' : 'Curator'}</span>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[#ff9933]/20 bg-black/50 flex flex-col gap-3">
              <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider pl-1">
                🔒 Cryptographic channel secure
              </span>

              {imageFile && (
                <div className="relative inline-block self-start">
                  <img src={imageFile} alt="Preview" className="h-16 w-16 object-cover rounded border border-[#ff9933]/50" />
                  <button onClick={() => setImageFile(null)} className="absolute -top-2 -right-2 bg-black text-[#ff9933] rounded-full p-1 border border-[#ff9933]/50 cursor-pointer" aria-label="Remove image">
                    <X size={10} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input type="file" ref={fileRef} onChange={handleImageSelect} accept="image/*" className="hidden" aria-label="Upload image" />
                <button type="button" onClick={() => fileRef.current?.click()} className="p-3 rounded-full bg-white/5 text-[#ff9933] hover:bg-[#ff9933]/25 transition-all border border-[#ff9933]/10 hover:border-[#ff9933]/30 cursor-pointer" aria-label="Attach file">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                <input 
                  type="text" 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  placeholder="Inquire of the Sages..." 
                  className="flex-1 bg-white/5 border border-[#ff9933]/20 rounded-full px-5 py-3 text-sm text-[#f2e8d5] focus:outline-none focus:border-[#ff9933]/50 transition-colors placeholder-gray-600" 
                />
                <button type="submit" className="p-3 rounded-full bg-[#ff9933] text-black hover:scale-105 transition-transform cursor-pointer" aria-label="Send message">
                  <Sparkles size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- MAIN PORTAL COMPONENT (DASHBOARD LAYOUT) ---
export default function IndianCollection() {
  const [activeEra, setActiveEra] = useState('indus');
  const [nameInput, setNameInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState("");
  const [activeExhibit, setActiveExhibit] = useState(null);
  const [mandalaRotation, setMandalaRotation] = useState(0);
  const [isSounding, setIsSounding] = useState(false);

  // Audio refs for Web Audio Synthesizer
  const audioCtxRef = useRef(null);
  const synthNodesRef = useRef([]);

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSoundscape = () => {
    if (isSounding) {
      stopTanpura();
      setIsSounding(false);
    } else {
      startTanpura();
      setIsSounding(true);
    }
  };

  const startTanpura = () => {
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
      mainGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5);
      mainGain.connect(ctx.destination);

      const pitches = [65.41, 130.81, 196.00, 261.63];

      const nodes = pitches.map((pitch, idx) => {
        const osc = ctx.createOscillator();
        osc.frequency.value = pitch;
        osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 180 + (idx * 60);
        filter.Q.value = 1.5;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.01, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(mainGain);

        osc.start(ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12 + (idx * 0.04);
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.015;
        
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        lfo.start(ctx.currentTime);

        return { osc, lfo, gain: gainNode };
      });

      synthNodesRef.current = nodes;
      this.mainGainNode = mainGain;
    } catch (e) {
      console.warn("Audio Context failed to initialize:", e);
    }
  };

  const stopTanpura = () => {
    if (this.mainGainNode && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      this.mainGainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setTimeout(() => {
        if (synthNodesRef.current) {
          synthNodesRef.current.forEach(node => {
            try { node.osc.stop(); node.lfo.stop(); } catch(err){}
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
          try { node.osc.stop(); node.lfo.stop(); } catch(err){}
        });
      }
    };
  }, []);

  // Convert name to Sanskrit phonetics
  const translateNameToSanskrit = (name) => {
    return name.toUpperCase().split('').map(letter => {
      const entry = LETTER_TO_SANSKRIT[letter];
      return entry ? { char: entry.char, letter, name: entry.name } : null;
    }).filter(item => item !== null);
  };

  const translatedName = translateNameToSanskrit(nameInput);

  // Rotation angles for Mandala selector
  const eraRotations = {
    indus: 0,
    vedic: -60,
    maurya: -120,
    gupta: -180,
    chola: -240,
    scribe: -300
  };

  const selectEra = (era) => {
    window.speechSynthesis?.cancel();
    setActiveEra(era);
    setMandalaRotation(eraRotations[era]);
  };

  const eraThemes = {
    indus: {
      accent: '#d9744b',
      glow: 'rgba(217, 116, 75, 0.12)',
      border: 'border-[#d9744b]/30',
      bgGrad: 'from-[#0d0907] via-[#1a110d] to-[#0c0807]',
      title: 'Indus Valley Art & Seals',
      subtitle: 'ROOM I • HARAPPAN CIVIC GALLERY',
      desc: 'Behold the urban planning and artistic brilliance of Mohenjo-Daro and Harappa. Examine early lost-wax metallurgy, soapstone portraits, and detailed merchant seal engravings dating back to 2500 BCE.'
    },
    vedic: {
      accent: '#ffaa44',
      glow: 'rgba(255, 170, 68, 0.18)',
      border: 'border-[#3e6b48]/40',
      bgGrad: 'from-[#060b08] via-[#0f1d13] to-[#050906]',
      title: 'Vedic Wisdom & Philosophy',
      subtitle: 'ROOM II • SANCTUARY OF SOUND',
      desc: 'Observe the sonic texts that laid the foundations of Eastern metaphysics. These palm leaves contain the oldest Sanskrit vibrations, detailing geometrical ritual fire altars and jackwood instruments.'
    },
    maurya: {
      accent: '#e5b37a',
      glow: 'rgba(229, 179, 122, 0.12)',
      border: 'border-[#e5b37a]/30',
      bgGrad: 'from-[#0e0c0a] via-[#201a15] to-[#0e0a09]',
      title: 'Mauryan Edicts & Dhamma',
      subtitle: 'ROOM III • HALL OF MONOLITHS',
      desc: 'Explore the peaceful decrees of Emperor Ashoka. Carved onto massive sandstone pillars and early coins, these monuments outlined universal human rights and tolerances.'
    },
    gupta: {
      accent: '#ffd700',
      glow: 'rgba(255, 215, 0, 0.12)',
      border: 'border-[#ffd700]/30',
      bgGrad: 'from-[#040510] via-[#0a0d24] to-[#03040c]',
      title: 'Gupta Science & Mathematics',
      subtitle: 'ROOM IV • OBSERVATORY CHAMBERS',
      desc: 'Step into the Golden Age of science. Discover ancient astrolabes, rust-resistant metallurgical pillars, and astronomical scripts that defined planetary movements and the mathematical zero.'
    },
    chola: {
      accent: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.18)',
      border: 'border-[#38bdf8]/30',
      bgGrad: 'from-[#040f11] via-[#092227] to-[#030d0f]',
      title: 'Chola Dynasties & Bronzes',
      subtitle: 'ROOM V • CHOLA DYNASTIC VAULTS',
      desc: 'Admire the monolithic granite structures and cast copper-bronzes. The Chola dynasty ruled the southern oceans, engineering grand vimana temples and exquisite lost-wax sculptures of Shiva.'
    },
    scribe: {
      accent: '#8a1a1a',
      glow: 'rgba(138, 26, 26, 0.18)',
      border: 'border-[#8a1a1a]/30',
      bgGrad: 'from-[#0b0706] via-[#1c0f0c] to-[#0a0605]',
      title: 'The Sanskrit Phonetic Translator',
      subtitle: 'ROOM VI • COURT SCRIPTORIUM',
      desc: 'Translate English characters to their Sanskrit Devanagari phonetics. Every letter corresponds to a holy concept of ancient Vedic philosophy. Type your name to forge your own royal seal.'
    }
  };

  const currentTheme = eraThemes[activeEra];

  return (
    <main className="relative w-full min-h-screen bg-[#070605] text-[#f2e8d5] flex flex-col lg:flex-row font-sans selection:bg-[#ff9933]/30 overflow-hidden">
      
      {/* Ornate Mandala Watermark */}
      <div className="absolute inset-0 w-full h-full overflow-hidden opacity-[0.03] pointer-events-none z-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-[85vw] h-[85vw] text-[#ff9933] fill-none stroke-current stroke-[0.1] animate-[spin_300s_linear_infinite]">
          <circle cx="50" cy="50" r="48" />
          <circle cx="50" cy="50" r="38" strokeDasharray="1,2" />
          <circle cx="50" cy="50" r="28" />
          {[...Array(24)].map((_, i) => (
            <line key={i} x1="50" y1="50" x2={50 + 48 * Math.sin((i * 15 * Math.PI) / 180)} y2={50 + 48 * Math.cos((i * 15 * Math.PI) / 180)} />
          ))}
        </svg>
      </div>

      {/* Glowing Floating sparks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => {
          const delay = `${(i * 1.5).toFixed(1)}s`;
          const duration = `${(10 + Math.random() * 8).toFixed(1)}s`;
          const xDist = `${(-150 + Math.random() * 300).toFixed(0)}px`;
          const leftPos = `${(5 + Math.random() * 90).toFixed(0)}%`;
          return (
            <div 
              key={i} 
              className="spark" 
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
        @keyframes float-spark {
          0% { transform: translateY(100vh) translateX(0) scale(0.6); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-10vh) translateX(var(--x-distance)) scale(0.2); opacity: 0; }
        }
        .spark {
          position: absolute;
          bottom: -20px;
          width: 3px;
          height: 3px;
          background: #ff9933;
          border-radius: 50%;
          filter: blur(0.5px);
          box-shadow: 0 0 8px #ffaa44, 0 0 15px #ff9933;
          animation: float-spark var(--duration) linear infinite;
          animation-delay: var(--delay);
        }
        .font-devanagari {
          font-family: 'Noto Serif Devanagari', serif;
        }
        .font-marcellus {
          font-family: 'Marcellus', 'Cinzel', serif;
        }
        .sidebar-carving {
          border-right: 4px double rgba(255, 153, 51, 0.15);
          box-shadow: inset -6px 0 20px rgba(0, 0, 0, 0.5);
        }
        .temple-arch-mask {
          border-radius: 120px 120px 24px 24px;
        }
      `}</style>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Marcellus&family=Noto+Serif+Devanagari:wght@400;700&display=swap" />

      {/* 1. LEFT PANEL: STICKY BRANDING & DHARMAC HAKRA SELECTOR */}
      <section className="w-full lg:w-[380px] lg:min-h-screen flex flex-col justify-between p-8 bg-[#0b0908] z-30 flex-shrink-0 relative sidebar-carving">
        
        {/* Lobby Exit & Soundscape controls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <motion.button 
              onClick={() => useNavigationStore.getState().setPath('/')}
              className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-full border border-white/10 bg-white/5 text-white text-xs font-mono tracking-widest uppercase hover:bg-white/15 transition-all cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={14} className="text-[#ff9933]" /> Lobby
            </motion.button>

            {/* Soundscape Trigger */}
            <button
              onClick={toggleSoundscape}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isSounding 
                  ? 'bg-[#ff9933]/15 border-[#ff9933] text-[#ff9933] shadow-[0_0_15px_rgba(255,153,51,0.25)]' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
              title="Toggle meditative string Tanpura drone"
            >
              {isSounding ? <Music size={15} className="animate-pulse" /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>

        {/* Central Rotating Wheel Selector (DHARMAC HAKRA / KONARK STYLE) */}
        <div className="flex flex-col items-center justify-center my-10 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,51,0.06)_0%,transparent_75%)] pointer-events-none" />

          {/* Interactive Rotating Wheel */}
          <div className="w-[260px] h-[260px] relative flex items-center justify-center rounded-full border border-white/10 p-2">
            
            {/* Glowing Pointer Dial Indicator (Shaped like a traditional brass Diya / flame) */}
            <div className="absolute top-0 flex flex-col items-center -translate-y-4 z-30 pointer-events-none">
              <div className="w-3.5 h-3.5 bg-[#ff9933] rounded-full blur-[2px] shadow-[0_0_10px_#ffaa44]" />
              <div className="w-1.5 h-5 bg-gradient-to-b from-[#ffd700] via-[#ff9933] to-transparent rounded-full" />
            </div>

            <motion.div 
              animate={{ rotate: mandalaRotation }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="w-full h-full relative flex items-center justify-center"
            >
              {/* Richly detailed Indian Temple Wheel SVG */}
              <svg viewBox="0 0 200 200" className="w-full h-full fill-none pointer-events-none">
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#ff9933" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#b87333" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="rimGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#b87333" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#ff9933" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ffd700" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {/* Outer Rim */}
                <circle cx="100" cy="100" r="95" stroke="url(#rimGrad)" strokeWidth="4.5" />
                <circle cx="100" cy="100" r="90" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="2,3" />
                
                {/* Outer decorative notches/petals */}
                {[...Array(24)].map((_, i) => {
                  const rad = (i * 15 * Math.PI) / 180;
                  const x1 = 100 + 90 * Math.sin(rad);
                  const y1 = 100 + 90 * Math.cos(rad);
                  const x2 = 100 + 95 * Math.sin(rad);
                  const y2 = 100 + 95 * Math.cos(rad);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#goldGrad)" strokeWidth="1.5" />;
                })}

                {/* Concentric inner rings */}
                <circle cx="100" cy="100" r="70" stroke="url(#goldGrad)" strokeWidth="1" />
                <circle cx="100" cy="100" r="45" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="4,2" />
                <circle cx="100" cy="100" r="22" stroke="url(#goldGrad)" strokeWidth="2" />
                
                {/* Styled thick spokes */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const xSpoke = 100 + 88 * Math.sin(rad);
                  const ySpoke = 100 + 88 * Math.cos(rad);
                  const xHub = 100 + 22 * Math.sin(rad);
                  const yHub = 100 + 22 * Math.cos(rad);
                  return (
                    <g key={deg}>
                      <line x1={xHub} y1={yHub} x2={xSpoke} y2={ySpoke} stroke="url(#goldGrad)" strokeWidth="2.5" />
                      <circle cx={100 + 55 * Math.sin(rad)} cy={100 + 55 * Math.cos(rad)} r="3.5" fill="url(#goldGrad)" />
                    </g>
                  );
                })}

                {/* Central Hub with Lotus pattern */}
                <circle cx="100" cy="100" r="12" fill="url(#goldGrad)" />
                <path d="M 100 90 C 97 95, 95 97, 100 100 C 105 97, 103 95, 100 90 Z" fill="#0c0a09" />
                <path d="M 100 110 C 97 105, 95 103, 100 100 C 105 103, 103 105, 100 110 Z" fill="#0c0a09" />
                <path d="M 90 100 C 95 97, 97 95, 100 100 C 97 105, 95 103, 90 100 Z" fill="#0c0a09" />
                <path d="M 110 100 C 105 97, 103 95, 100 100 C 103 105, 105 103, 110 100 Z" fill="#0c0a09" />
              </svg>

              {/* Outer Era Button Nodes on the Astrolabe Dial */}
              {[
                { id: 'indus', idx: 'I', label: 'Indus', rot: 0 },
                { id: 'vedic', idx: 'II', label: 'Vedic', rot: 60 },
                { id: 'maurya', idx: 'III', label: 'Maurya', rot: 120 },
                { id: 'gupta', idx: 'IV', label: 'Gupta', rot: 180 },
                { id: 'chola', idx: 'V', label: 'Chola', rot: 240 },
                { id: 'scribe', idx: 'VI', label: 'Scribe', rot: 300 }
              ].map((node) => {
                const isSelected = activeEra === node.id;
                const rad = (node.rot * Math.PI) / 180;
                const x = 100 + 90 * Math.sin(rad);
                const y = 100 + 90 * Math.cos(rad);
                return (
                  <button
                    key={node.id}
                    onClick={() => selectEra(node.id)}
                    style={{
                      position: 'absolute',
                      left: `${x - 20}px`,
                      top: `${y - 20}px`,
                      transform: `rotate(-${mandalaRotation}deg)`
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono border transition-all cursor-pointer shadow-lg hover:scale-110 z-20 ${
                      isSelected 
                        ? 'bg-gradient-to-tr from-[#ff9933] to-[#ffaa44] border-white text-black font-bold scale-105 shadow-[0_0_15px_rgba(255,153,51,0.4)]'
                        : 'bg-[#0c0a09] border-white/15 text-gray-400 hover:text-white hover:border-[#ff9933]/55'
                    }`}
                    title={node.label}
                  >
                    {node.idx}
                  </button>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Curation Info & Inquiry triggers */}
        <div className="flex flex-col gap-5 mt-auto">
          <div className="border-t border-white/10 pt-6">
            <h1 className="font-marcellus tracking-[0.1em] text-2xl text-white">MYTHOS ARCHIVE</h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">Samsara Curation Dashboard</p>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans font-light">
            Rotate the Dharmachakra dial to explore India's timelines. Engage with sacred acoustics, bronze metallurgy, and script translations.
          </p>
          <button 
            onClick={() => { setChatPrefill(`Give me detailed insights about the ${activeEra} era of ancient India.`); setIsChatOpen(true); }}
            className="w-full py-3 bg-white text-black text-xs font-mono font-bold tracking-widest uppercase hover:bg-[#ff9933] transition-colors rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <MessageSquare size={14} /> Ask Sages AI
          </button>
        </div>
      </section>

      {/* 2. RIGHT PANEL: IMAGES BANNERS & EPOCH SHRINERS */}
      <section className="flex-1 min-h-screen relative overflow-y-auto z-10 flex flex-col">
        
        {/* Dynamic Background Wrapper */}
        <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.bgGrad} transition-colors duration-1000 z-0 pointer-events-none`} />

        <div className="relative z-10 flex-1 flex flex-col p-8 md:p-12 lg:p-16 gap-12 max-w-7xl w-full mx-auto justify-center">
          
          {/* Main Stage Era Intro Banner */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEra}
              initial={{ opacity: 0, x: 25, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -25, filter: "blur(4px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/10 pb-8 mt-12 lg:mt-0"
            >
              <div className="flex flex-col gap-2 lg:col-span-7">
                <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: currentTheme.accent }}>
                  {currentTheme.subtitle}
                </span>
                <h2 className="text-4xl md:text-5xl font-marcellus text-[#fffaf0] tracking-tight">
                  {currentTheme.title}
                </h2>
                
                {/* Custom divider */}
                <div className="h-[2px] w-20 mt-3 rounded-full" style={{ backgroundColor: currentTheme.accent }} />
                
                <p className="text-gray-300 text-xs md:text-sm font-light leading-relaxed mt-5 max-w-xl font-sans">
                  {currentTheme.desc}
                </p>
              </div>

              {/* Interactive Banner Frame (Launches Multimedia Modal) */}
              <div 
                onClick={() => setActiveExhibit(activeEra)}
                className="lg:col-span-5 h-44 md:h-52 w-full overflow-hidden temple-arch-mask border relative shadow-[0_15px_40px_rgba(0,0,0,0.85)] group cursor-pointer transition-all duration-500"
                style={{ borderColor: `${currentTheme.accent}40` }}
              >
                {/* Glow box behind */}
                <div className="absolute inset-0 transition-all duration-500 group-hover:scale-105" style={{ backgroundColor: currentTheme.glow }} />
                <img 
                  src={
                    activeEra === 'indus' 
                      ? "https://images.unsplash.com/photo-1608958416715-4fa769eb0707?q=80&w=800&auto=format&fit=crop"
                      : activeEra === 'vedic'
                        ? "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop"
                        : activeEra === 'maurya'
                          ? "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=800&auto=format&fit=crop"
                          : activeEra === 'gupta'
                            ? "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"
                            : activeEra === 'chola'
                              ? "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800&auto=format&fit=crop"
                              : "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=800&auto=format&fit=crop"
                  } 
                  alt="Era Banner" 
                  className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.05] transition-all duration-700 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-black/30" />
                <div 
                  className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-widest px-3.5 py-1.5 rounded-full border"
                  style={{ 
                    backgroundColor: '#0c0a09', 
                    borderColor: `${currentTheme.accent}40`,
                    color: currentTheme.accent
                  }}
                >
                  Multimedia Exhibit
                </div>
                
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span 
                    className="px-5 py-2.5 text-black font-mono text-[10px] font-bold tracking-widest uppercase rounded-full shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                    style={{ backgroundColor: currentTheme.accent }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                    Enter Exhibit Gallery
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Cards Showcase or Scriptorium Box */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeEra === 'scribe' ? (
                /* Sanskrit Scriptorium Page Layout */
                <motion.div
                  key="scribe-era"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center gap-8 text-center"
                >
                  <input 
                    type="text" 
                    value={nameInput} 
                    onChange={(e) => {
                      const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setNameInput(filtered);
                    }}
                    maxLength={12}
                    placeholder="Enter Name (e.g. ARYABHATA)" 
                    className="w-full max-w-sm bg-black/70 border border-[#8a1a1a]/40 hover:border-[#8a1a1a]/60 focus:border-[#8a1a1a] text-[#fffaf0] rounded-full px-6 py-3.5 outline-none transition-all font-mono text-center tracking-widest uppercase placeholder-gray-75 shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)] text-sm"
                  />

                  <div className="w-full relative flex justify-center mt-2">
                    <div className="absolute inset-0 bg-[#8a1a1a]/5 blur-[70px] rounded-full pointer-events-none" />
                    
                    {/* Styled as a Royal Parchment Certificate */}
                    <div className="relative border-4 border-[#8a1a1a] bg-[#f4ebd0] text-[#2c1a13] rounded-[40px] px-8 py-10 flex flex-col items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.95),_0_0_35px_rgba(138,26,26,0.25)] min-w-[280px] max-w-full">
                      <div className="w-24 h-4 border-2 border-b-0 border-[#8a1a1a] rounded-t-full absolute -top-4 left-1/2 -translate-x-1/2" />
                      <div className="w-16 h-2 bg-[#8a1a1a] absolute -bottom-1 left-1/2 -translate-x-1/2 rounded" />
                      
                      {translatedName.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-gray-500">
                          <HelpCircle size={32} className="stroke-1 animate-pulse text-[#8a1a1a]/60" />
                          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8a1a1a]/70">Parchment is blank</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-6 font-sans">
                          {/* Seal Char tokens resembling clay ink stamps */}
                          <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                            {translatedName.map((char, index) => (
                              <motion.div 
                                key={index}
                                initial={{ scale: 0, rotate: -15 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", damping: 13, delay: index * 0.06 }}
                                className="flex flex-col items-center gap-1.5 p-2.5 bg-[#8a1a1a]/5 border border-[#8a1a1a]/30 rounded-lg min-w-[65px] shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                              >
                                <span className="text-3xl text-[#8a1a1a] font-devanagari font-bold">{char.char}</span>
                                <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest border-t border-black/5 pt-1 w-full text-center">
                                  {char.letter}
                                </span>
                              </motion.div>
                            ))}
                          </div>

                          <div className="flex flex-wrap justify-center gap-2 max-w-md">
                            {translatedName.map((char, index) => (
                              <span key={index} className="text-[9px] font-mono px-2 py-1 rounded bg-[#8a1a1a]/5 border border-[#8a1a1a]/10 text-gray-700">
                                <strong className="text-[#8a1a1a]">{char.letter}</strong>: {char.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Dynamic Custom Cards grid depending on the era */
                <motion.div
                  key={activeEra}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {activeEra === 'indus' && INDIAN_ARTIFACTS.indus.map((art, idx) => (
                    <IndusArtifactCard key={idx} index={idx} artifact={art} handleSpeak={handleSpeak} setIsChatOpen={setIsChatOpen} setChatPrefill={setChatPrefill} />
                  ))}
                  {activeEra === 'vedic' && INDIAN_ARTIFACTS.vedic.map((art, idx) => (
                    <VedicArtifactCard key={idx} index={idx} artifact={art} handleSpeak={handleSpeak} setIsChatOpen={setIsChatOpen} setChatPrefill={setChatPrefill} />
                  ))}
                  {activeEra === 'maurya' && INDIAN_ARTIFACTS.maurya.map((art, idx) => (
                    <MauryanArtifactCard key={idx} index={idx} artifact={art} handleSpeak={handleSpeak} setIsChatOpen={setIsChatOpen} setChatPrefill={setChatPrefill} />
                  ))}
                  {activeEra === 'gupta' && INDIAN_ARTIFACTS.gupta.map((art, idx) => (
                    <GuptaArtifactCard key={idx} index={idx} artifact={art} handleSpeak={handleSpeak} setIsChatOpen={setIsChatOpen} setChatPrefill={setChatPrefill} />
                  ))}
                  {activeEra === 'chola' && INDIAN_ARTIFACTS.chola.map((art, idx) => (
                    <CholaArtifactCard key={idx} index={idx} artifact={art} handleSpeak={handleSpeak} setIsChatOpen={setIsChatOpen} setChatPrefill={setChatPrefill} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Curator Chat Drawer */}
      <CuratorChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => { setIsChatOpen(false); setChatPrefill(""); }} 
        prefill={chatPrefill} 
      />

      {/* Exhibit Media Modal */}
      <ExhibitDetailModal 
        isOpen={activeExhibit !== null} 
        onClose={() => setActiveExhibit(null)} 
        exhibitId={activeExhibit}
        setIsChatOpen={setIsChatOpen}
        setChatPrefill={setChatPrefill}
      />

    </main>
  );
}

// --- SUB-COMPONENT: ROOM I CARD (Harappan Terracotta Clay) ---
const IndusArtifactCard = ({ artifact, index, handleSpeak, setIsChatOpen, setChatPrefill }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -8, borderColor: "#d9744b", boxShadow: "0 20px 40px rgba(0,0,0,0.7)" }}
      className="bg-[#18110e] border border-[#d9744b]/20 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden backdrop-blur-md shadow-lg transition-all duration-300 group"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-[#d9744b]/30" />
      <div className="absolute right-4 top-4 text-xl font-mono text-[#d9744b]/5 select-none font-bold group-hover:text-[#d9744b]/10 transition-colors">
        IVC-{String(index + 1).padStart(2, '0')}
      </div>

      {artifact.image && (
        <div className="w-full h-44 overflow-hidden rounded-lg border border-black/40 relative mb-2">
          <img 
            src={artifact.image} 
            alt={artifact.title} 
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 filter sepia-[0.35] contrast-[1.05] brightness-[0.8] group-hover:sepia-0 group-hover:brightness-95"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-75" />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-[#d9744b] font-mono text-[9px] tracking-widest uppercase border-b border-white/5 pb-2">
          {artifact.subtitle}
        </span>
        <h3 className="font-marcellus text-lg text-white font-bold tracking-wide mt-2">
          {artifact.title}
        </h3>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed font-light flex-1 font-sans">
        {artifact.desc}
      </p>

      <div className="bg-[#d9744b]/5 border border-[#d9744b]/10 rounded-lg px-3.5 py-2.5 flex items-center gap-2">
        <span className="text-[10px] font-mono tracking-wider text-[#d9744b]">🏺 {artifact.metric}</span>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
        <button 
          onClick={() => handleSpeak(artifact.desc)}
          className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-[#d9744b] transition-colors cursor-pointer"
          title="Play audio recitation"
        >
          <Volume2 size={12} /> Spoken Guide
        </button>
        <button 
          onClick={() => {
            setChatPrefill(`Tell me more details and historical context about: ${artifact.title} (${artifact.subtitle})`);
            setIsChatOpen(true);
          }}
          className="flex items-center gap-1 text-[10px] font-mono text-[#d9744b] hover:text-white transition-colors cursor-pointer"
        >
          <Info size={10} /> Ask Sages
        </button>
      </div>
    </motion.div>
  );
};

// --- SUB-COMPONENT: ROOM II CARD (Vedic Palm Leaf Scroll) ---
const VedicArtifactCard = ({ artifact, index, handleSpeak, setIsChatOpen, setChatPrefill }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -6, borderColor: "#ffaa44", boxShadow: "0 0 30px rgba(255,170,68,0.12)" }}
      className="bg-[#0b120d] border border-[#3e6b48]/30 rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden backdrop-blur-md shadow-lg transition-all duration-300 group"
    >
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#ffaa44]/[0.02] rounded-full blur-xl pointer-events-none" />
      <div className="absolute left-4 top-4 text-2xl font-mono text-[#3e6b48]/10 select-none pointer-events-none">
        ॐ
      </div>

      {artifact.image && (
        <div className="w-full h-44 overflow-hidden rounded-2xl border border-[#3e6b48]/20 relative mb-2">
          <img 
            src={artifact.image} 
            alt={artifact.title} 
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 filter brightness-[0.8] contrast-[1.05]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-[#3e6b48] font-mono text-[9px] tracking-widest uppercase border-b border-white/5 pb-2">
          {artifact.subtitle}
        </span>
        <h3 className="font-marcellus text-lg text-[#f2e8d5] font-bold mt-2 italic">
          {artifact.title}
        </h3>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed font-light flex-1 font-sans">
        {artifact.desc}
      </p>

      <div className="bg-[#3e6b48]/10 border border-[#3e6b48]/20 rounded-full px-4 py-1.5 flex items-center justify-center gap-2 self-start">
        <span className="text-[9px] font-mono uppercase tracking-wider text-[#ffaa44]">🌿 {artifact.metric}</span>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
        <button 
          onClick={() => handleSpeak(artifact.desc)}
          className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-[#ffaa44] transition-colors cursor-pointer"
          title="Play audio recitation"
        >
          <Volume2 size={12} /> Chant Guide
        </button>
        <button 
          onClick={() => {
            setChatPrefill(`Could you explain the spiritual and astronomical significance of: ${artifact.title}?`);
            setIsChatOpen(true);
          }}
          className="flex items-center gap-1 text-[10px] font-mono text-[#ffaa44] hover:text-white transition-colors cursor-pointer"
        >
          <Info size={10} /> Consult Sage
        </button>
      </div>
    </motion.div>
  );
};

// --- SUB-COMPONENT: ROOM III CARD (Mauryan Sandstone Monolith) ---
const MauryanArtifactCard = ({ artifact, index, handleSpeak, setIsChatOpen, setChatPrefill }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
      whileHover={{ scale: 1.02, borderColor: "#e5b37a", boxShadow: "0 25px 40px rgba(0,0,0,0.8)" }}
      className="bg-[#1b1713] border-4 border-[#322a24] rounded-none p-6 flex flex-col gap-4 relative overflow-hidden shadow-lg transition-all duration-300 group"
    >
      <div className="absolute bottom-2 right-2 font-serif text-5xl text-[#e5b37a]/[0.01] select-none pointer-events-none">
        𓋹
      </div>

      {artifact.image && (
        <div className="w-full h-44 overflow-hidden border-2 border-[#322a24] relative mb-2">
          <img 
            src={artifact.image} 
            alt={artifact.title} 
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-103 filter contrast-[1.1] grayscale-[30%] brightness-[0.8]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent" />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-[#e5b37a] font-mono text-[9px] tracking-widest uppercase border-b border-white/5 pb-2">
          {artifact.subtitle}
        </span>
        <h3 className="font-marcellus text-lg text-white font-black uppercase tracking-wider mt-2">
          {artifact.title}
        </h3>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed font-sans flex-1">
        {artifact.desc}
      </p>

      <div className="border border-[#e5b37a]/30 rounded-none px-3.5 py-2 bg-[#e5b37a]/5">
        <span className="text-[10px] font-mono tracking-wider text-[#e5b37a] font-bold uppercase font-sans">🏛️ {artifact.metric}</span>
      </div>

      <div className="flex items-center justify-between border-t border-[#322a24] pt-4 mt-2">
        <button 
          onClick={() => handleSpeak(artifact.desc)}
          className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-[#e5b37a] transition-colors cursor-pointer"
          title="Play audio recitation"
        >
          <Volume2 size={12} /> Monolith Edict
        </button>
        <button 
          onClick={() => {
            setChatPrefill(`What was the social and moral decree behind: ${artifact.title}?`);
            setIsChatOpen(true);
          }}
          className="flex items-center gap-1 text-[10px] font-mono text-[#e5b37a] hover:text-white transition-colors cursor-pointer"
        >
          <Info size={10} /> Consult Scribe
        </button>
      </div>
    </motion.div>
  );
};

// --- SUB-COMPONENT: ROOM IV CARD (Gupta Observatory Glass) ---
const GuptaArtifactCard = ({ artifact, index, handleSpeak, setIsChatOpen, setChatPrefill }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -10, borderColor: "#ffd700", boxShadow: "0 0 35px rgba(255,215,0,0.12)" }}
      className="bg-[#080918]/50 border border-[#ffd700]/15 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-lg transition-all duration-300 group"
    >
      <div className="absolute -right-8 -top-8 w-24 h-24 border border-white/5 rounded-full pointer-events-none group-hover:border-[#ffd700]/10 transition-colors" />
      <div className="absolute right-4 top-4 text-xs font-mono text-[#818cf8]/20 select-none">
        ☀
      </div>

      {artifact.image && (
        <div className="w-full h-44 overflow-hidden rounded-xl border border-white/10 relative mb-2">
          <img 
            src={artifact.image} 
            alt={artifact.title} 
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 filter brightness-[0.8] saturate-[0.85]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080918] via-transparent to-transparent" />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-[#818cf8] font-mono text-[9px] tracking-widest uppercase border-b border-white/5 pb-2">
          {artifact.subtitle}
        </span>
        <h3 className="font-marcellus text-lg text-[#ffd700] font-medium tracking-wide mt-2">
          {artifact.title}
        </h3>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed font-sans font-light flex-1">
        {artifact.desc}
      </p>

      <div className="bg-[#818cf8]/10 border border-[#818cf8]/20 rounded-md px-3 py-2 flex items-center gap-2">
        <span className="text-[10px] font-mono tracking-wider text-[#ffd700]">✦ {artifact.metric}</span>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
        <button 
          onClick={() => handleSpeak(artifact.desc)}
          className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-[#ffd700] transition-colors cursor-pointer"
          title="Play audio recitation"
        >
          <Volume2 size={12} /> Stellar Audio
        </button>
        <button 
          onClick={() => {
            setChatPrefill(`What mathematical or scientific principles are showcased in: ${artifact.title}?`);
            setIsChatOpen(true);
          }}
          className="flex items-center gap-1 text-[10px] font-mono text-[#ffd700] hover:text-white transition-colors cursor-pointer"
        >
          <Info size={10} /> Ask Astronomer
        </button>
      </div>
    </motion.div>
  );
};

// --- SUB-COMPONENT: ROOM V CARD (Chola Granite Temple Plaque) ---
const CholaArtifactCard = ({ artifact, index, handleSpeak, setIsChatOpen, setChatPrefill }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -6, borderColor: "#38bdf8", boxShadow: "0 20px 45px rgba(0,0,0,0.8)" }}
      className="bg-[#071012] border-2 border-slate-800 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-lg transition-all duration-300 group"
    >
      <div className="absolute top-1 left-1 right-1 h-[2px] bg-slate-700/50" />
      <div className="absolute top-2 left-2 right-2 h-[1px] bg-slate-700/20" />
      <div className="absolute right-4 top-4 text-2xl font-mono text-[#38bdf8]/5 select-none pointer-events-none">
        ⚓
      </div>

      {artifact.image && (
        <div className="w-full h-44 overflow-hidden rounded border border-slate-800 relative mb-2">
          <img 
            src={artifact.image} 
            alt={artifact.title} 
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 filter contrast-[1.1] brightness-[0.8]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071012] via-transparent to-transparent" />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-[#38bdf8] font-mono text-[9px] tracking-widest uppercase border-b border-white/5 pb-2">
          {artifact.subtitle}
        </span>
        <h3 className="font-marcellus text-lg text-[#f2e8d5] font-bold mt-2">
          {artifact.title}
        </h3>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed font-sans flex-1">
        {artifact.desc}
      </p>

      <div className="bg-[#38bdf8]/5 border border-[#38bdf8]/15 rounded px-3 py-2">
        <span className="text-[10px] font-mono tracking-wider text-[#38bdf8] font-bold uppercase">🔱 {artifact.metric}</span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
        <button 
          onClick={() => handleSpeak(artifact.desc)}
          className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-[#38bdf8] transition-colors cursor-pointer"
          title="Play audio recitation"
        >
          <Volume2 size={12} /> Temple Guide
        </button>
        <button 
          onClick={() => {
            setChatPrefill(`Could you explain the maritime influence or dravidian engineering of: ${artifact.title}?`);
            setIsChatOpen(true);
          }}
          className="flex items-center gap-1 text-[10px] font-mono text-[#38bdf8] hover:text-white transition-colors cursor-pointer"
        >
          <Info size={10} /> Inquire Dynasty
        </button>
      </div>
    </motion.div>
  );
};

// --- DATA: EXHIBIT MEDIA METADATA ---
const EXHIBIT_MEDIA = {
  indus: {
    title: "Room I: Indus Valley Civilization",
    desc: "Behold the brick grids and merchant trade seals of Harappa and Mohenjo-Daro, demonstrating civic engineering three millennia ago.",
    videoUrl: "https://www.youtube.com/embed/n7ndRwqJYDM",
    images: [
      "https://images.unsplash.com/photo-1608958416715-4fa769eb0707?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620616611484-9fa572de674a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Terracotta ruins and well planning in Harappan archeological excavations.",
      "Lost-wax copper-bronze miniature sculpture of the Dancing Girl.",
      "Soapstone carving detail depicting a Priest-King bearded portrait.",
      "Monolithic structural grids and unified scales uncovered at Mohenjo-Daro."
    ]
  },
  vedic: {
    title: "Room II: Vedic Wisdom & Philosophy",
    desc: "Delve into the sacred Sanskrit hymns, fire altar structures, and ancient acoustics that defined early Indian philosophy.",
    videoUrl: "https://www.youtube.com/embed/zH8wBw5V1Ew",
    images: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Palm leaf transcription of Vedic Rigveda hymns in ancient Sanskrit.",
      "The geometric layouts of fire altars defined in the Sulba Sutras.",
      "Ancient Saraswati Veena details, representing music, art, and wisdom.",
      "Vedic forest meditation settings where Upanishadic teachings were born."
    ]
  },
  maurya: {
    title: "Room III: Mauryan Edicts & Peace",
    desc: "Examine the polished sandstone pillars erected by Emperor Ashoka, proclaiming Dhamma (moral law) across the empire.",
    videoUrl: "https://www.youtube.com/embed/K836eB6n3eM",
    images: [
      "https://images.unsplash.com/photo-1600577916048-804c9191e36c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613143577717-a0f60baee436?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Four back-to-back Asiatic Lions capital carving at Sarnath.",
      "Brahmi script inscriptions carved upon Ashokan stone pillars.",
      "Mauryan punch-marked silver coins showing regional trade emblems.",
      "Excavation sites at Pataliputra, the great capital of the Mauryan Empire."
    ]
  },
  gupta: {
    title: "Room IV: Gupta Science & Math",
    desc: "Observe the inventions of zero, stellar calculations, and corrosion-resistant metal columns in India's Golden Age.",
    videoUrl: "https://www.youtube.com/embed/aF3gA5tWnrs",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Ancient observational instrumentation designs mapping lunar calculations.",
      "The rust-resistant Iron Pillar of Delhi, an alloy marvel of Mehrauli.",
      "Seated Buddha stone sculpture from the Sarnath Gupta artisan school.",
      "Classical gold dinar coinage showing royal figures and deities."
    ]
  },
  chola: {
    title: "Room V: Chola Dynasties & Bronzes",
    desc: "Explore the bronze casting masterpieces of Shiva Nataraja and the massive granite vimanas built by the Chola emperors.",
    videoUrl: "https://www.youtube.com/embed/1vR_sO0kMog",
    images: [
      "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608958416715-4fa769eb0707?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Bronze lost-wax casting of Lord Shiva in his Cosmic Dance layout.",
      "The massive granite Brihadisvara Vimana tower at Thanjavur.",
      "Bronze copper charters bound by tiger emblem rings of trade councils.",
      "Intricate Dravidian stone carvings along South Indian temple base bands."
    ]
  },
  scribe: {
    title: "Room VI: Sanskrit Scriptorium",
    desc: "Discover Sanskrit, the sacred mathematical language. Sages mapped sounds to Devanagari symbols, representing keys of consciousness.",
    videoUrl: "https://www.youtube.com/embed/JSqS-S_g7zI",
    images: [
      "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503174971373-b1f69850bded?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Vedic Devanagari script carved on temple sanctum architraves.",
      "Palm leaf manuscripts recording grammar codes of Panini.",
      "Sanskrit mantra inscriptions painted on early ritual copper plates.",
      "Stone temples containing ancient library chambers of manuscript scribes."
    ]
  }
};

// --- SUB-COMPONENT: EXHIBIT DETAIL MODAL (VIDEOS & IMAGES PLAYER) ---
const ExhibitDetailModal = ({ isOpen, onClose, exhibitId, setIsChatOpen, setChatPrefill }) => {
  const [activeTab, setActiveTab] = useState('video');
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('video');
      setCurrentImgIdx(0);
    }
  }, [isOpen, exhibitId]);

  if (!isOpen || !exhibitId) return null;

  const data = EXHIBIT_MEDIA[exhibitId];
  if (!data) return null;

  const nextImage = () => {
    setCurrentImgIdx(prev => (prev + 1) % data.images.length);
  };

  const prevImage = () => {
    setCurrentImgIdx(prev => (prev - 1 + data.images.length) % data.images.length);
  };

  let activeBorder = "border-[#ff9933]";
  let themeColorText = "text-[#ff9933]";
  let themeColorBg = "bg-[#ff9933]";
  
  if (exhibitId === 'indus') {
    activeBorder = "border-[#d9744b]";
    themeColorText = "text-[#d9744b]";
    themeColorBg = "bg-[#d9744b]";
  } else if (exhibitId === 'vedic') {
    activeBorder = "border-[#ffaa44]";
    themeColorText = "text-[#ffaa44]";
    themeColorBg = "bg-[#ffaa44]";
  } else if (exhibitId === 'maurya') {
    activeBorder = "border-[#e5b37a]";
    themeColorText = "text-[#e5b37a]";
    themeColorBg = "bg-[#e5b37a]";
  } else if (exhibitId === 'gupta') {
    activeBorder = "border-[#ffd700]";
    themeColorText = "text-[#ffd700]";
    themeColorBg = "bg-[#ffd700]";
  } else if (exhibitId === 'chola') {
    activeBorder = "border-[#38bdf8]";
    themeColorText = "text-[#38bdf8]";
    themeColorBg = "bg-[#38bdf8]";
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-10 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl z-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-5xl bg-[#0f0c0b]/95 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] z-10 flex flex-col lg:flex-row max-h-[90vh] lg:max-h-[80vh] backdrop-blur-2xl"
        >
          {/* Left Column: Media Player */}
          <div className="flex-1 bg-black flex flex-col relative justify-center min-h-[300px] md:min-h-[400px]">
            {activeTab === 'video' ? (
              <div className="w-full h-full aspect-video lg:aspect-auto lg:h-full relative bg-black flex items-center justify-center">
                <iframe
                  src={data.videoUrl}
                  title={data.title}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
                <motion.img
                  key={currentImgIdx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  src={data.images[currentImgIdx]}
                  alt={`${data.title} Slide ${currentImgIdx + 1}`}
                  className="w-full h-full object-contain max-h-[70vh]"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/5 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    {data.captions[currentImgIdx]}
                  </p>
                  <span className="text-[10px] font-mono text-gray-500 mt-1 block">
                    Exhibit {currentImgIdx + 1} of {data.images.length}
                  </span>
                </div>

                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  &larr;
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  &rarr;
                </button>
              </div>
            )}

            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider uppercase border transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? `${themeColorBg} text-black border-[#fffaf0]/30 font-bold shadow-lg`
                    : 'bg-black/65 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                🎥 Video Guide
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider uppercase border transition-all cursor-pointer ${
                  activeTab === 'gallery'
                    ? `${themeColorBg} text-black border-[#fffaf0]/30 font-bold shadow-lg`
                    : 'bg-black/65 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                📷 Image Gallery
              </button>
            </div>
          </div>

          {/* Right Column: Exhibit Details */}
          <div className="w-full lg:w-[380px] p-6 md:p-8 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0e0c0b]/90 justify-between overflow-y-auto font-sans">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Multimedia Exhibit</span>
                  <h3 className="font-marcellus text-2xl text-[#f2e8d5] tracking-wide mt-1">
                    {data.title}
                  </h3>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1.5 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed font-light mt-6">
                {data.desc}
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <span className={`text-[10px] font-mono uppercase tracking-wider ${themeColorText}`}>Multimedia Contents:</span>
                <div className="flex items-center gap-2.5 text-xs text-gray-300 font-sans bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <span>🎬</span>
                  <span>1x Educational Documentary Video</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300 font-sans bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <span>🖼️</span>
                  <span>{data.images.length}x High-Resolution Gallery Slides</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/5 pt-6 mt-6">
              {exhibitId === 'scribe' && (
                <p className="text-[10px] text-gray-500 font-mono text-center">
                  💡 Type in Room VI below to translate names.
                </p>
              )}
              
              <button
                onClick={() => {
                  setChatPrefill(`Could you explain the historical and philosophical context of: ${data.title}? I've just watched the educational video and browsed the gallery.`);
                  setIsChatOpen(true);
                  onClose();
                }}
                className={`w-full py-3 px-4 rounded-xl text-black text-xs font-mono font-bold tracking-widest uppercase hover:brightness-110 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${themeColorBg}`}
              >
                <span>💬</span> Ask Curator AI
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-gray-400 hover:text-white text-xs font-mono tracking-widest uppercase transition-all cursor-pointer text-center"
              >
                Close Gallery
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
