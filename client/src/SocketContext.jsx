import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigationStore } from './store/navigationStore';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [aiText, setAiText] = useState("");

  const audioRef = useRef(null);
  const isMutedRef = useRef(isMuted);

  const { currentPath } = useNavigationStore();
  const prevPathRef = useRef(currentPath);

  // Sync isMuted state to ref and active audio
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    // Connect to the backend server
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('ai_response', (payload) => {
      setAiText(payload.text);

      if (payload.audioData) {
        try {
          const blob = new Blob([payload.audioData], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);

          if (audioRef.current) {
            audioRef.current.pause();
            URL.revokeObjectURL(audioRef.current.src);
          }

          const audio = new Audio(url);
          audio.muted = isMutedRef.current;
          audioRef.current = audio;

          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(url);
          };
          audio.onerror = () => setIsSpeaking(false);

          audio.play().catch(e => {
            console.error("Audio playback failed silently:", e);
            setIsSpeaking(false);
          });
        } catch (error) {
          console.error("Error processing audio data:", error);
          setIsSpeaking(false);
        }
      }
    });

    return () => {
      newSocket.close();
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  // Stop audio on hard route change
  useEffect(() => {
    if (prevPathRef.current !== currentPath) {
      if (audioRef.current && isSpeaking) {
        audioRef.current.pause();
        setIsSpeaking(false);
      }
      prevPathRef.current = currentPath;
    }
  }, [currentPath, isSpeaking]);

  return (
    <SocketContext.Provider value={{ socket, isSpeaking, aiText, isMuted, setIsMuted }}>
      {children}
    </SocketContext.Provider>
  );
};
