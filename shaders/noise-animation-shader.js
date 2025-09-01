import * as THREE from "https://esm.sh/three@0.175.0";

export const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3() },
    intensity: { value: 0.075 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float iTime;
    uniform vec3 iResolution;
    uniform float intensity;
    
    varying vec2 vUv;
    
    #define BLEND_MODE 0
    #define SPEED 2.0
    #define MEAN 0.0
    #define VARIANCE 0.5

    float gaussian(float z, float u, float o) {
      return (1.0 / (o * sqrt(2.0 * 3.1415))) *
             exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
    }

    vec3 screen(vec3 a, vec3 b, float w) {
      return mix(a, vec3(1.0) - (vec3(1.0) - a) * (vec3(1.0) - b), w);
    }

    void main() {
      vec2 uv = vUv;
      vec4 color = texture2D(tDiffuse, uv);

      float t = iTime * float(SPEED);
      float seed = dot(uv, vec2(12.9898, 78.233));
      float noise = fract(sin(seed) * 43758.5453 + t);
      noise = gaussian(noise, float(MEAN), float(VARIANCE) * float(VARIANCE));
      
      float w = intensity;
      vec3 grain = vec3(noise) * (1.0 - color.rgb);
      
      #if BLEND_MODE == 0
      color.rgb += grain * w;
      #else
      color.rgb = screen(color.rgb, grain, w);
      #endif
      
      gl_FragColor = color;
    }
  `
};