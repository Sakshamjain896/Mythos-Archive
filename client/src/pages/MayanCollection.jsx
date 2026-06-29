import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Volume2, MessageSquare, X, Info, 
  HelpCircle, Sparkles, Compass, Music, VolumeX, Eye, BookOpen
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls, Center, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import MayanArtifact from '../components/canvas/MayanArtifact';
import { useNavigationStore } from '../store/navigationStore';

// --- 3D CANVASES & VFX FOR MAYA ---
function VFXParticles({ count = 100, color = "#10b981" }) {
  const pointsRef = useRef();
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 5;
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
        positions[i * 3 + 1] += 0.003 * particles.speeds[i];
        if (positions[i * 3 + 1] > 2.5) {
          positions[i * 3 + 1] = -2.5;
        }
        positions[i * 3] += Math.sin(time + i) * 0.001;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y += 0.001;
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
        size={0.05}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function ProceduralRelic({ type, color }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.006;
      meshRef.current.rotation.x += 0.002;
    }
  });

  if (type === 'xibalba') {
    return (
      <group ref={meshRef}>
        <mesh castShadow>
          <sphereGeometry args={[0.3, 32, 16]} />
          <meshPhysicalMaterial color="#082b1b" metalness={0.1} roughness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
        <mesh position={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.28, 0.4, 32]} />
          <meshStandardMaterial color="#0a3c26" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.02, 16, 100]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    );
  }

  if (type === 'highland') {
    return (
      <group ref={meshRef}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <meshPhysicalMaterial color="#2d2d2d" metalness={0.2} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.65, 0]} castShadow>
          <boxGeometry args={[0.5, 0.2, 0.5]} />
          <meshStandardMaterial color="#1e1e1e" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  if (type === 'postclassic') {
    return (
      <group ref={meshRef}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.9, 0.2, 0.5]} />
          <meshStandardMaterial color="#404040" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.7, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#303030" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.15, 0.15, 16]} />
          <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    );
  }

  if (type === 'scribe') {
    return (
      <group ref={meshRef}>
        <mesh castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.08, 32]} rotation={[Math.PI / 2, 0, 0]} />
          <meshPhysicalMaterial color="#3c2217" metalness={0.1} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.05]} castShadow>
          <torusGeometry args={[0.3, 0.02, 16, 100]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <octahedronGeometry args={[0.1]} />
          <meshStandardMaterial color={color} metalness={1} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh ref={meshRef} castShadow>
      <dodecahedronGeometry args={[0.42]} />
      <meshPhysicalMaterial color="#0c2f1f" metalness={0.9} roughness={0.1} clearcoat={1} />
    </mesh>
  );
}

