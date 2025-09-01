import { CityAnimationOptions } from './typings/types/three-city-animation.d';
// index.d.ts (Arquivo principal de declaração)

// --- Re-exportações (Definem a API Pública de Tipos) ---
// Exporta o tipo de união e o objeto de constantes
export { animationsType, AnimationType } from './typings/constants';

// Exporta os tipos Options e ReturnValue de cada animação
export { CityAnimationOptions } from './typings/types/three-city-animation';
export { SphereAnimationOptions, SphereAnimationReturnValue } from './typings/types/three-sphere-animation';
export { ParticleSphereAnimationOptions, ParticleSphereAnimationReturnValue } from './typings/types/particles-sphere-animation';

// Você pode decidir se quer exportar os tipos de mapa ou mantê-los internos.
// Exportá-los pode ser útil para usuários avançados, mas geralmente não é necessário.
// export { AnimationOptionsMap, AnimationReturnValueMap } from './typings/core';

// --- Declaração da Função Principal ---
// Importa os tipos necessários APENAS para a declaração da função createAnimation
import { AnimationType } from './typings/constants';
import { AnimationOptionsMap, AnimationReturnValueMap } from './typings/core';

/**
 * Inicializa uma animação Three.js específica no container fornecido.
 *
 * @template T O tipo literal específico da animação (ex: "city", "cube").
 * @param {T} type O nome do tipo de animação a ser criada.
 * @param {HTMLElement} container O elemento HTML onde a cena será renderizada.
 * @param {AnimationOptionsMap[T]} [options] Um objeto de configuração opcional específico para o tipo de animação T.
 * @returns {AnimationReturnValueMap[T]} O valor de retorno específico para o tipo de animação T (pode ser void).
 */
export declare function createAnimation<T extends AnimationType>(
  type: T,
  container: HTMLElement,
  options?: AnimationOptionsMap[T]
): AnimationReturnValueMap[T];

// Adicione aqui outras declarações de exportação de nível superior, se houver.