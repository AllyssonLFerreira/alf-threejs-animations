// index.d.ts (na raiz do seu projeto/pacote)

import * as THREE from 'three';
// Importe os tipos dos arquivos corrigidos em 'typings/'
// Certifique-se que o caminho relativo está correto a partir da raiz
import { SphereAnimationOptions, SphereAnimationReturnValue } from './typings/three-sphere-animation';
import { CityAnimationOptions } from './typings/three-city-animation';
import { ParticleSphereAnimationOptions, ParticleSphereAnimationReturnValue } from './typings/particles-sphere-animation';
// Se tiver tipos específicos para cube, importe-os também ou defina aqui
// import { CubeAnimationOptions, CubeAnimationReturnValue } from './typings/cube-animation';

// --- Defina os tipos para a animação 'cube' (se não tiver arquivo separado) ---
export interface CubeAnimationOptions {
  color?: number;
}
export interface CubeAnimationReturnValue {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cube: THREE.Mesh;
}
// --- Defina o tipo de retorno para 'city' se houver ---
// export interface CityAnimationReturnValue { /* ... */ }


// --- Declare o objeto de constantes diretamente ---
// Usar 'declare const' e 'readonly' é uma boa prática
export declare const animationsType: {
  readonly CITY: 'city';
  readonly CUBE: 'cube';
  readonly SPHERE: 'sphere';
  readonly PARTICLESPHERE: 'particleSphere';
};

// --- Declare as sobrecargas da função createAnimation ---
// Use os tipos importados/definidos e os valores de animationsType

export declare function createAnimation(
  type: typeof animationsType.CUBE, // Referencia o tipo do valor constante
  container: HTMLElement,
  options?: CubeAnimationOptions
): CubeAnimationReturnValue;

export declare function createAnimation(
  type: typeof animationsType.CITY,
  container: HTMLElement,
  options?: CityAnimationOptions
): void; // Ou CityAnimationReturnValue se retornar algo

export declare function createAnimation(
  type: typeof animationsType.SPHERE,
  container: HTMLElement,
  options?: SphereAnimationOptions
): SphereAnimationReturnValue;

export declare function createAnimation(
  type: typeof animationsType.PARTICLESPHERE,
  container: HTMLElement,
  options?: ParticleSphereAnimationOptions
): ParticleSphereAnimationReturnValue;

// Você geralmente não precisa de uma sobrecarga genérica se as específicas cobrirem tudo.
// Se precisar, pode adicionar:
// export declare function createAnimation(
//   type: string, // Ou use um tipo mais específico como keyof typeof animationsType
//   container: HTMLElement,
//   options?: any
// ): any;