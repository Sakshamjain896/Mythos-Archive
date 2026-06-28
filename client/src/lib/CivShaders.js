import * as THREE from 'three';

export const CivShaders = {
  // ROMAN: Marble Veins
  Roman: {
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      void main() {
        vec2 p = vUv * 2.0;
        float n = noise(floor(p));
        float marble = smoothstep(0.4, 0.6, abs(sin(p.x * 10.0 + p.y * 10.0 + n * 5.0)));
        vec3 color = mix(vec3(0.15), vec3(0.25), marble);
        gl_FragColor = vec4(color, 0.6);
      }
    `
  },

  // INDIAN: Breathing Fractal Noise
  Indian: {
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float strength = sin(vUv.x * 10.0 + uTime * 0.5) * cos(vUv.y * 10.0 + uTime * 0.5);
        vec3 color = mix(vec3(0.1, 0.05, 0.0), vec3(0.8, 0.6, 0.2), strength * 0.5 + 0.5);
        gl_FragColor = vec4(color, 0.4);
      }
    `
  },

  // EGYPTIAN: Nile Caustics
  Egyptian: {
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 8.0;
        float c = abs(sin(p.x + uTime) + sin(p.y + uTime * 0.8));
        vec3 color = mix(vec3(0.0, 0.05, 0.1), vec3(0.0, 0.3, 0.6), c);
        gl_FragColor = vec4(color, 0.5);
      }
    `
  },

  // MAYAN: Jade Waterfall
  Mayan: {
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float flow = fract(vUv.y * 5.0 + uTime * 0.2);
        float mask = smoothstep(0.4, 0.5, flow) * smoothstep(0.6, 0.5, flow);
        vec3 color = mix(vec3(0.0, 0.1, 0.0), vec3(0.0, 0.6, 0.3), mask);
        gl_FragColor = vec4(color, 0.5);
      }
    `
  }
};
