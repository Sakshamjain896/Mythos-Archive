import * as THREE from 'three';

export const AtmosphereShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#4a2c00') },
    uOpacity: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uNoiseScale: { value: 1.5 },
    uSpeed: { value: 0.1 }
  },
  vertexShader: `
    varying vec2 vUv;
    uniform vec2 uMouse;
    void main() {
      vUv = uv;
      vec3 pos = position;
      // Subtle parallax shift
      pos.x += uMouse.x * 0.5;
      pos.y += uMouse.y * 0.5;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uNoiseScale;
    uniform float uSpeed;
    varying vec2 vUv;

    // Simplex noise function for smooth fog
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 a0 = x - floor(x + 0.5);
      float blur = 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      float noise = snoise(vUv * uNoiseScale + uTime * uSpeed);
      float noise2 = snoise(vUv * (uNoiseScale * 1.6) - uTime * (uSpeed * 0.5));
      float combined = (noise + noise2) * 0.5 + 0.5;
      
      // Create a soft vignette/glow effect
      float dist = distance(vUv, vec2(0.5));
      float mask = 1.0 - smoothstep(0.0, 0.8, dist);
      
      vec3 color = mix(vec3(0.02), uColor, combined * mask);
      gl_FragColor = vec4(color, uOpacity * mask);
    }
  `
};
