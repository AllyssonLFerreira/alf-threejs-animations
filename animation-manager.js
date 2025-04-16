import {cubeAnimation} from './animations/cube-animation.js';
import { cityAnimation } from './animations/city-animation.js';
import { blobSphereAnimation } from './animations/blob-sphere-animation.js';
import { particlesSphereAnimation } from './animations/particles-sphere-animation.js';

const animations = {
    cube: cubeAnimation,
    city: cityAnimation,
    sphere: blobSphereAnimation,
    particleSphere: particlesSphereAnimation
}

/**
 * Inicializa uma animação específica.
 * @param {string} type - Nome da animação ('cube', 'sphere', etc.).
 * @param {HTMLElement} container - Elemento HTML onde a animação será renderizada.
 * @param {Object} [options] - Configurações opcionais.
 */

export function createAnimation(type, container, options = {}) {
    const animationFunc = animations[type];
    if (!animationFunc) {
        console.error(`Animação "${type}" não encontrada.`);
        return;
    }

    return animationFunc(container, options);
}