import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Volume2, MessageSquare, X, Info, 
  HelpCircle, Sparkles, Compass, Award, Bookmark
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls, Center, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import PharaohMask from '../components/canvas/PharaohMask';
import { useNavigationStore } from '../store/navigationStore';

// --- 3D CANVASES & VFX FOR EGYPT ---
function VFXParticles({ count = 100, color = "#d4af37" }) {
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

  if (type === 'mummy' || type === 'coffin') {
    return (
      <group ref={meshRef}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <sphereGeometry args={[0.22, 32, 16]} />
          <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.1} clearcoat={1} />
        </mesh>
        <mesh position={[0, -0.1, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.26, 0.8, 32]} />
          <meshPhysicalMaterial color="#141513" metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow>
          <torusGeometry args={[0.28, 0.02, 16, 100]} />
          <meshStandardMaterial color={color} metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <torusGeometry args={[0.22, 0.02, 16, 100]} />
          <meshStandardMaterial color={color} metalness={1} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (type === 'weapon') {
    return (
      <group ref={meshRef}>
        <mesh rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.06, 1.1, 0.015]} />
          <meshPhysicalMaterial color="#b5b5b5" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]} castShadow>
          <boxGeometry args={[0.06, 1.1, 0.015]} />
          <meshPhysicalMaterial color="#b5b5b5" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={color} metalness={1} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (type === 'accessory') {
    return (
      <group ref={meshRef}>
        <mesh castShadow>
          <dodecahedronGeometry args={[0.25]} />
          <meshPhysicalMaterial color="#0055aa" roughness={0.1} transmission={0.6} thickness={1} clearcoat={1} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.42, 0.04, 16, 100]} />
          <meshStandardMaterial color={color} metalness={1} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[0.3, 0.02, 16, 100]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh ref={meshRef} castShadow>
      <octahedronGeometry args={[0.48]} />
      <meshPhysicalMaterial color={color} metalness={0.8} roughness={0.2} clearcoat={1} />
    </mesh>
  );
}

