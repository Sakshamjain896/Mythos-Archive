import * as THREE from 'three';

// Common GLSL noise functions for optimization
const NOISE_GLSL = `
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0 + 113.0*p.z;
    return mix(mix(mix(hash(n+0.0), hash(n+1.0),f.x),
                   mix(hash(n+57.0), hash(n+58.0),f.x),f.y),
               mix(mix(hash(n+113.0), hash(n+114.0),f.x),
                   mix(hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
  }
  float fbm(vec3 p) {
    float f = 0.5000*noise(p); p = p*2.02;
    f += 0.2500*noise(p); p = p*2.03;
    f += 0.1250*noise(p); p = p*2.01;
    f += 0.0625*noise(p);
    return f;
  }
`;

export const AtmosphereShader = {
  uniforms: {
    u_time: { value: 0 },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_color1: { value: new THREE.Color('#000000') },
    u_color2: { value: new THREE.Color('#d4af37') },
    u_type: { value: 0 }, // 0: India, 1: Egypt, 2: Rome, 3: Maya
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform int u_type;
    varying vec2 vUv;
    ${NOISE_GLSL}

    void main() {
      vec2 uv = vUv;
      vec3 finalColor = u_color1;
      float t = u_time * 0.05; // Slow, heavy history speed
      
      // Parallax shift based on mouse
      vec2 mouseShift = (u_mouse - 0.5) * 0.05;
      vec3 p = vec3(uv * 2.0 + mouseShift, t);

      // FOUNDATION: Volumetric Fog (FBM)
      float fog = fbm(p * 1.5);
      
      if (u_type == 0) { // INDIAN: Divine Gold Ripples
        float ripples = sin(uv.y * 10.0 + fbm(p) * 5.0 + t);
        finalColor = mix(u_color1, u_color2, fog * 0.4 + ripples * 0.1);
      } 
      else if (u_type == 1) { // EGYPTIAN: Sunlit God Rays
        vec2 lightPos = vec2(0.8, 0.8);
        float ray = pow(max(0.0, 1.0 - distance(uv, lightPos)), 4.0);
        float beam = sin(atan(uv.y - lightPos.y, uv.x - lightPos.x) * 5.0 + t * 2.0) * 0.5 + 0.5;
        finalColor = mix(u_color1, u_color2, (ray * beam + fog * 0.3));
      }
      else if (u_type == 2) { // ROMAN: Imperial Marble Caustics
        float caustics = fbm(vec3(uv * 4.0, t * 0.5));
        caustics = pow(caustics, 3.0) * 2.0;
        finalColor = mix(u_color1, vec3(0.5, 0.5, 0.5), caustics * fog);
      }
      else if (u_type == 3) { // MAYAN: Mystic Jungle Rain
        float rain = noise(vec3(uv.x * 20.0, uv.y * 2.0 - t * 4.0, 0.0));
        finalColor = mix(u_color1, u_color2, pow(rain, 4.0) * fog * 0.6);
      }

      // Vignette for depth
      float vignette = 1.0 - distance(uv, vec2(0.5)) * 1.2;
      gl_FragColor = vec4(finalColor * vignette, 1.0);
    }
  `
};
