import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ArrowRight } from 'lucide-react';

export default function RomanSlide({
    epochNumber,
    totalEpochs,
    subtitle,
    title,
    description,
    children
}) {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
            {/* Layer 2: The Geometric Anchor */}
            <motion.div
                initial={{ scale: 0.8, y: '-50%' }}
                animate={{ scale: 1, y: '-50%' }}
                transition={{ ease: [0.16, 1, 0.3, 1], duration: 1.5 }}
                className="absolute top-1/2 right-[10%] w-[45vw] h-[45vw] rounded-full bg-[#9a1717] z-0 blur-[2px]"
            />

            {/* Layer 3: The 3D Canvas */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <Canvas alpha={true} camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={0.2} color="#ffffff" />
                    <directionalLight position={[5, 5, 5]} intensity={2.5} color="#cc2b2b" />
                    <spotLight position={[-5, 5, -5]} intensity={1.5} color="#ffffff" />
                    {children}
                </Canvas>
            </div>

            {/* Layer 4: The Typography & UI */}
            <div className="absolute inset-0 z-20 flex items-center pointer-events-none">
                <div className="w-full max-w-7xl mx-auto px-8 lg:px-16 grid grid-cols-12">
                    <div className="col-span-12 md:col-span-5 pointer-events-auto">
                        <h3 className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-4">
                            {subtitle}
                        </h3>
                        <h2 className="text-6xl lg:text-8xl font-serif font-bold text-white tracking-tight mb-6">
                            {title}
                        </h2>
                        <p className="text-gray-300 text-lg font-sans leading-relaxed max-w-md mb-8">
                            {description}
                        </p>

                        <button className="group flex items-center gap-4 text-white uppercase tracking-widest text-sm hover:text-white transition-colors">
                            <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center transition-colors group-hover:bg-white group-hover:border-white">
                                <ArrowRight className="w-5 h-5 text-white group-hover:text-black transition-colors" />
                            </div>
                            Explore Era
                        </button>
                    </div>
                </div>
            </div>

            {/* Layer 5: The Pagination */}
            <div className="absolute bottom-12 left-8 lg:left-16 z-20 font-mono text-gray-400 flex items-center gap-4">
                <span>{String(epochNumber).padStart(2, '0')}</span>
                <div className="w-24 h-[1px] bg-gray-800 relative overflow-hidden">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-[#9a1717]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(epochNumber / totalEpochs) * 100}%` }}
                        transition={{ ease: "easeInOut", duration: 0.8 }}
                    />
                </div>
                <span>{String(totalEpochs).padStart(2, '0')}</span>
            </div>
        </div>
    );
}