function Exhibit3DCanvas({ artifactType, color = "#d4af37", modelScale = 1.0 }) {
  return (
    <div className="w-full h-full relative font-sans" style={{ minHeight: '180px' }}>
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 40 }}
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
            {artifactType === 'pharaoh' ? (
              <Suspense fallback={
                <mesh castShadow>
                  <sphereGeometry args={[0.36, 32, 32]} />
                  <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} />
                </mesh>
              }>
                <PharaohMask scale={modelScale} position={[0, -0.2, 0]} />
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

// --- HIEROGLYPH DICTIONARY & MAP ---
const LETTER_TO_HIEROGLYPH = {
  A: { char: "𓄿", name: "Vulture" },
  B: { char: "𓃀", name: "Foot" },
  C: { char: "𓎡", name: "Basket" },
  D: { char: "𓂧", name: "Hand" },
  E: { char: "𓇋", name: "Reed Leaf" },
  F: { char: "𓆑", name: "Horned Viper" },
  G: { char: "𓎼", name: "Jar Stand" },
  H: { char: "𓉔", name: "Reed Shelter" },
  I: { char: "𓇋", name: "Reed Leaf" },
  J: { char: "𓆗", name: "Cobra" },
  K: { char: "𓎡", name: "Basket with Handle" },
  L: { char: "𓃩", name: "Lion" },
  M: { char: "𓅓", name: "Owl" },
  N: { char: "𓈖", name: "Water Wave" },
  O: { char: "𓅱", name: "Quail Chick" },
  P: { char: "𓊪", name: "Reed Mat" },
  Q: { char: "𓈎", name: "Hill Slope" },
  R: { char: "𓂋", name: "Mouth" },
  S: { char: "𓋴", name: "Folded Cloth" },
  T: { char: "𓏏", name: "Loaf of Bread" },
  U: { char: "𓅱", name: "Quail Chick" },
  V: { char: "𓆑", name: "Horned Viper" },
  W: { char: "𓅱", name: "Quail Chick" },
  X: { char: "𓋴𓏏", name: "Cloth + Loaf" },
  Y: { char: "𓇌", name: "Double Reed" },
  Z: { char: "𓊃", name: "Door Bolt" }
};

// --- EGYPTIAN ARTIFACTS DATABASE ---
const EGYPTIAN_ARTIFACTS = {
  pharaoh: [
    {
      title: "Gold Mask of Tutankhamun",
      subtitle: "KV62, Valley of the Kings • New Kingdom (c. 1323 BCE)",
      desc: "Crafted from over 10kg of solid gold, this funeral mask is inlaid with lapis lazuli, carnelian, and obsidian. It served as the eternal face of the boy-king, ensuring his soul could recognize his body in the afterlife.",
      metric: "Material: Solid Gold & Lapis Lazuli",
      image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Painted Bust of Nefertiti",
      subtitle: "Amarna • New Kingdom (c. 1345 BCE)",
      desc: "A masterwork of stucco-coated limestone depicting the Great Royal Wife of Akhenaten. It is renowned for its symmetrical beauty and realistic facial structure, demonstrating the artistic height of the Amarna Period.",
      metric: "Material: Limestone, Plaster & Pigments",
      image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Colossus of Ramesses II",
      subtitle: "Memphis • New Kingdom (c. 1250 BCE)",
      desc: "A gigantic statue carved from red granite, showcasing the supreme power of Egypt's greatest warrior pharaoh. It stood at the great temple of Ptah as a monument to Ramesses' divine stature.",
      metric: "Dimensions: Originally 13 Meters Tall",
      image: "https://images.unsplash.com/photo-1600577916048-804c9191e36c?q=80&w=600&auto=format&fit=crop"
    }
  ],
  mummy: [
    {
      title: "Mummified Remains of Ramesses II",
      subtitle: "Deir el-Bahari cache • New Kingdom (c. 1213 BCE)",
      desc: "The perfectly preserved body of Pharaoh Ramesses II, offering modern science invaluable anatomical insight. The mummification process employed complex dehydration techniques that arrested decay for three millennia.",
      metric: "Preservation: 70-day Natron Dehydration",
      image: "https://images.unsplash.com/photo-1644781440614-7e72b4938d82?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Canopic Jars of Hapy & Imsety",
      subtitle: "Thebes • Third Intermediate Period (c. 900 BCE)",
      desc: "Vessels containing the internal organs of the deceased, protected by the four sons of Horus. Hapy (baboon head) guarded the lungs, while Imsety (human head) protected the liver.",
      metric: "Material: Alabaster & Painted Wood",
      image: "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Sacred Natron Crystals",
      subtitle: "Wadi El Natrun Deposit • Natural Salts",
      desc: "A naturally occurring sodium carbonate blend harvested from dry lake beds. It acted as a powerful desiccant, removing moisture from tissues to facilitate embalming.",
      metric: "Compound: Soda Ash & Baking Soda",
      image: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=600&auto=format&fit=crop"
    }
  ],
  coffin: [
    {
      title: "Innermost Golden Coffin",
      subtitle: "Tomb of Tutankhamun • KV62 (c. 1323 BCE)",
      desc: "A breathtaking human-shaped coffin made of 110kg of solid gold. Its surface is engraved with protective falcon wings and spells from the Book of the Dead to guide the king's transition.",
      metric: "Weight: 110 Kilograms of Pure Gold",
      image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Sarcophagus of High Priest Nesyamun",
      subtitle: "Leeds Archive • Late Period (c. 1100 BCE)",
      desc: "A richly decorated wooden sarcophagus covered in painted hieroglyphic text. It details Nesyamun's pleas to the gods at the Weighing of the Heart ritual, securing his pass to the Elysian fields.",
      metric: "Vessel: Sycamore Fig Wood & Gesso",
      image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Granite Outer Sarcophagus Box",
      subtitle: "Serapeum of Saqqara • Apis Bulls Vault",
      desc: "Mammoth stone sarcophagi carved from single blocks of black granite, weighing up to 70 tons. Built to securely seal royal remains from robbers and cosmic disruption.",
      metric: "Weight: Approx. 70 Metric Tons",
      image: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=600&auto=format&fit=crop"
    }
  ],
  weapon: [
    {
      title: "Royal Bronze Khopesh",
      subtitle: "Tomb of Tutankhamun • New Kingdom (c. 1323 BCE)",
      desc: "A curved sickle-sword representing the ultimate military technology of the Egyptian empire. It evolved from Canaanite battle axes, designed to hook enemy shields and deliver devastating slashing blows.",
      metric: "Material: Cast Bronze & Leather Grip",
      image: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Nubian Composite Bow",
      subtitle: "Elephantine Border Fortress • New Kingdom",
      desc: "A high-tension bow laminated from horn, wood, and animal sinew. It allowed Egyptian archers to pierce leather armor at distances exceeding 200 yards, securing territory expansion.",
      metric: "Range: Over 200 Meters Lethal",
      image: "https://images.unsplash.com/photo-1613143577717-a0f60baee436?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "War Chariot of Kadesh",
      subtitle: "Battle of Kadesh reliefs • c. 1274 BCE",
      desc: "A lightweight, flexible wooden chariot utilizing spoke wheels and a rear-mounted axle. It carried a driver and an archer, serving as a rapid-fire mobile archery platform.",
      metric: "Mobility: Max Speed 25 mph",
      image: "https://images.unsplash.com/photo-1551029506-0807d4b21a68?q=80&w=600&auto=format&fit=crop"
    }
  ],
  accessory: [
    {
      title: "Winged Scarab Pectoral",
      subtitle: "Royal Jewels • Middle Kingdom (c. 1800 BCE)",
      desc: "A magnificent breastplate featuring the scarab beetle representing Khepri, holding the solar disc. Inlaid with turquoise, carnelian, and lapis lazuli to guarantee daily rebirth.",
      metric: "Craft: Gold Filigree & Cloisonné",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Gold Signet Ring of Akhenaten",
      subtitle: "Amarna Palace Archives • New Kingdom",
      desc: "A heavy gold ring carrying the cartouche seal of Akhenaten. Used by royal scribes to press royal authority into wet clay tablets, authorizing laws and treasury distribution.",
      metric: "Material: Solid 22k Gold",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop"
    },
    {
      title: "Shen Ring Amulet",
      subtitle: "Tomb of Queen Hetepheres • Old Kingdom",
      desc: "A circle of rope tied in a knot, representing infinity and cosmic protection. Frequently depicted held in the talons of Horus to envelop the pharaoh in eternal safety.",
      metric: "Symbolism: Infinity & Royal Boundary",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop"
    }
  ]
};

// --- CHAT DRAWER COMPONENT ---
const CuratorChatDrawer = ({ isOpen, onClose, prefill }) => {
  const [messages, setMessages] = useState([
    { text: "Welcome, initiate. I am the Curator. Ask me anything about the dynasties of Egypt, canopic preservation, royal armaments, or let me analyze your artifacts.", sender: "ai" }
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
        newMsgs[newMsgs.length - 1].text = "Error: Connections to the Pharaonic Archives were broken.";
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
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[2000]"
          />
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 26, stiffness: 180 }} 
            className="fixed right-0 top-0 bottom-0 w-full md:w-[460px] bg-[#0c0a09]/95 border-l border-[#d4af37]/30 shadow-[-20px_0_60px_rgba(0,0,0,0.95)] z-[2100] flex flex-col backdrop-blur-3xl"
          >
            <div className="p-6 border-b border-[#d4af37]/20 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-[#d4af37]/50 flex items-center justify-center bg-[#d4af37]/10">
                  <Sparkles size={16} className="text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="text-[#d4af37] font-serif text-xl tracking-wide">The Curator</h3>
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Pharaonic Insight</span>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-[#d4af37] transition-all p-2 rounded-full hover:bg-white/5 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-[#d4af37]/20">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#f2e8d5]' : 'bg-white/[0.03] border border-white/10 text-gray-300'}`}>
                    {msg.image && <img src={msg.image} alt="Upload" className="w-full rounded-lg mb-3 border border-[#d4af37]/20 max-h-[160px] object-cover" />}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{msg.text || "Searching database..."}</p>
                  </div>
                  <span className="text-[9px] mt-2 text-gray-600 uppercase tracking-widest font-mono pl-1">{msg.sender === 'user' ? 'Initiate' : 'Curator'}</span>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[#d4af37]/20 bg-black/40 flex flex-col gap-3">
              <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider pl-1">
                🔒 Cryptographic channel secure
              </span>

              {imageFile && (
                <div className="relative inline-block self-start">
                  <img src={imageFile} alt="Preview" className="h-16 w-16 object-cover rounded border border-[#d4af37]/50" />
                  <button onClick={() => setImageFile(null)} className="absolute -top-2 -right-2 bg-black text-[#d4af37] rounded-full p-1 border border-[#d4af37]/50 cursor-pointer" aria-label="Remove image">
                    <X size={10} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input type="file" ref={fileRef} onChange={handleImageSelect} accept="image/*" className="hidden" aria-label="Upload image" />
                <button type="button" onClick={() => fileRef.current?.click()} className="p-3 rounded-full bg-white/5 text-[#d4af37] hover:bg-[#d4af37]/20 transition-all border border-[#d4af37]/10 hover:border-[#d4af37]/30 cursor-pointer" aria-label="Attach file">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                <input 
                  type="text" 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  placeholder="Inquire of the Pharaohs..." 
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-[#f2e8d5] focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder-gray-600" 
                />
                <button type="submit" className="p-3 rounded-full bg-[#d4af37] text-black hover:scale-105 transition-transform cursor-pointer" aria-label="Send message">
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
export default function EgyptianCollection() {
  const [nameInput, setNameInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState("");
  const [currentActiveRoom, setCurrentActiveRoom] = useState(0);
  const [activeExhibit, setActiveExhibit] = useState(null);

  // References for smooth scrolling navigation
  const roomRefs = {
    pharaoh: useRef(null),
    mummy: useRef(null),
    coffin: useRef(null),
    weapon: useRef(null),
    accessory: useRef(null),
    scribe: useRef(null)
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Convert name to hieroglyphs
  const translateNameToHieroglyphs = (name) => {
    return name.toUpperCase().split('').map(letter => {
      const entry = LETTER_TO_HIEROGLYPH[letter];
      return entry ? { char: entry.char, letter, name: entry.name } : null;
    }).filter(item => item !== null);
  };

  const translatedName = translateNameToHieroglyphs(nameInput);

  // Smooth scroll handler
  const scrollToRoom = (roomName) => {
    window.speechSynthesis?.cancel();
    roomRefs[roomName].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Detect which room is in view (Scrollspy)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const roomKeys = Object.keys(roomRefs);
      
      for (let i = 0; i < roomKeys.length; i++) {
        const ref = roomRefs[roomKeys[i]].current;
        if (ref) {
          const rect = ref.getBoundingClientRect();
          // If the top of the room is mostly in the viewport
          if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
            setCurrentActiveRoom(i);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="relative w-full min-h-screen bg-[#070605] text-[#f2e8d5] flex flex-col font-sans selection:bg-[#d4af37]/30 pb-20 overflow-x-hidden">
      
      {/* Thematic Egyptian background gradient covering the entire page behind the content */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#0c0a09] via-[#14100c] to-[#070605] pointer-events-none z-[-10]" />
      
      {/* Subtle Egyptian tomb ambient torch lights */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[-5] overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[#d4af37]/[0.025] filter blur-[120px]" />
        <div className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-[#4d5d53]/[0.025] filter blur-[130px]" />
        <div className="absolute top-[60%] left-[15%] w-[30vw] h-[30vw] rounded-full bg-[#5978bb]/[0.025] filter blur-[120px]" />
        <div className="absolute top-[80%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-[#b58d63]/[0.025] filter blur-[130px]" />
      </div>

      {/* 1. Full-Page Watermark Anubis Background (No Tilt, Floats Gently, Scrollable) */}
      <div className="absolute inset-x-0 top-0 w-full h-screen overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            y: [0, -25, 0]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full h-full flex items-center justify-center"
        >
          <img
            src="/images/anubis-transparent.png"
            alt="Anubis Watermark Background"
            className="w-full h-full object-cover opacity-[0.9] filter contrast-[1.08] brightness-100 select-none"
          />
        </motion.div>
      </div>

      {/* 2. Floating Gold Particles overlaying the whole background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -500],
              opacity: [0, 0.6, 0],
              x: [0, Math.sin(i) * 35]
            }}
            transition={{
              duration: 9 + Math.random() * 9,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 9
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              bottom: '-10px',
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: '#d4af37',
              borderRadius: '50%',
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>

      {/* 3. Floating Sidebar Room Navigator (HUD HUD) */}
      <div className="fixed left-6 md:left-12 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40 bg-black/40 border border-white/5 p-4 rounded-full backdrop-blur-xl shadow-xl">
        {[
          { id: 'pharaoh', room: 'I', name: 'Pharaohs' },
          { id: 'mummy', room: 'II', name: 'Mummies' },
          { id: 'coffin', room: 'III', name: 'Sarcophagi' },
          { id: 'weapon', room: 'IV', name: 'Armory' },
          { id: 'accessory', room: 'V', name: 'Treasury' },
          { id: 'scribe', room: 'VI', name: 'Scriptorium' }
        ].map((item, idx) => {
          const isActive = currentActiveRoom === idx;
          return (
            <button
              key={item.id}
              onClick={() => scrollToRoom(item.id)}
              className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-[10px] font-mono tracking-tighter border transition-all cursor-pointer relative group ${
                isActive 
                  ? 'bg-[#d4af37] border-[#d4af37] text-[#0a0807] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-[#d4af37]/40 hover:text-white'
              }`}
            >
              <span>{item.room}</span>
              {/* Tooltip on Hover */}
              <span className="absolute left-14 bg-[#0a0807] border border-[#d4af37]/25 text-[#d4af37] text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-lg">
                Room {item.room}: {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Global Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-gradient-to-b from-[#070605]/90 via-[#070605]/50 to-transparent backdrop-blur-sm border-b border-white/[0.02]">
        <motion.button 
          onClick={() => useNavigationStore.getState().setPath('/')}
          className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#d4af37]/25 bg-black/30 backdrop-blur-md text-[#d4af37] text-xs font-mono tracking-widest uppercase hover:bg-[#d4af37]/10 transition-all cursor-pointer"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={14} /> Lobby
        </motion.button>

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => useNavigationStore.getState().setPath('/')}>
          <div className="w-8 h-8 rounded bg-[#d4af37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            <Compass size={18} className="text-[#0a0807]" />
          </div>
          <span className="font-serif tracking-[0.2em] text-xl text-[#d4af37] hidden sm:inline">MYTHOS</span>
        </div>

        <button 
          onClick={() => { setChatPrefill("Give me an executive summary of Ancient Egyptian legacy."); setIsChatOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#d4af37] text-black text-xs font-mono font-bold tracking-widest uppercase hover:bg-[#fffaf0] transition-all cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.25)]"
        >
          <MessageSquare size={14} /> Inquire
        </button>
      </header>

      {/* 5. Museum Entrance Lobby Header Section */}
      <section className="w-full min-h-screen flex flex-col justify-center items-center text-center px-6 relative z-10 pt-20 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_65%)] pointer-events-none" />
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="mt-16 flex flex-col items-center gap-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          onClick={() => scrollToRoom('pharaoh')}
        >
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#d4af37]">Scroll to enter Room I</span>
          <div className="w-6 h-10 border border-[#d4af37]/40 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-2 bg-[#d4af37] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* 6. THE MUSEUM ROOMS */}
      
      {/* ROOM I: PHARAOHS */}
      <section 
        ref={roomRefs.pharaoh}
        className="w-full min-h-screen flex flex-col justify-center py-32 px-6 md:px-24 lg:px-32 relative z-10 border-b border-white/5 overflow-hidden"
      >
        {/* Threshold portal vignettes */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070605] to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070605] to-transparent pointer-events-none z-20" />
        {/* Room Specific ambient lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.04)_0%,transparent_60%)] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto w-full flex flex-col gap-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-8">
            <motion.div 
              initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col gap-2 lg:col-span-7"
            >
              <span className="text-[#d4af37] font-mono text-xs tracking-[0.3em] uppercase">ROOM I • HALL OF THE DEIFIED KINGS</span>
              <h2 className="text-3xl md:text-4xl font-serif">Pharaohs & Colossi</h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-[1px] bg-[#d4af37]/50 mt-2" 
              />
              <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed mt-3 max-w-xl">
                Behold the eternal rulers of the Nile. In this chamber, gaze upon the deified likenesses of the Pharaohs—rulers who spanned the boundary between the mortal realm and the divine pantheon, immortalized in solid gold, stone, and monumental grandeur.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              onClick={() => setActiveExhibit('pharaoh')}
              className="lg:col-span-5 h-44 md:h-52 w-full overflow-hidden rounded-2xl border border-[#d4af37]/25 hover:border-[#d4af37]/80 relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] group cursor-pointer bg-black/40 backdrop-blur-sm transition-all duration-300"
            >
              <Exhibit3DCanvas artifactType="pharaoh" color="#d4af37" modelScale={1.3} />
              <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-widest text-[#d4af37] bg-black/75 px-3 py-1 rounded border border-[#d4af37]/25 pointer-events-none">
                Exhibit Hall A • Interactive 3D
              </div>
              <div className="absolute top-4 right-4 font-mono text-[8px] uppercase tracking-widest text-gray-500 pointer-events-none">
                Drag to Rotate
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EGYPTIAN_ARTIFACTS.pharaoh.map((artifact, index) => (
              <ArtifactCard key={index} index={index} artifact={artifact} handleSpeak={handleSpeak} setIsChatOpen={setIsChatOpen} setChatPrefill={setChatPrefill} />
            ))}
          </div>
        </div>
      </section>

      {/* ROOM II: MUMMIFICATION */}
      <section 
        ref={roomRefs.mummy}
        className="w-full min-h-screen flex flex-col justify-center py-32 px-6 md:px-24 lg:px-32 relative z-10 border-b border-white/5 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070605] to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070605] to-transparent pointer-events-none z-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(77,93,83,0.05)_0%,transparent_60%)] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto w-full flex flex-col gap-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-8">
            <motion.div 
              initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col gap-2 lg:col-span-7"
            >
              <span className="text-[#4d5d53] font-mono text-xs tracking-[0.3em] uppercase">ROOM II • THE EMBALMING CHAMBERS</span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#f2e8d5]">Mummification & Chemistry</h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-[1px] bg-[#4d5d53]/50 mt-2" 
              />
              <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed mt-3 max-w-xl">
                Enter the sacred chambers where mortuary priests applied the complex chemical sciences of natron salts and aromatic resins. Here, discover how ancient Egyptians masterfully arrested bodily decay to prepare the soul's physical vessel for its eternal journey.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              onClick={() => setActiveExhibit('mummy')}
              className="lg:col-span-5 h-44 md:h-52 w-full overflow-hidden rounded-2xl border border-[#4d5d53]/25 hover:border-[#4d5d53]/80 relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] group cursor-pointer bg-black/40 backdrop-blur-sm transition-all duration-300"
            >
              <Exhibit3DCanvas artifactType="mummy" color="#4d5d53" modelScale={1.0} />
              <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-widest text-[#4d5d53] bg-black/75 px-3 py-1 rounded border border-[#4d5d53]/25 pointer-events-none">
                Exhibit Hall B • Interactive 3D
              </div>
              <div className="absolute top-4 right-4 font-mono text-[8px] uppercase tracking-widest text-gray-500 pointer-events-none">
                Drag to Rotate
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EGYPTIAN_ARTIFACTS.mummy.map((artifact, index) => (
              <ArtifactCard key={index} index={index} artifact={artifact} handleSpeak={handleSpeak} setIsChatOpen={setIsChatOpen} setChatPrefill={setChatPrefill} borderTheme="border-[#4d5d53]/25" hoverTheme="hover:border-[#4d5d53]/60" textTheme="text-[#4d5d53]" bgTheme="bg-[#4d5d53]/5" />
            ))}
          </div>
        </div>
      </section>

      {/* ROOM III: COFFINS */}
      <section 
        ref={roomRefs.coffin}
        className="w-full min-h-screen flex flex-col justify-center py-32 px-6 md:px-24 lg:px-32 relative z-10 border-b border-white/5 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070605] to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070605] to-transparent pointer-events-none z-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(28,54,115,0.05)_0%,transparent_60%)] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto w-full flex flex-col gap-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-8">
            <motion.div 
              initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col gap-2 lg:col-span-7"
            >
              <span className="text-[#5978bb] font-mono text-xs tracking-[0.3em] uppercase">ROOM III • THE VAULT OF SACRED COFFINS</span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#f2e8d5]">Sarcophagi & Funerary Guides</h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-[1px] bg-[#5978bb]/50 mt-2" 
              />
              <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed mt-3 max-w-xl">
                Observe the sycamore and solid granite outer boxes engineered to guard royal remains from plunderers and cosmic decay. Each sarcophagus is inscribed with intricate star maps and spells from the Book of the Dead to safely pilot the soul through the underworld.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              onClick={() => setActiveExhibit('coffin')}
              className="lg:col-span-5 h-44 md:h-52 w-full overflow-hidden rounded-2xl border border-[#5978bb]/25 hover:border-[#5978bb]/80 relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] group cursor-pointer bg-black/40 backdrop-blur-sm transition-all duration-300"
            >
              <Exhibit3DCanvas artifactType="coffin" color="#5978bb" modelScale={1.0} />
              <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-widest text-[#5978bb] bg-black/75 px-3 py-1 rounded border border-[#5978bb]/25 pointer-events-none">
                Exhibit Hall C • Interactive 3D
              </div>
              <div className="absolute top-4 right-4 font-mono text-[8px] uppercase tracking-widest text-gray-500 pointer-events-none">
                Drag to Rotate
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EGYPTIAN_ARTIFACTS.coffin.map((artifact, index) => (
              <ArtifactCard key={index} index={index} artifact={artifact} handleSpeak={handleSpeak} setIsChatOpen={setIsChatOpen} setChatPrefill={setChatPrefill} borderTheme="border-[#5978bb]/25" hoverTheme="hover:border-[#5978bb]/60" textTheme="text-[#5978bb]" bgTheme="bg-[#5978bb]/5" />
            ))}
          </div>
        </div>
      </section>

      {/* ROOM IV: WEAPONS */}
      <section 
        ref={roomRefs.weapon}
        className="w-full min-h-screen flex flex-col justify-center py-32 px-6 md:px-24 lg:px-32 relative z-10 border-b border-white/5 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070605] to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070605] to-transparent pointer-events-none z-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,141,99,0.04)_0%,transparent_60%)] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto w-full flex flex-col gap-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-8">
            <motion.div 
              initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col gap-2 lg:col-span-7"
            >
              <span className="text-[#b58d63] font-mono text-xs tracking-[0.3em] uppercase">ROOM IV • THE ROYAL ARMORY</span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#f2e8d5]">Weapons & Warfare Charioteers</h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-[1px] bg-[#b58d63]/50 mt-2" 
              />
              <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed mt-3 max-w-xl">
                Explore the weapons and tactical chariot engineering that secured Egypt's borders. From Canaanite-inspired curved sickle-swords (khopesh) to composite bows and light spoke-wheeled war chariots, explore the military innovations of the New Kingdom empire.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              onClick={() => setActiveExhibit('weapon')}
              className="lg:col-span-5 h-44 md:h-52 w-full overflow-hidden rounded-2xl border border-[#b58d63]/25 hover:border-[#b58d63]/80 relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] group cursor-pointer bg-black/40 backdrop-blur-sm transition-all duration-300"
            >
              <Exhibit3DCanvas artifactType="weapon" color="#b58d63" modelScale={1.0} />
              <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-widest text-[#b58d63] bg-black/75 px-3 py-1 rounded border border-[#b58d63]/25 pointer-events-none">
                Exhibit Hall D • Interactive 3D
              </div>
              <div className="absolute top-4 right-4 font-mono text-[8px] uppercase tracking-widest text-gray-500 pointer-events-none">
                Drag to Rotate
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EGYPTIAN_ARTIFACTS.weapon.map((artifact, index) => (
              <ArtifactCard key={index} index={index} artifact={artifact} handleSpeak={handleSpeak} setIsChatOpen={setIsChatOpen} setChatPrefill={setChatPrefill} borderTheme="border-[#b58d63]/25" hoverTheme="hover:border-[#b58d63]/60" textTheme="text-[#b58d63]" bgTheme="bg-[#b58d63]/5" />
            ))}
          </div>
        </div>
      </section>

      {/* ROOM V: ACCESSORIES */}
      <section 
        ref={roomRefs.accessory}
        className="w-full min-h-screen flex flex-col justify-center py-32 px-6 md:px-24 lg:px-32 relative z-10 border-b border-white/5 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070605] to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070605] to-transparent pointer-events-none z-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.04)_0%,transparent_60%)] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto w-full flex flex-col gap-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-8">
            <motion.div 
              initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col gap-2 lg:col-span-7"
            >
              <span className="text-[#d4af37] font-mono text-xs tracking-[0.3em] uppercase">ROOM V • THE TREASURY OF SACRED AMULETS</span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#f2e8d5]">Accessories & Royal Seals</h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-[1px] bg-[#d4af37]/50 mt-2" 
              />
              <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed mt-3 max-w-xl">
                Admire the delicate, highly protective jewelry of the nobility. Forged from high-carat gold and set with lapis lazuli, carnelian, and turquoise, these amulets and signet rings were encoded with symbols like the Shen ring and the scarab to bind the wearer in eternal security.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              onClick={() => setActiveExhibit('accessory')}
              className="lg:col-span-5 h-44 md:h-52 w-full overflow-hidden rounded-2xl border border-[#d4af37]/25 hover:border-[#d4af37]/80 relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] group cursor-pointer bg-black/40 backdrop-blur-sm transition-all duration-300"
            >
              <Exhibit3DCanvas artifactType="accessory" color="#d4af37" modelScale={1.0} />
              <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-widest text-[#d4af37] bg-black/75 px-3 py-1 rounded border border-[#d4af37]/25 pointer-events-none">
                Exhibit Hall E • Interactive 3D
              </div>
              <div className="absolute top-4 right-4 font-mono text-[8px] uppercase tracking-widest text-gray-500 pointer-events-none">
                Drag to Rotate
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EGYPTIAN_ARTIFACTS.accessory.map((artifact, index) => (
              <ArtifactCard key={index} index={index} artifact={artifact} handleSpeak={handleSpeak} setIsChatOpen={setIsChatOpen} setChatPrefill={setChatPrefill} />
            ))}
          </div>
        </div>
      </section>

      {/* ROOM VI: SCRIPTORIUM (CARTUCHE TRANSLATOR) */}
      <section 
        ref={roomRefs.scribe}
        className="w-full min-h-screen flex flex-col justify-center py-32 px-6 md:px-24 lg:px-32 relative z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070605] to-transparent pointer-events-none z-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(194,155,83,0.04)_0%,transparent_60%)] pointer-events-none z-0" />

        <div className="max-w-4xl mx-auto w-full flex flex-col items-center gap-8 text-center relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-8 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col gap-2 lg:col-span-7 text-left"
            >
              <span className="text-[#d4af37] font-mono text-xs tracking-[0.3em] uppercase">ROOM VI • THE COURT SCRIPTORIUM</span>
              <h2 className="text-3xl md:text-4xl font-serif">The Royal Cartouche Translator</h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-[1px] bg-[#d4af37]/50 mt-2" 
              />
              <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed mt-3 max-w-xl">
                Decipher names into court glyphs representing royal phonetics. Scribes of the court recorded royal names inside protective oval cartouches, believed to shield the individual from malevolent forces across lifetimes. Type your name to forge your own royal cartouche seal.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              onClick={() => setActiveExhibit('scribe')}
              className="lg:col-span-5 h-44 md:h-52 w-full overflow-hidden rounded-2xl border border-[#d4af37]/25 hover:border-[#d4af37]/80 relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] group cursor-pointer transition-all duration-300"
            >
              <img 
                src="https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=800&auto=format&fit=crop" 
                alt="Room VI Banner - Scriptorium" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-75 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/20" />
              <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-widest text-[#d4af37] bg-black/75 px-3 py-1 rounded border border-[#d4af37]/25">
                Exhibit Hall F
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="px-4 py-2 bg-[#d4af37] text-black font-mono text-[10px] font-bold tracking-widest uppercase rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                  Enter Exhibit
                </span>
              </div>
            </motion.div>
          </div>

          <input 
            type="text" 
            value={nameInput} 
            onChange={(e) => {
              const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, "");
              setNameInput(filtered);
            }}
            maxLength={12}
            placeholder="Enter Name (e.g. SNEFERU)" 
            className="w-full max-w-sm bg-black/60 border border-[#d4af37]/30 hover:border-[#d4af37]/50 focus:border-[#d4af37] text-[#fffaf0] rounded-full px-6 py-3.5 outline-none transition-all font-mono text-center tracking-widest uppercase placeholder-gray-600 shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)] text-sm"
          />

          <div className="w-full relative flex justify-center mt-2">
            <div className="absolute inset-0 bg-[#d4af37]/5 blur-[70px] rounded-full pointer-events-none" />
            
            <div className="relative border-4 border-[#d4af37] bg-[#0c0a09]/95 rounded-[50px] px-8 py-10 flex flex-col items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.95),_0_0_35px_rgba(212,175,55,0.15)] min-w-[260px] max-w-full">
              <div className="w-24 h-4 border-2 border-b-0 border-[#d4af37] rounded-t-full absolute -top-4 left-1/2 -translate-x-1/2" />
              <div className="w-16 h-2 bg-[#d4af37] absolute -bottom-1 left-1/2 -translate-x-1/2 rounded" />
              
              {translatedName.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-6 text-gray-600">
                  <HelpCircle size={32} className="stroke-1 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em]">Parchment is blank</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                    {translatedName.map((char, index) => (
                      <motion.div 
                        key={index}
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 13, delay: index * 0.06 }}
                        className="flex flex-col items-center gap-1.5 p-2.5 bg-white/[0.02] border border-[#d4af37]/25 rounded-lg min-w-[65px] shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                      >
                        <span className="text-3xl text-[#d4af37] font-serif">{char.char}</span>
                        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest border-t border-white/5 pt-1 w-full text-center">
                          {char.letter}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 max-w-md">
                    {translatedName.map((char, index) => (
                      <span key={index} className="text-[9px] font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400">
                        <strong className="text-[#d4af37]">{char.letter}</strong>: {char.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Curator Chat Drawer */}
      <CuratorChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => { setIsChatOpen(false); setChatPrefill(""); }} 
        prefill={chatPrefill} 
      />

      {/* 8. Exhibit Media Modal */}
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

// --- SUB-COMPONENT: ARTIFACT CARD ---
const ArtifactCard = ({ 
  artifact, 
  index, 
  handleSpeak, 
  setIsChatOpen, 
  setChatPrefill,
  borderTheme = "border-[#d4af37]/15",
  hoverTheme = "hover:border-[#d4af37]/45",
  textTheme = "text-[#d4af37]",
  bgTheme = "bg-[#d4af37]/5"
}) => {
  // Staggered slide reveals based on column placement
  const leftCardVariants = {
    hidden: { opacity: 0, x: -60, scale: 0.96, filter: "blur(4px)" },
    show: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 45, damping: 13 } }
  };

  const centerCardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.96, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 45, damping: 13, delay: 0.1 } }
  };

  const rightCardVariants = {
    hidden: { opacity: 0, x: 60, scale: 0.96, filter: "blur(4px)" },
    show: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 45, damping: 13, delay: 0.2 } }
  };

  const activeVariant = index % 3 === 0 
    ? leftCardVariants 
    : index % 3 === 1 
      ? centerCardVariants 
      : rightCardVariants;

  return (
    <motion.div 
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={activeVariant}
      whileHover={{ y: -6, borderColor: "rgba(255, 255, 255, 0.15)", boxShadow: "0 18px 35px rgba(0,0,0,0.6)" }}
      className={`bg-black/35 border ${borderTheme} ${hoverTheme} rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group`}
    >
      <div className="absolute right-4 top-4 text-3xl font-mono text-white/[0.02] select-none font-bold group-hover:text-[#d4af37]/5 transition-colors">
        {String(index + 1).padStart(2, '0')}
      </div>

      {artifact.image && (
        <div className="w-full h-44 overflow-hidden rounded-xl border border-white/[0.08] relative mb-2">
          <img 
            src={artifact.image} 
            alt={artifact.title} 
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 filter sepia-[0.25] contrast-[1.05] brightness-[0.85] group-hover:sepia-0 group-hover:brightness-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-gray-500 font-mono text-[9px] tracking-widest uppercase border-b border-white/5 pb-2">
          {artifact.subtitle}
        </span>
        <h3 className="font-serif text-lg text-white font-bold tracking-wide mt-2">
          {artifact.title}
        </h3>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed font-light flex-1">
        {artifact.desc}
      </p>

      <div className={`${bgTheme} border border-white/5 rounded-lg px-3.5 py-2.5 flex items-center gap-2`}>
        <Award size={12} className={`${textTheme} flex-shrink-0`} />
        <span className={`text-[10px] font-mono tracking-wider ${textTheme}`}>{artifact.metric}</span>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
        <button 
          onClick={() => handleSpeak(artifact.desc)}
          className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-[#d4af37] transition-colors cursor-pointer"
          title="Play audio recitation"
        >
          <Volume2 size={12} /> Spoken Guide
        </button>
        <button 
          onClick={() => {
            setChatPrefill(`Tell me more details and mythological lore about: ${artifact.title} (${artifact.subtitle})`);
            setIsChatOpen(true);
          }}
          className={`flex items-center gap-1 text-[10px] font-mono ${textTheme} hover:text-white transition-colors cursor-pointer`}
        >
          <Info size={10} /> Ask Curator
        </button>
      </div>
    </motion.div>
  );
};

// --- DATA: EXHIBIT MEDIA METADATA ---
const EXHIBIT_MEDIA = {
  pharaoh: {
    title: "Room I: Pharaohs & Colossi",
    desc: "Behold the eternal rulers of the Nile. Pharaohs were considered both divine kings and mediators between the gods and the people.",
    videoUrl: "https://www.youtube.com/embed/k4J7S1q0iws",
    images: [
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600577916048-804c9191e36c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "The Sphinx and Great Pyramids at the Giza Plateau, standard monuments of pharaonic power.",
      "The monumental Colossus of Ramesses II carved from solid red granite.",
      "The Painted Bust of Nefertiti, highlighting the artistic height of the New Kingdom.",
      "The golden funeral mask of Tutankhamun, KV62, Valley of the Kings."
    ]
  },
  mummy: {
    title: "Room II: Mummification & Chemistry",
    desc: "Delve into the science of the afterlife. Mummification was a holy process combining anatomical knowledge, chemical desiccants, and sacred rituals.",
    videoUrl: "https://www.youtube.com/embed/9gD0KdiR1OQ",
    images: [
      "https://images.unsplash.com/photo-1503174971373-b1f69850bded?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1644781440614-7e72b4938d82?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Ritual inscriptions painted on tomb walls depicting the mummification liturgy.",
      "Scientific CT scan visualization of ancient royal mummified remains.",
      "Alabaster Canopic Jars used to store and protect the internal organs of the deceased.",
      "Natron deposits from ancient dry lake beds, essential for tissue dehydration."
    ]
  },
  coffin: {
    title: "Room III: Sarcophagi & Funerary Guides",
    desc: "Step into the vault of the sarcophagi. Wooden and stone coffins were built to protect royal remains and act as maps to the Elysian Fields.",
    videoUrl: "https://www.youtube.com/embed/2-GD39Xv5yQ",
    images: [
      "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Vibrant gesso paintings on the inner wooden coffin of Nesyamun.",
      "Heavy black granite sarcophagi inside the Serapeum vaults of Saqqara.",
      "Golden details of the inner coffin of Tutankhamun showing protective wings.",
      "The structural layout of a royal pharaonic tomb entrance in Luxor."
    ]
  },
  weapon: {
    title: "Room IV: Weapons & Warfare Charioteers",
    desc: "Observe the military technology that secured and expanded the borders of Egypt across dynasties.",
    videoUrl: "https://www.youtube.com/embed/D3-H8W6E824",
    images: [
      "https://images.unsplash.com/photo-1551029506-0807d4b21a68?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613143577717-a0f60baee436?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Temple reliefs showing Ramesses II riding a chariot at the Battle of Kadesh.",
      "Forged bronze Khopesh swords with custom leather-bound handle grips.",
      "Composite high-tension bows made of wood, horn, and laminated sinew.",
      "The vast desert expanse of the eastern borders where military forts stood."
    ]
  },
  accessory: {
    title: "Room V: Accessories & Royal Seals",
    desc: "Examine the precious ornaments, rings, and amulets designed to carry divine blessings and royal authority.",
    videoUrl: "https://www.youtube.com/embed/Co5E71rF2s4",
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Gold cloisonné pectoral inlay depicting Khepri, the winged solar beetle.",
      "A solid gold signet seal ring carrying royal hieroglyphic cartouches.",
      "The Shen ring amulet representing infinity and universal protective bounds.",
      "Precious lapis lazuli and turquoise gems used in pharaonic crowns."
    ]
  },
  scribe: {
    title: "Room VI: Scriptorium & Hieroglyphs",
    desc: "Discover the sacred language of the gods. Scribes recorded history, laws, and religious spells using elaborate pictorial scripts.",
    videoUrl: "https://www.youtube.com/embed/JSqS-S_g7zI",
    images: [
      "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503174971373-b1f69850bded?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1200&auto=format&fit=crop"
    ],
    captions: [
      "Deeply incised hieroglyphics on sandstone columns at the Temple of Karnak.",
      "Handwritten hieratic and hieroglyphic scripts preserved on ancient papyrus fibers.",
      "Classic limestone sculpture of a royal scribe sitting cross-legged at work.",
      "Inscribed stone obelisks channeling solar power at the Luxor temples."
    ]
  }
};

// --- SUB-COMPONENT: EXHIBIT DETAIL MODAL (VIDEOS & IMAGES PLAYER) ---
const ExhibitDetailModal = ({ isOpen, onClose, exhibitId, setIsChatOpen, setChatPrefill }) => {
  const [activeTab, setActiveTab] = useState('video'); // 'video' or 'gallery'
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

  // Determine theme colors based on exhibit
  let activeBorder = "border-[#d4af37]";
  let themeColorText = "text-[#d4af37]";
  let themeColorBg = "bg-[#d4af37]";
  
  if (exhibitId === 'mummy') {
    activeBorder = "border-[#4d5d53]";
    themeColorText = "text-[#4d5d53]";
    themeColorBg = "bg-[#4d5d53]";
  } else if (exhibitId === 'coffin') {
    activeBorder = "border-[#5978bb]";
    themeColorText = "text-[#5978bb]";
    themeColorBg = "bg-[#5978bb]";
  } else if (exhibitId === 'weapon') {
    activeBorder = "border-[#b58d63]";
    themeColorText = "text-[#b58d63]";
    themeColorBg = "bg-[#b58d63]";
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-10 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl z-0"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-5xl bg-[#0e0c0b]/95 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] z-10 flex flex-col lg:flex-row max-h-[90vh] lg:max-h-[80vh] backdrop-blur-2xl"
        >
          {/* Left Column: Media Player (Video or Gallery) */}
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
                {/* Main Gallery Image */}
                <motion.img
                  key={currentImgIdx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  src={data.images[currentImgIdx]}
                  alt={`${data.title} Slide ${currentImgIdx + 1}`}
                  className="w-full h-full object-contain max-h-[70vh]"
                />
                
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Gallery Slide Caption */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/5 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    {data.captions[currentImgIdx]}
                  </p>
                  <span className="text-[10px] font-mono text-gray-500 mt-1 block">
                    Exhibit {currentImgIdx + 1} of {data.images.length}
                  </span>
                </div>

                {/* Prev / Next buttons */}
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-[#d4af37] hover:text-black transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  &larr;
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-[#d4af37] hover:text-black transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  &rarr;
                </button>
              </div>
            )}

            {/* Media Selector Tabs (Overlaid at top-left of media panel) */}
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

          {/* Right Column: Exhibit Room Details & Navigation */}
          <div className="w-full lg:w-[380px] p-6 md:p-8 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0e0c0b]/90 justify-between overflow-y-auto">
            {/* Modal header & close */}
            <div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Multimedia Exhibit</span>
                  <h3 className="font-serif text-2xl text-[#f2e8d5] tracking-wide mt-1">
                    {data.title}
                  </h3>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1.5 rounded-full border border-white/10 text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 leading-relaxed font-light mt-6">
                {data.desc}
              </p>

              {/* Quick Facts list */}
              <div className="mt-8 flex flex-col gap-3">
                <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-wider">Multimedia Contents:</span>
                <div className="flex items-center gap-2.5 text-xs text-gray-300 font-sans bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <span className="text-[#d4af37]">🎬</span>
                  <span>1x Educational Documentary Video</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300 font-sans bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <span className="text-[#d4af37]">🖼️</span>
                  <span>{data.images.length}x High-Resolution Gallery Slides</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-3 border-t border-white/5 pt-6 mt-6">
              {/* Scriptorium custom message */}
              {exhibitId === 'scribe' && (
                <p className="text-[10px] text-gray-500 font-mono text-center">
                  💡 Type in Room VI below to translate names.
                </p>
              )}
              
              <button
                onClick={() => {
                  setChatPrefill(`Could you explain the historical and mythological context of: ${data.title}? I've just watched the educational video and browsed the gallery.`);
                  setIsChatOpen(true);
                  onClose();
                }}
                className={`w-full py-3 px-4 rounded-xl text-black text-xs font-mono font-bold tracking-widest uppercase hover:brightness-110 transition-all cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2 ${themeColorBg}`}
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
