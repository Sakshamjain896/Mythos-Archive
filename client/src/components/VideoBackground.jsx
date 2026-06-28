const VideoBackground = ({ onReady }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
      overflow: 'hidden',
      pointerEvents: 'none',
      backgroundColor: '#0a0807' // Fallback color
    }}>
      <video
        autoPlay
        loop
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.5) contrast(1.1) saturate(0.8)',
          transform: 'scale(1.05)', // Prevent edge bleeding
        }}
        onCanPlayThrough={() => onReady && onReady()}
      >
        <source src="/videos/home.mp4" type="video/mp4" />
      </video>

      {/* Subtle Cinematic Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default VideoBackground;
