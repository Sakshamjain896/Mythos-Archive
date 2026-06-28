import './HistoryBackground.css';

/**
 * Civilization theme configurations
 * Each civilization gets a unique set of ambient particles and colour palettes
 */
const THEMES = {
  india: {
    primary: '#d4af37',
    secondary: '#c0533a',
    accent: '#f0c040',
    orbs: [
      { size: 600, x: 15,  y: 20,  delay: 0,   duration: 18, opacity: 0.08 },
      { size: 400, x: 75,  y: 60,  delay: 4,   duration: 22, opacity: 0.06 },
      { size: 300, x: 50,  y: 80,  delay: 8,   duration: 16, opacity: 0.05 },
    ],
    particles: 40,
    particleColor: '#d4af37',
    bgGradient: 'radial-gradient(ellipse at 20% 30%, rgba(180, 80, 20, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
  },
  rome: {
    primary: '#c0392b',
    secondary: '#8e44ad',
    accent: '#e8d5b0',
    orbs: [
      { size: 550, x: 10,  y: 30,  delay: 0,   duration: 20, opacity: 0.07 },
      { size: 380, x: 80,  y: 55,  delay: 5,   duration: 25, opacity: 0.05 },
      { size: 280, x: 45,  y: 75,  delay: 10,  duration: 18, opacity: 0.04 },
    ],
    particles: 35,
    particleColor: '#c0392b',
    bgGradient: 'radial-gradient(ellipse at 15% 25%, rgba(192, 57, 43, 0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 65%, rgba(142, 68, 173, 0.08) 0%, transparent 50%)',
  },
  egypt: {
    primary: '#d4a017',
    secondary: '#1a6b5c',
    accent: '#f5deb3',
    orbs: [
      { size: 650, x: 5,   y: 10,  delay: 0,   duration: 24, opacity: 0.09 },
      { size: 420, x: 70,  y: 50,  delay: 6,   duration: 20, opacity: 0.06 },
      { size: 320, x: 40,  y: 85,  delay: 12,  duration: 15, opacity: 0.05 },
    ],
    particles: 45,
    particleColor: '#d4a017',
    bgGradient: 'radial-gradient(ellipse at 10% 20%, rgba(212, 160, 23, 0.14) 0%, transparent 55%), radial-gradient(ellipse at 90% 75%, rgba(26, 107, 92, 0.08) 0%, transparent 50%)',
  },
  mayan: {
    primary: '#27ae60',
    secondary: '#2980b9',
    accent: '#f39c12',
    orbs: [
      { size: 580, x: 20,  y: 15,  delay: 0,   duration: 22, opacity: 0.07 },
      { size: 350, x: 75,  y: 65,  delay: 7,   duration: 18, opacity: 0.05 },
      { size: 260, x: 50,  y: 90,  delay: 3,   duration: 26, opacity: 0.04 },
    ],
    particles: 50,
    particleColor: '#27ae60',
    bgGradient: 'radial-gradient(ellipse at 25% 25%, rgba(39, 174, 96, 0.12) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(41, 128, 185, 0.08) 0%, transparent 50%)',
  },
};

/**
 * A single floating dust particle
 */
const Particle = ({ color, delay, duration, x, size }) => (
  <div
    className="history-bg__particle"
    style={{
      '--particle-color': color,
      '--particle-delay': `${delay}s`,
      '--particle-duration': `${duration}s`,
      '--particle-x': `${x}vw`,
      '--particle-size': `${size}px`,
    }}
  />
);

/**
 * Ambient light orb (large blurred circle)
 */
const AmbientOrb = ({ size, x, y, delay, duration, opacity, color }) => (
  <div
    className="history-bg__orb"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      top: `${y}%`,
      background: color,
      '--orb-delay': `${delay}s`,
      '--orb-duration': `${duration}s`,
      '--orb-opacity': opacity,
    }}
  />
);

/**
 * HistoryBackground - Buttery smooth, CSS-animated backdrop
 * for the history scrollytelling sections.
 *
 * Usage: <HistoryBackground category="india" />
 * Supported categories: 'india', 'rome', 'egypt', 'mayan'
 */
const HistoryBackground = ({ category = 'india' }) => {
  const theme = THEMES[category] || THEMES.india;

  // Generate particles with seeded pseudo-random positions
  const particles = Array.from({ length: theme.particles }, (_, i) => ({
    delay: (i * 0.37) % 8,
    duration: 6 + (i * 0.53) % 8,
    x: (i * 7.91) % 100,
    size: 2 + (i * 1.3) % 3,
  }));

  return (
    <div
      className="history-bg"
      style={{ '--bg-gradient': theme.bgGradient }}
      aria-hidden="true"
    >
      {/* Deep background gradient */}
      <div className="history-bg__gradient" />

      {/* Animated ambient light orbs */}
      <div className="history-bg__orbs-layer">
        {theme.orbs.map((orb, i) => (
          <AmbientOrb
            key={i}
            color={theme.primary}
            {...orb}
          />
        ))}
      </div>

      {/* Floating dust particles */}
      <div className="history-bg__particles-layer">
        {particles.map((p, i) => (
          <Particle
            key={i}
            color={theme.particleColor}
            {...p}
          />
        ))}
      </div>

      {/* Cinematic vignette */}
      <div className="history-bg__vignette" />

      {/* Horizontal scan lines for extra depth */}
      <div className="history-bg__scanlines" />
    </div>
  );
};

export default HistoryBackground;