function Exhibit3DCanvas({ artifactType, color = "#10b981", modelScale = 1.0 }) {
  return (
    <div className="w-full h-full relative font-sans" style={{ minHeight: '180px' }}>
      <Canvas
        camera={{ position: [0, 0, 3.0], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <ambientLight intensity={1.2} />
        <spotLight position={[4, 4, 4]} intensity={2.5} angle={0.4} penumbra={1} castShadow color={color} />
        <pointLight position={[-4, -4, -2]} intensity={0.5} color="#ffffff" />
        
        <PresentationControls
          global
          zoom={0.9}
          polar={[-0.2, 0.4]}
          azimuth={[-Infinity, Infinity]}
          config={{ mass: 1, tension: 200 }}
        >
          <Center>
            {artifactType === 'classic' ? (
              <Suspense fallback={
                <mesh castShadow>
                  <sphereGeometry args={[0.36, 32, 32]} />
                  <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} />
                </mesh>
              }>
                <MayanArtifact scale={modelScale} position={[0, -0.15, 0]} />
              </Suspense>
            ) : (
              <ProceduralRelic type={artifactType} color={color} />
            )}
          </Center>
        </PresentationControls>
        
        <VFXParticles count={70} color={color} />
      </Canvas>
    </div>
  );
}

// --- HIEROGLYPHS DATABASE ---
const LETTER_TO_GLYPH = {
  A: { glyph: "Ajaw", meaning: "Ruler / Sun Lord" },
  B: { glyph: "B'alam", meaning: "Sacred Jaguar" },
  C: { glyph: "Chaan", meaning: "Celestial Serpent" },
  D: { glyph: "Dresden", meaning: "Bark Codex Scroll" },
  E: { glyph: "Eek'", meaning: "Star / Cosmic Venus" },
  F: { glyph: "Fire (K'ahk')", meaning: "Volcanic Spark" },
  G: { glyph: "Glyph (Tz'ib')", meaning: "Royal Inscriber" },
  H: { glyph: "Ha'", meaning: "Sacred Well Water" },
  I: { glyph: "Ik'", meaning: "Wind / Vital Breath" },
  J: { glyph: "Jade (Yax)", meaning: "Jadeite / Sacred Green" },
  K: { glyph: "K'in", meaning: "Day / Solar Cycle" },
  L: { glyph: "Lamat", meaning: "Venus / Star Star" },
  M: { glyph: "Manik'", meaning: "Hand / Earth Power" },
  N: { glyph: "Nal", meaning: "Sprouting Maize God" },
  O: { glyph: "Och", meaning: "Underworld Opossum" },
  P: { glyph: "Pop", meaning: "Woven Throne Mat" },
  Q: { glyph: "Quetzal (K'uk')", meaning: "Plumed Feather" },
  R: { glyph: "Ruler (Halach Uinik)", meaning: "Divine Representative" },
  S: { glyph: "Sacred (Ch'ul)", meaning: "Ethereal Fluid" },
  T: { glyph: "Tzolk'in", meaning: "Sacred 260-Day Wheel" },
  U: { glyph: "Uix", meaning: "Jaguar / Earth Spirit" },
  V: { glyph: "Vessel (Lak)", meaning: "Ceremonial Bowl" },
  W: { glyph: "Wayib'", meaning: "Ghost Shadow Days" },
  X: { glyph: "Xibalba", meaning: "Labyrinth Underworld" },
  Y: { glyph: "Yaxkin", meaning: "New Dawn / Sun Season" },
  Z: { glyph: "Zotz'", meaning: "Sacred Bat Spirit" }
};

// --- ARTIFACTS DATABASE ---
const MAYAN_ARTIFACTS = {
  xibalba: [
    {
      title: "Obsidian Bloodletting Lancet",
      subtitle: "Sacred Caves of Copán • Classic Period (c. 600 CE)",
      desc: "A ceremonial lancet knapped from black obsidian. Used by Mayan kings in bloodletting rites to pierce the tongue or ears, creating a conduit to release life force and evoke the vision serpent.",
      metric: "Material: Volcanic Glass Obsidian",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Urn of the Jaguar God",
      subtitle: "Underworld Chambers • Preclassic Period (c. 400 BCE)",
      desc: "A terracotta burial urn depicting the Jaguar God of the Underworld (Sun during night). Featuring hollowed eyes and a dynamic facial shape, it accompanied elite rulers into the afterlife.",
      metric: "Material: Polychrome Terracotta Clay",
      image: "https://images.unsplash.com/photo-1608958416715-4fa769eb0707?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Jade Mosaic Death Mask",
      subtitle: "Cenote Cache • Classic Period (c. 750 CE)",
      desc: "A burial mask crafted from interlocking tiles of jadeite, pyrite, and shell. Discovered in sacred chambers, it sealed the physical features of deceased royalty for their trek through Xibalba.",
      metric: "Relic: Jadeite Mosaic Plaque",
      image: "https://images.unsplash.com/photo-1620616611484-9fa572de674a?q=80&w=600&auto=format&fit=crop"
    }
  ],
  highland: [
    {
      title: "Basalt Stela 11 Danzante",
      subtitle: "Kaminaljuyu Plaza • Preclassic Era (c. 300 BCE)",
      desc: "A massive volcanic basalt slab depicting a high priest or monarch wearing a towering bird deity headdress. Inscribed with early proto-Mayan iconographic frames.",
      metric: "Material: Polished Volcanic Basalt",
      image: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Cocijo Rain God Vessel",
      subtitle: "Highland Valley • Preclassic Era (c. 500 BCE)",
      desc: "An elaborate grey ceramic vessel representing the rain and lightning deity. Its large eyebrows and fanged mouth symbolize the heavy monsoon storms vital to early maize crops.",
      metric: "Relic: Incised Grey Clay Pottery",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Polyhedral Obsidian Core",
      subtitle: "El Chayal Quarry • Trade Network Archive",
      desc: "A cylindrical obsidian core showing perfectly parallel flake scars. These cores were traded across the highlands to produce razor-sharp blades for daily use and rituals.",
      metric: "Trade: Raw Obsidian Core Block",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop"
    }
  ],
  classic: [
    {
      title: "Sarcophagus Lid of Pakal",
      subtitle: "Temple of Inscriptions, Palenque (c. 683 CE)",
      desc: "A masterpiece of Mayan relief showing King K'inich Janaab Pakal falling back into the jaws of the Underworld dragon, while the sacred World Tree of Life rises from his torso.",
      metric: "Sculpture: Carved Limestone Monolith",
      image: "https://images.unsplash.com/photo-1600577916048-804c9191e36c?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Tikal Jade Mosaic Mask",
      subtitle: "Burial 116, Tikal • Classic Period (c. 720 CE)",
      desc: "A royal green jade mask representing the ruler Jasaw Chan K'awiil. Reconstructed from over a hundred individual polished jadeite stones with obsidian pupils.",
      metric: "Material: Imperial Green Jadeite",
      image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "The Palace Tablet of Palenque",
      subtitle: "Palace Sanctuary • Classic Period (c. 715 CE)",
      desc: "A detailed lintel carving outlining the coronation of King Kan Joy Chitam II, flanked by his parents. It is a major historical ledger of dynastic succession.",
      metric: "Relic: Fine-Grain Limestone Relief",
      image: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=600&auto=format&fit=crop"
    }
  ],
  postclassic: [
    {
      title: "The Reclining Chacmool",
      subtitle: "Temple of Warriors, Chichen Itza (c. 1000 CE)",
      desc: "A stone sculpture of a reclining man with his head turned 90 degrees, holding a sacrificial offering bowl on his stomach. Represents a divine messenger between heaven and Earth.",
      metric: "Sculpture: Carved Limestone Statue",
      image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Venus Gnomon Observatory",
      subtitle: "El Caracol, Chichen Itza (c. 900 CE)",
      desc: "Astronomical window alignments used to track the cycle of Venus. Mayan priests calculated the planet's orbit with a tiny margin of error relative to modern astronomy.",
      metric: "Science: Solar Alignments & Maps",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Gold repoussé Disc of the Well",
      subtitle: "Sacred Cenote Cache • Postclassic Period",
      desc: "A stamped gold disc showing battles between Mayan warriors and Toltec invaders. Plunged into the sacred well as an offering to the rain deity Chaac.",
      metric: "Metal: Stamped Pure Gold Foil Disc",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop"
    }
  ]
};

// --- CHAT DRAWER COMPONENT ---
const CuratorChatDrawer = ({ isOpen, onClose, prefill }) => {
  const [messages, setMessages] = useState([
    { text: "Greetings, voyager. I am the Curator of the Mayan Forests. Ask me about bloodletting rituals, Pakal's limestone vault, Chichen Itza observatories, or Tzolk'in mathematics.", sender: "ai" }
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
        newMsgs[newMsgs.length - 1].text = "Error: Connection to the Mayan Codex Vaults was broken.";
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
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[2000]"
          />
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 26, stiffness: 180 }} 
            className="fixed right-0 top-0 bottom-0 w-full md:w-[460px] bg-[#060c08]/98 border-l border-[#10b981]/30 shadow-[-20px_0_60px_rgba(0,0,0,0.95)] z-[2100] flex flex-col backdrop-blur-3xl"
          >
            <div className="p-6 border-b border-[#10b981]/20 flex justify-between items-center bg-black/55">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-[#10b981]/50 flex items-center justify-center bg-[#10b981]/15">
                  <Sparkles size={16} className="text-[#10b981]" />
                </div>
                <div>
                  <h3 className="text-[#10b981] font-serif text-xl tracking-wide">The Mayan Scribe</h3>
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Codex Interpreter</span>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-[#10b981] transition-all p-2 rounded-full hover:bg-white/5 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-[#10b981]/20 font-sans">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#10b981]/10 border border-[#10b981]/20 text-[#f0fdf4]' : 'bg-white/[0.03] border border-white/10 text-gray-300'}`}>
                    {msg.image && <img src={msg.image} alt="Upload" className="w-full rounded-lg mb-3 border border-[#10b981]/20 max-h-[160px] object-cover" />}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text || "De-coding hieroglyph seals..."}</p>
                  </div>
                  <span className="text-[9px] mt-2 text-gray-600 uppercase tracking-widest font-mono pl-1">{msg.sender === 'user' ? 'Explorer' : 'Scribe'}</span>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[#10b981]/20 bg-black/55 flex flex-col gap-3">
              <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider pl-1">
                🔒 Cenote transmission secured
              </span>

              {imageFile && (
                <div className="relative inline-block self-start">
                  <img src={imageFile} alt="Preview" className="h-16 w-16 object-cover rounded border border-[#10b981]/50" />
                  <button onClick={() => setImageFile(null)} className="absolute -top-2 -right-2 bg-black text-[#10b981] rounded-full p-1 border border-[#10b981]/50 cursor-pointer" aria-label="Remove image">
                    <X size={10} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input type="file" ref={fileRef} onChange={handleImageSelect} accept="image/*" className="hidden" aria-label="Upload image" />
                <button type="button" onClick={() => fileRef.current?.click()} className="p-3 rounded-full bg-white/5 text-[#10b981] hover:bg-[#10b981]/25 transition-all border border-[#10b981]/10 hover:border-[#10b981]/30 cursor-pointer" aria-label="Attach file">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                <input 
                  type="text" 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  placeholder="Inquire of the scribe..." 
                  className="flex-1 bg-white/5 border border-[#10b981]/20 rounded-full px-5 py-3 text-sm text-[#f0fdf4] focus:outline-none focus:border-[#10b981]/50 transition-colors placeholder-gray-700" 
                />
                <button type="submit" className="p-3 rounded-full bg-[#10b981] text-black hover:scale-105 transition-transform cursor-pointer" aria-label="Send message">
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

// --- MAIN PORTAL COMPONENT ---
export default function MayanCollection() {
  const [hasEnteredTemple, setHasEnteredTemple] = useState(false);
  const [activeLeaf, setActiveLeaf] = useState(null); // null = Codex Deck view, non-null = unrolled leaf view
  const [nameInput, setNameInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState("");
  const [activeExhibit, setActiveExhibit] = useState(null);
  const [isSounding, setIsSounding] = useState(false);

  // Audio nodes refs for jungle ambient synthesizer
  const audioCtxRef = useRef(null);
  const synthNodesRef = useRef([]);
  const mainGainNodeRef = useRef(null);

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSoundscape = () => {
    if (isSounding) {
      stopJungleAudio();
      setIsSounding(false);
    } else {
      startJungleAudio();
      setIsSounding(true);
    }
  };

  const startJungleAudio = () => {
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

      // 1. Synthesize a misty jungle wind (filtered noise oscillator)
      const windOsc = ctx.createOscillator();
      windOsc.type = 'triangle';
      windOsc.frequency.value = 75;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 130;
      windFilter.Q.value = 0.6;

      const windGain = ctx.createGain();
      windGain.gain.value = 0.22;

      windOsc.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(mainGain);
      windOsc.start();

      // slow modulation LFO
      const windLfo = ctx.createOscillator();
      windLfo.frequency.value = 0.06;
      const windLfoGain = ctx.createGain();
      windLfoGain.gain.value = 45;
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start();

      // 2. Synthesize deep ritual Shamanic Drumbeat (low frequency sine sweeps)
      const playDrum = () => {
        if (!audioCtxRef.current || !isSounding) return;
        const now = ctx.currentTime;
        const drumOsc = ctx.createOscillator();
        drumOsc.type = 'sine';
        drumOsc.frequency.setValueAtTime(58, now);
        drumOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);

        const drumGain = ctx.createGain();
        drumGain.gain.setValueAtTime(0, now);
        drumGain.gain.linearRampToValueAtTime(0.4, now + 0.02);
        drumGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        drumOsc.connect(drumGain);
        drumGain.connect(mainGain);
        drumOsc.start(now);
        drumOsc.stop(now + 0.6);
      };

      const drumIntervalId = setInterval(playDrum, 2000); // 60 BPM Shaman Heartbeat

      // 3. Synthesize occasional jungle bird/cricket sweeps
      const playChirp = () => {
        if (!audioCtxRef.current || !isSounding) return;
        const now = ctx.currentTime;
        const chirpOsc = ctx.createOscillator();
        chirpOsc.type = 'sine';
        chirpOsc.frequency.setValueAtTime(1500 + Math.random() * 300, now);
        chirpOsc.frequency.exponentialRampToValueAtTime(2600 + Math.random() * 400, now + 0.12);

        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0, now);
        chirpGain.gain.linearRampToValueAtTime(0.012, now + 0.01);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        chirpOsc.connect(chirpGain);
        chirpGain.connect(mainGain);
        chirpOsc.start(now);
        chirpOsc.stop(now + 0.18);
      };

      const chirpIntervalId = setInterval(playChirp, 3800);

      synthNodesRef.current = [
        windOsc, windLfo, 
        { stop: () => { clearInterval(drumIntervalId); clearInterval(chirpIntervalId); } }
      ];
      mainGainNodeRef.current = mainGain;

    } catch (e) {
      console.warn("Mayan Soundscape synthesis failed:", e);
    }
  };

  const stopJungleAudio = () => {
    if (mainGainNodeRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      mainGainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
      setTimeout(() => {
        if (synthNodesRef.current) {
          synthNodesRef.current.forEach(node => {
            try { node.stop(); } catch(err){}
          });
          synthNodesRef.current = [];
        }
      }, 1100);
    }
  };

  // Heavy stone door scrape/rumble sound effect on transition
  const playStoneDoorSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const doorGain = ctx.createGain();
      doorGain.gain.setValueAtTime(0, ctx.currentTime);
      doorGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
      doorGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
      doorGain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(45, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(25, ctx.currentTime + 1.5);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(90, ctx.currentTime);

      osc1.connect(filter);
      filter.connect(doorGain);
      osc1.start();
      osc1.stop(ctx.currentTime + 1.8);
    } catch(err){}
  };

  // Play a soft stone-friction click sound when navigating leaves
  const playStoneClick = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const chimeGain = ctx.createGain();
      chimeGain.gain.setValueAtTime(0, ctx.currentTime);
      chimeGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      chimeGain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.12);
      osc.connect(chimeGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch(err){}
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

  const translateNameToGlyph = (name) => {
    return name.toUpperCase().split('').map(letter => {
      const entry = LETTER_TO_GLYPH[letter];
      return entry ? { glyph: entry.glyph, letter, meaning: entry.meaning } : null;
    }).filter(item => item !== null);
  };

  const translatedGlyphs = translateNameToGlyph(nameInput);

  const renderMayanMath = (count) => {
    if (count === 0) return null;
    const bars = Math.floor(count / 5);
    const dots = count % 5;
    return (
      <div className="flex flex-col items-center gap-1.5 p-3.5 bg-black/40 border border-[#10b981]/25 rounded-xl max-w-[140px] w-full shadow-inner">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest leading-none">Mayan Math</span>
        {dots > 0 && (
          <div className="flex justify-center gap-1.5 py-0.5">
            {[...Array(dots)].map((_, i) => (
              <div key={i} className="w-3.5 h-3.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
            ))}
          </div>
        )}
        {bars > 0 && (
          <div className="flex flex-col gap-1 w-12 py-0.5">
            {[...Array(bars)].map((_, i) => (
              <div key={i} className="h-1.5 w-full bg-[#10b981] rounded-sm shadow-[0_0_6px_#10b981]" />
            ))}
          </div>
        )}
        <span className="text-xs font-mono text-[#10b981] mt-1 font-bold">Value: {count}</span>
      </div>
    );
  };

  // Helper to draw the card header numeral
  const renderMayanNumeral = (num) => {
    if (num === 1) return (
      <div className="flex gap-1.5 justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
      </div>
    );
    if (num === 2) return (
      <div className="flex gap-1.5 justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
      </div>
    );
    if (num === 3) return (
      <div className="flex gap-1.5 justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
      </div>
    );
    if (num === 4) return (
      <div className="flex gap-1.5 justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
      </div>
    );
    if (num === 5) return (
      <div className="w-10 h-1.5 bg-[#10b981] rounded-sm shadow-[0_0_8px_#10b981] mx-auto" />
    );
    return null;
  };

  const leaves = [
    { id: 'xibalba', num: 1, label: 'XIBALBA', sub: 'THE UNDERWORLD', date: 'c. 1000 BCE', color: '#10b981', icon: '💀' },
    { id: 'highland', num: 2, label: 'HIGHLANDS', sub: 'KAMINALJUYU PLAZA', date: 'c. 500 BCE', color: '#8f5c38', icon: '🌋' },
    { id: 'classic', num: 3, label: 'CLASSIC ERA', sub: 'TIKAL & PALENQUE', date: 'c. 250 CE', color: '#059669', icon: '👑' },
    { id: 'postclassic', num: 4, label: 'POSTCLASSIC', sub: 'CHICHEN ITZA', date: 'c. 900 CE', color: '#d2b48c', icon: '🏛️' },
    { id: 'scribe', num: 5, label: 'SCRIBE ROOM', sub: 'TZOLK\'IN SCROLLS', date: 'Translator', color: '#0d9488', icon: '📝' }
  ];

  const leafThemes = {
    xibalba: {
      accent: '#10b981',
      glow: 'rgba(16, 185, 129, 0.12)',
      bgGrad: 'from-[#030504] via-[#081810] to-[#030504]',
      title: 'Underworld of Xibalba',
      desc: 'Descend into the mystical limestone caves. Discover obsidian sacrificial lancets, ritual cenote mosaic masks, and red-clay burial urns crafted to navigate the 9 levels of Xibalba.',
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop"
    },
    highland: {
      accent: '#8f5c38',
      glow: 'rgba(143, 92, 56, 0.12)',
      bgGrad: 'from-[#040303] via-[#1b110b] to-[#040303]',
      title: 'Preclassic Highland Valley',
      desc: 'Witness the volcanic core trade network of Kaminaljuyu. Observe massive basalt monuments showing early rulers dressed as bird deities, alongside incised clay jars dedicated to rain god Cocijo.',
      image: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=600&auto=format&fit=crop"
    },
    classic: {
      accent: '#059669',
      glow: 'rgba(5, 150, 105, 0.12)',
      bgGrad: 'from-[#020403] via-[#071d12] to-[#020403]',
      title: 'Classic Lowland Empires',
      desc: 'Admire the zenith of Mayan architecture and craft. Behold the giant carved limestone sarcophagus lid of King Pakal, royal green jade masks, and finely-grained temple accession reliefs.',
      image: "https://images.unsplash.com/photo-1600577916048-804c9191e36c?q=80&w=600&auto=format&fit=crop"
    },
    postclassic: {
      accent: '#d2b48c',
      glow: 'rgba(210, 180, 140, 0.12)',
      bgGrad: 'from-[#050403] via-[#1d1912] to-[#050403]',
      title: 'Postclassic Temple Cities',
      desc: 'Explore the monumental cities of the post-classic age. Curate the reclining Chacmool offering statues, gold discs plunged into sacred sinkholes, and observatory window charts tracking Venus.',
      image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=600&auto=format&fit=crop"
    },
    scribe: {
      accent: '#0d9488',
      glow: 'rgba(13, 148, 136, 0.12)',
      bgGrad: 'from-[#020404] via-[#061e1d] to-[#020404]',
      title: 'Hieroglyphs & Tzolk\'in math',
      desc: 'Translate English characters into Mayan hieroglyphic concepts. View Tzolk\'in dot-and-bar mathematical symbols drawn dynamically based on the character length of your name.',
      image: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=600&auto=format&fit=crop"
    }
  };

  const currentTheme = activeLeaf ? leafThemes[activeLeaf] : null;

  return (
    <main className="relative w-full min-h-screen bg-[#020403] text-[#e2e8f0] flex flex-col font-sans selection:bg-[#10b981]/30 overflow-hidden">
      
      {/* Floating fireflies */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(16)].map((_, i) => {
          const delay = `${(i * 1.8).toFixed(1)}s`;
          const duration = `${(11 + Math.random() * 7).toFixed(1)}s`;
          const xDist = `${(-120 + Math.random() * 240).toFixed(0)}px`;
          const leftPos = `${(5 + Math.random() * 90).toFixed(0)}%`;
          return (
            <div 
              key={i} 
              className="firefly" 
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
        @keyframes float-firefly {
          0% { transform: translateY(100vh) translateX(0) scale(0.6); opacity: 0; }
          20% { opacity: 0.75; }
          80% { opacity: 0.75; }
          100% { transform: translateY(-10vh) translateX(var(--x-distance)) scale(0.2); opacity: 0; }
        }
        .firefly {
          position: absolute;
          bottom: -20px;
          width: 4px;
          height: 4px;
          background: #10b981;
          border-radius: 50%;
          filter: blur(1.1px);
          box-shadow: 0 0 10px #34d399, 0 0 20px #10b981;
          animation: float-firefly var(--duration) linear infinite;
          animation-delay: var(--delay);
        }
        .font-marcellus {
          font-family: 'Marcellus', 'Cinzel', serif;
        }
        .jade-frame {
          border: 4px double #10b981;
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.15), inset 0 0 15px rgba(0, 0, 0, 0.6);
        }
        .obsidian-card {
          background: rgba(8, 12, 9, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 45px rgba(0,0,0,0.85);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .obsidian-card:hover {
          border-color: rgba(16, 185, 129, 0.3);
          box-shadow: 0 20px 50px rgba(16, 185, 129, 0.08);
        }
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .calendar-wheel {
          animation: rotate-slow 100s linear infinite;
        }
      `}</style>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Marcellus&display=swap" />

      <AnimatePresence mode="wait">
        
        {/* --- LAYER 1: CINEMATIC JUNGLE TEMPLE ENTRANCE --- */}
        {!hasEnteredTemple ? (
          <motion.div 
            key="temple-entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(15px)", scale: 0.95 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black overflow-hidden"
          >
            {/* Rainforest backdrop */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img 
                src="/images/mayan.webp" 
                alt="Mayan Ruins" 
                className="w-full h-full object-cover opacity-35 filter brightness-[0.4] contrast-[1.1] scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_75%)]" />
            </div>

            {/* Rotating Sun Calendar */}
            <div className="relative z-10 w-[300px] h-[300px] md:w-[450px] md:h-[450px] flex items-center justify-center select-none">
              <svg 
                className="absolute inset-0 w-full h-full calendar-wheel text-[#10b981]/25 opacity-40" 
                viewBox="0 0 100 100" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="0.4"
              >
                <circle cx="50" cy="50" r="48" />
                <circle cx="50" cy="50" r="38" strokeDasharray="1 3" />
                <circle cx="50" cy="50" r="28" />
                <circle cx="50" cy="50" r="18" strokeDasharray="3 2" />
                {[...Array(20)].map((_, i) => (
                  <line 
                    key={i} 
                    x1="50" 
                    y1="50" 
                    x2={50 + 48 * Math.cos((i * 18 * Math.PI) / 180)} 
                    y2={50 + 48 * Math.sin((i * 18 * Math.PI) / 180)} 
                  />
                ))}
              </svg>

              <motion.div 
                className="relative z-20 text-center flex flex-col items-center gap-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1.0 }}
              >
                <span className="font-mono text-[9px] tracking-[0.45em] text-[#10b981] uppercase font-bold">
                  Civilization Vaults
                </span>
                <h2 className="font-marcellus text-3xl md:text-5xl tracking-widest text-[#f0fdf4] font-medium leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  MAYAN PORTAL
                </h2>
                <div className="h-[2px] w-12 bg-[#10b981] my-1 rounded-full shadow-[0_0_8px_#10b981]" />

                <motion.button
                  onClick={() => {
                    playStoneDoorSound();
                    if (!isSounding) {
                      toggleSoundscape();
                    }
                    setHasEnteredTemple(true);
                  }}
                  whileHover={{ scale: 1.05, borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.12)" }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-6 pointer-events-auto px-8 py-3.5 border border-[#10b981]/40 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-[#10b981] backdrop-blur-md cursor-pointer transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                >
                  Enter the Jungle Temple
                </motion.button>
              </motion.div>
            </div>

            <div className="absolute bottom-10 z-10 flex flex-col items-center gap-1.5 pointer-events-auto">
              <button 
                onClick={toggleSoundscape}
                className="p-3 bg-white/5 border border-white/10 hover:border-[#10b981]/30 rounded-full text-gray-400 hover:text-white transition-all cursor-pointer"
                aria-label="Toggle soundscape"
              >
                {isSounding ? <Music size={14} className="text-[#10b981] animate-pulse" /> : <VolumeX size={14} />}
              </button>
              <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">
                {isSounding ? "Ritual Synth active" : "Enable Soundscape"}
              </span>
            </div>

            <button 
              onClick={() => useNavigationStore.getState().setPath('/')}
              className="absolute top-8 left-8 p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white cursor-pointer hover:border-[#10b981]/30 transition-all flex items-center justify-center"
              aria-label="Return to lobby"
            >
              <ArrowLeft size={16} />
            </button>
          </motion.div>
        ) : (
          
          /* --- LAYER 2: INTERACTIVE CURATOR CODEX (TWO-TIER DECK) --- */
          <motion.div 
            key="temple-vault"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 w-full min-h-screen flex flex-col z-10 bg-[#040605]"
          >
            {/* Global Header */}
            <header className="relative w-full px-6 py-4 border-b border-white/5 bg-[#030604]/90 backdrop-blur-md z-30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {activeLeaf ? (
                  <motion.button 
                    onClick={() => {
                      playStoneClick();
                      setActiveLeaf(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#10b981]/30 bg-[#10b981]/5 text-[#10b981] text-xs font-mono tracking-widest uppercase hover:bg-[#10b981]/15 transition-all cursor-pointer"
                    whileTap={{ scale: 0.95 }}
                  >
                    &larr; Roll Up Codex
                  </motion.button>
                ) : (
                  <motion.button 
                    onClick={() => setHasEnteredTemple(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white text-xs font-mono tracking-widest uppercase hover:bg-white/15 transition-all cursor-pointer hover:border-[#10b981]/40"
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft size={14} className="text-[#10b981]" /> Leave Temple
                  </motion.button>
                )}
              </div>

              <div className="flex flex-col items-center text-center">
                <span className="text-[10px] text-[#10b981] font-mono tracking-[0.35em] uppercase font-bold">Mayan Curation Codex</span>
                <h1 className="font-marcellus text-lg md:text-xl tracking-[0.12em] text-[#f0fdf4] font-medium mt-0.5">
                  {activeLeaf ? leafThemes[activeLeaf].title.toUpperCase() : "VOICES OF THE JUNGLE TEMPLES"}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSoundscape}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                    isSounding 
                      ? 'bg-[#10b981]/15 border-[#10b981] text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-[#10b981]/30'
                  }`}
                  title="Toggle soundscape"
                >
                  {isSounding ? <Music size={14} className="animate-pulse" /> : <VolumeX size={14} />}
                  <span className="hidden sm:inline">{isSounding ? "Ritual Active" : "Play Soundscape"}</span>
                </button>
                
                <button 
                  onClick={() => {
                    setChatPrefill(`Provide archaeological context regarding the Mayan ${activeLeaf || "Classic"} period.`);
                    setIsChatOpen(true);
                  }}
                  className="p-2.5 bg-[#10b981] text-black hover:bg-[#34d399] hover:scale-105 transition-all rounded-full cursor-pointer shadow-md flex items-center justify-center"
                  title="Consult AI Scribe"
                >
                  <MessageSquare size={16} />
                </button>
              </div>
            </header>

            {/* TWO-TIER INTERFACE VIEWS */}
            <div className="flex-1 w-full relative z-10 flex flex-col justify-center px-6 py-10 md:py-16 md:px-12 overflow-y-auto">
              <AnimatePresence mode="wait">
                
                {/* --- TIER 2A: THE CODEX TABLET DECK (Leaf selection) --- */}
                {!activeLeaf ? (
                  <motion.div 
                    key="codex-deck"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-7xl mx-auto flex flex-col items-center gap-10"
                  >
                    <div className="text-center flex flex-col items-center gap-1">
                      <span className="font-mono text-[9px] tracking-[0.3em] text-[#10b981]/70 uppercase font-bold">Unroll Amate Bark Scroll Leaves</span>
                      <h2 className="font-marcellus text-2xl md:text-3xl text-white font-medium tracking-wider">
                        THE FIVE CODEX TABLETS
                      </h2>
                      <div className="h-[1px] w-20 bg-[#10b981]/25 mt-1.5" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 w-full items-stretch">
                      {leaves.map((leaf) => {
                        const theme = leafThemes[leaf.id];
                        return (
                          <motion.div
                            key={leaf.id}
                            onClick={() => {
                              playStoneClick();
                              setActiveLeaf(leaf.id);
                            }}
                            whileHover={{ y: -8, rotateY: 10, translateZ: 20 }}
                            className="obsidian-card rounded-[2rem] p-6 flex flex-col justify-between items-center text-center gap-6 min-h-[350px] cursor-pointer group relative border-t-2"
                            style={{ 
                              borderTopColor: leaf.color,
                              perspective: 1000
                            }}
                          >
                            {/* Mayan Numerical header */}
                            <div className="flex flex-col gap-1.5 w-full items-center">
                              {renderMayanNumeral(leaf.num)}
                              <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mt-1">
                                Leaf {leaf.num}
                              </span>
                            </div>

                            {/* Center Preview Circle */}
                            <div className="w-24 h-24 rounded-full overflow-hidden border border-white/10 p-0.5 relative group-hover:border-[#10b981]/40 transition-colors shadow-lg">
                              <img 
                                src={theme.image} 
                                alt={leaf.label} 
                                className="w-full h-full object-cover rounded-full filter sepia-[15%] brightness-[0.6] group-hover:scale-105 transition-transform duration-500" 
                              />
                              <div className="absolute inset-0 bg-[#10b981]/5 rounded-full mix-blend-color" />
                            </div>

                            {/* Title & Description */}
                            <div className="flex flex-col gap-1.5">
                              <h3 className="font-marcellus text-base text-white tracking-wider font-bold">
                                {leaf.label}
                              </h3>
                              <span className="font-mono text-[8px] text-gray-500 tracking-wider uppercase leading-none">
                                {leaf.date}
                              </span>
                              <p className="text-[11px] text-gray-400 font-light leading-relaxed mt-2.5 max-w-[170px] mx-auto font-sans line-clamp-3">
                                {theme.desc}
                              </p>
                            </div>

                            {/* Unroll Button */}
                            <button className="px-5 py-2 rounded-full border border-[#10b981]/30 bg-black/40 text-[9px] font-mono tracking-widest text-[#10b981] uppercase group-hover:bg-[#10b981] group-hover:text-black transition-all font-bold">
                              Unroll Leaf
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  
                  /* --- TIER 2B: CHAMBER GALLERY VIEW (Active Leaf) --- */
                  <motion.div
                    key="codex-chamber"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-7xl mx-auto flex flex-col gap-10"
                    style={{
                      background: `radial-gradient(circle at center, ${currentTheme.glow} 0%, transparent 80%)`
                    }}
                  >
                    
                    {/* Chamber Description Header & 3D Interactive Relic */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-8 w-full">
                      <div className="flex flex-col gap-2 lg:col-span-7">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[9px] uppercase tracking-wider text-[#10b981] font-bold">
                            Leaf {leaves.find(l => l.id === activeLeaf).num} • {leaves.find(l => l.id === activeLeaf).date}
                          </span>
                          <span className="text-gray-500 font-mono text-[9px] uppercase tracking-widest">
                            {leaves.find(l => l.id === activeLeaf).sub}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed font-sans mt-2">
                          {currentTheme.desc}
                        </p>
                        <div className="mt-4 flex gap-3">
                          <button 
                            onClick={() => setActiveExhibit(activeLeaf)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-black/60 hover:bg-[#10b981]/15 border border-[#10b981]/30 hover:border-[#10b981]/50 rounded-xl text-[10px] font-mono tracking-widest text-[#10b981] uppercase cursor-pointer transition-all shadow-md w-fit"
                          >
                            <Eye size={12} /> Play Codex Media
                          </button>
                        </div>
                      </div>

                      {/* 3D Exhibit Canvas */}
                      <div className="lg:col-span-5 h-44 md:h-52 w-full overflow-hidden rounded-2xl border border-[#10b981]/25 hover:border-[#10b981]/80 relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] group cursor-pointer bg-black/40 backdrop-blur-sm transition-all duration-300">
                        <Exhibit3DCanvas artifactType={activeLeaf} color="#10b981" modelScale={1.3} />
                        <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-widest text-[#10b981] bg-black/75 px-3 py-1 rounded border border-[#10b981]/25 pointer-events-none">
                          Interactive 3D Codex Relic
                        </div>
                        <div className="absolute top-4 right-4 font-mono text-[8px] uppercase tracking-widest text-gray-500 pointer-events-none">
                          Drag to Rotate
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>

                    {/* Scriptorium or Artifact Cards display */}
                    <div className="w-full">
                      {activeLeaf === 'scribe' ? (
                        
                        /* Interactive Scriptorium translator */
                        <div className="flex flex-col items-center gap-6 w-full py-4">
                          <input 
                            type="text" 
                            value={nameInput} 
                            onChange={(e) => {
                              const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                              setNameInput(filtered);
                            }}
                            maxLength={12}
                            placeholder="Type Name (e.g. BALAM)" 
                            className="w-full max-w-sm bg-black/60 border border-[#0d9488]/40 hover:border-[#0d9488]/70 focus:border-[#0d9488] text-[#fffaf0] rounded-full px-5 py-3.5 outline-none transition-all font-mono text-center tracking-widest uppercase placeholder-gray-700 shadow-inner text-xs"
                          />

                          <div className="w-full max-w-2xl border-[5px] border-[#8f5c38]/70 bg-[#eedeb3] text-[#3c2217] rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center gap-6 shadow-2xl relative">
                            <div className="absolute -top-3 left-10 w-3 h-6 bg-[#3c2217]/80 rounded-full" />
                            <div className="absolute -top-3 right-10 w-3 h-6 bg-[#3c2217]/80 rounded-full" />

                            <div className="flex flex-col items-center gap-1">
                              <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f5c38]/85 font-bold">Copán Court Inscription</span>
                              <div className="h-[1px] w-20 bg-[#8f5c38]/30" />
                            </div>

                            {translatedGlyphs.length === 0 ? (
                              <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
                                <HelpCircle size={28} className="stroke-1 animate-pulse text-[#8f5c38]/60" />
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8f5c38]/70">Enter name to translate</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-6 w-full font-sans">
                                {renderMayanMath(nameInput.length)}

                                <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                                  {translatedGlyphs.map((char, index) => (
                                    <motion.div 
                                      key={index}
                                      initial={{ scale: 0, y: 10 }}
                                      animate={{ scale: 1, y: 0 }}
                                      transition={{ type: "spring", damping: 14, delay: index * 0.05 }}
                                      className="flex flex-col items-center gap-1.5 p-3.5 bg-[#8f5c38]/10 border border-[#8f5c38]/20 rounded-xl min-w-[75px] shadow-md bg-white/40"
                                    >
                                      <span className="text-xl font-bold font-marcellus text-[#8f5c38]">{char.glyph}</span>
                                      <div className="h-[1.5px] w-6 bg-[#8f5c38]/20" />
                                      <span className="text-[9px] font-mono text-[#8f5c38] font-bold uppercase tracking-widest leading-none">
                                        {char.letter}
                                      </span>
                                    </motion.div>
                                  ))}
                                </div>

                                <div className="flex flex-wrap justify-center gap-2 bg-[#8f5c38]/5 border border-[#8f5c38]/15 p-4 rounded-xl w-full font-sans">
                                  {translatedGlyphs.map((char, index) => (
                                    <span key={index} className="text-[9px] font-mono px-2.5 py-1 bg-white border border-[#8f5c38]/20 text-[#3c2217] shadow-sm rounded-md">
                                      <strong className="text-[#8f5c38]">{char.letter}</strong>: {char.meaning}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        
                        /* Chamber Artifacts sleek grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {MAYAN_ARTIFACTS[activeLeaf]?.map((art, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: idx * 0.08 }}
                              className="obsidian-card rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden group border-t-2"
                              style={{ borderTopColor: leaves.find(l => l.id === activeLeaf).color }}
                            >
                              <div className="absolute right-6 top-6 font-mono text-[9px] text-[#10b981]/15 font-bold">
                                MAY-{(idx + 1).toString().padStart(2, '0')}
                              </div>

                              {art.image && (
                                <div className="w-full h-36 overflow-hidden rounded-2xl border border-black/50 relative mb-1 shadow-md">
                                  <img 
                                    src={art.image} 
                                    alt={art.title} 
                                    className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.05] group-hover:scale-103 transition-transform duration-500"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-80" />
                                </div>
                              )}

                              <div className="flex flex-col gap-1.5">
                                <span className="text-[#10b981] font-mono text-[9px] tracking-widest uppercase border-b border-white/5 pb-1.5 leading-none">
                                  {art.subtitle}
                                </span>
                                <h3 className="font-marcellus text-base text-[#f0fdf4] mt-1.5 leading-tight font-bold">
                                  {art.title}
                                </h3>
                              </div>

                              <p className="text-xs text-gray-400 leading-relaxed font-light flex-1 font-sans">
                                {art.desc}
                              </p>

                              <div className="bg-[#10b981]/5 border border-[#10b981]/15 rounded-xl px-3 py-2">
                                <span className="text-[9px] font-mono tracking-wider text-[#10b981] font-bold">🏺 {art.metric}</span>
                              </div>

                              <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-1 font-sans">
                                <button 
                                  onClick={() => handleSpeak(art.desc)}
                                  className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-[#10b981] transition-colors cursor-pointer"
                                  title="Listen to narrative reading"
                                >
                                  <Volume2 size={12} /> Read Glyph
                                </button>
                                <button 
                                  onClick={() => {
                                    setChatPrefill(`Could you explain the archaeological context or calendar importance of: ${art.title}?`);
                                    setIsChatOpen(true);
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-mono text-[#10b981] hover:text-white transition-colors cursor-pointer"
                                >
                                  <Info size={10} /> Consult Scribe
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Curator AI Chat Drawer */}
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

// --- SUB-COMPONENT: EXHIBIT DETAIL MODAL ---
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

  let activeBorder = "border-[#10b981]";
  let themeColorText = "text-[#10b981]";
  let themeColorBg = "bg-[#10b981]";

  if (exhibitId === 'highland') {
    activeBorder = "border-[#8f5c38]";
    themeColorText = "text-[#8f5c38]";
    themeColorBg = "bg-[#8f5c38]";
  } else if (exhibitId === 'classic') {
    activeBorder = "border-[#059669]";
    themeColorText = "text-[#059669]";
    themeColorBg = "bg-[#059669]";
  } else if (exhibitId === 'postclassic') {
    activeBorder = "border-[#d2b48c]";
    themeColorText = "text-[#d2b48c]";
    themeColorBg = "bg-[#d2b48c]";
  } else if (exhibitId === 'scribe') {
    activeBorder = "border-[#0d9488]";
    themeColorText = "text-[#0d9488]";
    themeColorBg = "bg-[#0d9488]";
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
          className="relative w-full max-w-5xl bg-[#080d09]/98 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] z-10 flex flex-col lg:flex-row max-h-[90vh] lg:max-h-[80vh] backdrop-blur-2xl"
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
                    ? `${themeColorBg} text-black border-white/30 font-bold shadow-lg`
                    : 'bg-black/65 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                🎥 Video Guide
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider uppercase border transition-all cursor-pointer ${
                  activeTab === 'gallery'
                    ? `${themeColorBg} text-black border-white/30 font-bold shadow-lg`
                    : 'bg-black/65 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                📷 Image Gallery
              </button>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="w-full lg:w-[380px] p-6 md:p-8 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#080d09]/95 justify-between overflow-y-auto font-sans">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Multimedia Exhibit</span>
                  <h3 className="font-marcellus text-2xl text-[#f0fdf4] tracking-wide mt-1">
                    {data.title}
                  </h3>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1.5 rounded-full border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
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
              <button
                onClick={() => {
                  setChatPrefill(`Could you explain the context of: ${data.title}? I've browsed the codex slides.`);
                  setIsChatOpen(true);
                  onClose();
                }}
                className={`w-full py-3 px-4 rounded-xl text-black text-xs font-mono font-bold tracking-widest uppercase hover:brightness-110 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${themeColorBg}`}
              >
                <span>💬</span> Ask Scribe AI
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-gray-400 hover:text-white text-xs font-mono tracking-widest uppercase transition-all cursor-pointer text-center"
              >
                Close Codex
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- DATA: EXHIBIT MEDIA ---
const EXHIBIT_MEDIA = {
  xibalba: {
    title: "Leaf I: Underworld of Xibalba",
    desc: "Descend into the mystical limestone caves. Discover obsidian bloodletting lancets, ceremonial cenote jade plaques, and red-clay burial urns crafted to navigate Xibalba's 9 levels.",
    videoUrl: "https://www.youtube.com/embed/n7ndRwqJYDM",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608958416715-4fa769eb0707?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620616611484-9fa572de674a?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Ceremonial obsidian blades and bloodletting instruments.",
      "Terracotta urns dedicated to the Jaguar God of the Underworld.",
      "Interlocking jade mosaic tiles placed on royal burial remains."
    ]
  },
  highland: {
    title: "Leaf II: Preclassic Highland Valley",
    desc: "Witness the volcanic core trade network of Kaminaljuyu. Observe massive basalt monuments showing early rulers dressed as bird deities, alongside incised clay jars dedicated to rain god Cocijo.",
    videoUrl: "https://www.youtube.com/embed/zH8wBw5V1Ew",
    images: [
      "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Carved basalt stelas outlining the early Highlands kings.",
      "Cocijo ceramic pots with large eyebrows indicating storm systems.",
      "Parallel core flakes retrieved from polyhedral obsidian blocks."
    ]
  },
  classic: {
    title: "Leaf III: Classic Lowland Empires",
    desc: "Admire the zenith of Mayan architecture and craft. Behold the giant carved limestone sarcophagus lid of King Pakal, royal green jade masks, and finely-grained temple accession reliefs.",
    videoUrl: "https://www.youtube.com/embed/K836eB6n3eM",
    images: [
      "https://images.unsplash.com/photo-1600577916048-804c9191e36c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Palenque limestone reliefs detailing the falling Sarcophagus of Pakal.",
      "Mosaic green jade mask representing the ruler Jasaw Chan K'awiil.",
      "Limestone relief lintel showing dynastic accession of Classic Kings."
    ]
  },
  postclassic: {
    title: "Leaf IV: Postclassic Temple Cities",
    desc: "Explore the monumental cities of the post-classic age. Curate the reclining Chacmool offering statues, gold discs plunged into sacred sinkholes, and observatory window charts tracking Venus.",
    videoUrl: "https://www.youtube.com/embed/aF3gA5tWnrs",
    images: [
      "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Limestone Chacmool statues holding stomach sacrificial platters.",
      "Venus orbit calculation windows aligned on Caracol towers.",
      "Repoussé gold plates stamped with Chichen Itza military councils."
    ]
  },
  scribe: {
    title: "Leaf V: Hieroglyphic Codex & Math",
    desc: "Observe how Mayan scribes recorded histories on accordion paper scrolls, utilizing base-20 calculations and zoomorphic glyph scripts.",
    videoUrl: "https://www.youtube.com/embed/JSqS-S_g7zI",
    images: [
      "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503174971373-b1f69850bded?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Hieroglyphic stairs documenting Palenque dynastic annals.",
      "Accordion-folded amate bark paper manuscripts containing Dresden tables.",
      "Intaglio glyph panels mapping celestial calendar counts."
    ]
  }
};
