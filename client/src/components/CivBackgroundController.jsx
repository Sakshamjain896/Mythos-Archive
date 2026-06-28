import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────
   GLSL Shader Source
   FBM noise with 4 octaves — locked 60fps on integrated GPUs.
   The sphere is rendered BackSide so the camera is always inside.
───────────────────────────────────────────────────────────── */
const vertexShader = /* glsl */`
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform float u_time;
  uniform vec3  u_colorDark;
  uniform vec3  u_colorMid;
  uniform vec3  u_colorLight;

  varying vec3 vWorldPosition;

  // ── Value Noise Hash ──
  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }

  // ── Smooth noise ──
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f); // Smoothstep

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // ── Fractal Brownian Motion (4 octaves max for performance) ──
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 4; i++) {
      value     += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    // Project world position to a 2D surface for noise sampling
    // We use the spherical UV from the normalised position
    vec3  dir   = normalize(vWorldPosition);
    vec2  uv    = vec2(atan(dir.z, dir.x) / (2.0 * 3.14159) + 0.5, dir.y * 0.5 + 0.5);

    // Drift the noise very slowly over time
    float t       = u_time * 0.018;
    float noise1  = fbm(uv * 2.5 + vec2(t * 0.7, t * 0.4));
    float noise2  = fbm(uv * 1.8 - vec2(t * 0.3, t * 0.6) + vec2(noise1 * 0.4));

    // Combine for a more organic, non-repeating look
    float combined = noise1 * 0.6 + noise2 * 0.4;

    // Map to three-tone colour gradient
    vec3 color = mix(u_colorDark, u_colorMid,   smoothstep(0.0,  0.5, combined));
    color       = mix(color,       u_colorLight, smoothstep(0.45, 0.75, combined));

    // Subtle vertical gradient: darken the top/bottom poles
    float poleVignette = 1.0 - abs(dir.y) * 0.6;
    color *= poleVignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ─────────────────────────────────────────────────────────────
   Civilization Colour Palettes
───────────────────────────────────────────────────────────── */
const PALETTES = {
  india: {
    dark:  '#080604',
    mid:   '#3a2008',
    light: '#c8841a',
    sparkles: { enabled: true,  color: '#d4af37', count: 60 },
    stars:    { enabled: false },
  },
  egypt: {
    dark:  '#04060a',
    mid:   '#1a1200',
    light: '#b8880a',
    sparkles: { enabled: true,  color: '#ffcc44', count: 40 },
    stars:    { enabled: false },
  },
  rome: {
    dark:  '#080608',
    mid:   '#200a0a',
    light: '#7a3020',
    sparkles: { enabled: false },
    stars:    { enabled: true, count: 1500, factor: 3 },
  },
  mayan: {
    dark:  '#030806',
    mid:   '#062010',
    light: '#1a6b3a',
    sparkles: { enabled: true,  color: '#40e080', count: 50 },
    stars:    { enabled: true, count: 2000, factor: 4 },
  },
};

const DEFAULT_PALETTE = PALETTES.india;

/* ─────────────────────────────────────────────────────────────
   The Skydome Mesh
───────────────────────────────────────────────────────────── */
const SkydomeBackground = ({ category }) => {
  const materialRef = useRef();

  const palette = useMemo(() => {
    // Attempt direct key match first, then substring
    if (PALETTES[category?.toLowerCase()]) return PALETTES[category.toLowerCase()];
    const match = Object.keys(PALETTES).find(k => category?.toLowerCase().includes(k));
    return match ? PALETTES[match] : DEFAULT_PALETTE;
  }, [category]);

  const uniforms = useMemo(() => ({
    u_time:       { value: 0 },
    u_colorDark:  { value: new THREE.Color(palette.dark)  },
    u_colorMid:   { value: new THREE.Color(palette.mid)   },
    u_colorLight: { value: new THREE.Color(palette.light) },
  }), [palette]);

  // Smoothly lerp colours when category changes
  useFrame((state, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    materialRef.current.uniforms.u_colorDark.value.lerp(new THREE.Color(palette.dark),  delta * 1.5);
    materialRef.current.uniforms.u_colorMid.value.lerp(new THREE.Color(palette.mid),   delta * 1.5);
    materialRef.current.uniforms.u_colorLight.value.lerp(new THREE.Color(palette.light), delta * 1.5);
  });

  return (
    <>
      {/* ── Infinite Skydome ── */}
      <mesh>
        {/* 
          Radius 100 puts it far beyond any artifact. 
          BackSide means the inside surface is rendered — the camera is always inside.
          64×64 segments ensure smooth curvature with no faceting.
        */}
        <sphereGeometry args={[100, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── Civilization Ambient Particles ── */}
      {palette.sparkles?.enabled && (
        <Sparkles
          count={palette.sparkles.count}
          scale={25}
          size={1.2}
          speed={0.015}
          color={palette.sparkles.color}
          opacity={0.25}
        />
      )}

      {palette.stars?.enabled && (
        <Stars
          radius={80}
          depth={50}
          count={palette.stars.count}
          factor={palette.stars.factor}
          saturation={0}
          fade
          speed={0.3}
        />
      )}
    </>
  );
};

const CivBackgroundController = ({ category }) => (
  <SkydomeBackground category={category} />
);

export default CivBackgroundController;
