import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../SocketContext';
import { Bot, Send, Volume2, VolumeX } from 'lucide-react';
import { useNavigationStore } from '../store/navigationStore';

const CuratorHUD = () => {
  const { isSpeaking, aiText, socket, isMuted, setIsMuted } = useSocket();
  const { isAuthenticated } = useNavigationStore();
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isAuthenticated) return null;

  const handleRequestCuration = (e) => {
    e.preventDefault();
    if (socket && !isSpeaking && inputValue.trim()) {
      socket.emit('request_curation', { message: inputValue });
      setInputValue("");
    }
  };

  const handleBotClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'rgba(10, 8, 7, 0.85)',
        backdropFilter: 'blur(20px)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        zIndex: 1000,
        maxWidth: '500px',
        minWidth: isExpanded ? '300px' : 'auto',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Mute Toggle */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'none',
          border: 'none',
          color: isMuted ? 'rgba(212, 175, 55, 0.4)' : '#d4af37',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.3s'
        }}
        title={isMuted ? "Unmute Voice" : "Mute Voice"}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
        <motion.div
          onClick={handleBotClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: isSpeaking 
              ? ['0 0 0px rgba(212,175,55,0.2)', '0 0 20px rgba(212,175,55,0.8)', '0 0 0px rgba(212,175,55,0.2)'] 
              : '0 0 0px rgba(212,175,55,0)',
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid rgba(212, 175, 55, 0.5)',
            flexShrink: 0,
            cursor: 'pointer'
          }}
        >
          <Bot size={24} color="#d4af37" />
        </motion.div>
        
        {aiText && (
          <div className="hide-scrollbar" style={{
            fontFamily: 'Inter, sans-serif',
            color: '#fffaf0',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            maxHeight: '60vh',
            overflowY: 'auto',
            paddingRight: '0.5rem',
            marginTop: '0.25rem'
          }}>
            {aiText}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && !isSpeaking && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleRequestCuration}
            style={{ display: 'flex', gap: '0.5rem', overflow: 'hidden' }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask the Curator..."
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                color: '#fffaf0',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.5)',
                borderRadius: '6px',
                padding: '0.5rem',
                color: '#d4af37',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CuratorHUD;
