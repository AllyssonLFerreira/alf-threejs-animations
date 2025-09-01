import * as THREE from "https://esm.sh/three@0.175.0";
import { EffectComposer } from "https://esm.sh/three@0.175.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://esm.sh/three@0.175.0/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://esm.sh/three@0.175.0/examples/jsm/postprocessing/ShaderPass.js";
import { FilmGrainShader } from "../shaders/noise-animation-shader.js"; // seu shader isolado

/**
 * Animação de Noise (film grain).
 * @param {HTMLElement} container - Elemento HTML onde a animação será renderizada.
 * @param {Object} [options] - Configurações opcionais.
 * @param {number} [options.intensity=0.1] - Intensidade do ruído.
 */
export function noiseAnimation(container, options = {}) {
  const { intensity = 0.1 } = options;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Cena básica preta
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Um plano branco (para ter conteúdo por baixo do shader)
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  scene.add(plane);

  // Post-processing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const filmGrainPass = new ShaderPass(FilmGrainShader);
  filmGrainPass.uniforms.iResolution.value.set(
    container.clientWidth,
    container.clientHeight,
    1
  );
  filmGrainPass.uniforms.intensity.value = intensity;
  composer.addPass(filmGrainPass);

  // Resize handler
  function onResize() {
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
    filmGrainPass.uniforms.iResolution.value.set(
      container.clientWidth,
      container.clientHeight,
      1
    );
  }
  window.addEventListener("resize", onResize);

  // Loop de animação
  let start = Date.now();
  function animate() {
    requestAnimationFrame(animate);

    const elapsed = (Date.now() - start) / 1000;
    filmGrainPass.uniforms.iTime.value = elapsed;

    composer.render();

  }
  animate();

  // Retornar objeto para controle (caso queira parar depois)
  return {
    stop: () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    }
  };
}