import { Particle } from '../../models/particle/particle.model';
import { Entity } from '../../models/entity/entity.model';

/**
 * Define la firma de un comportamiento de particula
 */
export type ParticleBehavior = (particle: Particle, deltaTime: number) => void;

// ==================== Comportamiento

/**
 * Comportamiento de desvanecimiento progresivo
 */
export const fadeBehavior: ParticleBehavior = (p, delta) => {
  const dt = delta / 1000;
  
  p.timeToLife -= dt;
  if (p.timeToLife < 0) p.timeToLife = 0;
  
  p.sprite.alpha = (p.timeToLife / p.maxTimeToLife) * 100;
};

/**
 * Simula que la particula este pegada al sprite que le indiquen
 */
export const stickyBehavior: ParticleBehavior = (p, delta) => {
  if (!p.stickyTarget) return;
  
  p.sprite.x = p.stickyTarget.spriteTarget.x + p.stickyTarget.offsetX;
  p.sprite.y = p.stickyTarget.spriteTarget.y + p.stickyTarget.offsetY;
};

/**
 * Reduce progresivamente la velocidad de la particula
 */
export const slowDownBehavior: ParticleBehavior = (p, delta) => {
  if (!('physics' in p) || !p.physics) return;
  
  const dt = delta / 1000;
  p.physics.vx *= Math.pow(0.95, dt * 60);
  p.physics.vy *= Math.pow(0.95, dt * 60);
};

// =================== Configuracion base

/**
 * Configuracion base para todas las particulas
 * Evita repetir propiedades comunes
 */
const baseParticleConfig = (
  x: number,
  y: number,
  timeToLife: number,
  texture: HTMLImageElement,
  scale: number
): Particle => ({
  id: 0,
  active: true,
  timeToLife,
  maxTimeToLife: timeToLife,
  sprite: {
    x,
    y,
    img: texture,
    width: 5,
    height: 5,
    scale,
    color: null,
    animationSprite: {},
    currentAnimation: '',
    currentFrame: 0,
    frameSpeed: 0,
    frameCounter: 0,
    timeoutId: null,
    alpha: 100,
  },
  collider: {
    offsetX: 0,
    offsetY: 0,
    width: 5,
    height: 5,
  },
  tags: []
});

export const ParticleConfigs = {
  /**
   * Particula de explosion
   * Usa gravedad y desvanecimiento progresivo
   */
  explosion: (
    x: number,
    y: number,
    timeToLife: number,
    texture: HTMLImageElement,
    scale: number
  ): Particle => ({
    ...baseParticleConfig(x, y, timeToLife, texture, scale),
    tags: ['particle', 'explosion'],
    behaviors: [fadeBehavior],
    physics: {
      vx: 0,
      vy: 0,
      gravity: 100,
      enabled: true,
    },
  }),

  /**
   * Particula tipo gota
   * Simula caida y desaceleracion progresiva
   */
  droplet: (
    x: number,
    y: number,
    timeToLife: number,
    texture: HTMLImageElement,
    scale: number
  ): Particle => ({
    ...baseParticleConfig(x, y, timeToLife, texture, scale),
    tags: ['particle', 'droplet'],
    behaviors: [fadeBehavior, slowDownBehavior],
    physics: {
      vx: 0,
      vy: 0,
      gravity: 100,
      enabled: true,
    },
  }),

  /**
   * Particula de jabon (no se mucho ingles :C)
   * Se adhiere a una entidad especifica
   */
  bubles: (
    x: number,
    y: number,
    timeToLife: number,
    texture: HTMLImageElement,
    scale: number,
    entityTarget: Entity
  ): Particle => ({
    ...baseParticleConfig(0, 0, timeToLife, texture, scale),
    tags: ['particle', 'bubbles'],
    behaviors: [fadeBehavior, stickyBehavior],
    stickyTarget: {
      spriteTarget: entityTarget.sprite,
      offsetX: x,
      offsetY: y,
    },
    sprite: {
      ...baseParticleConfig(0, 0, timeToLife, texture, scale).sprite,
      width: 8,
      height: 8,
    },
    collider: {
      offsetX: 0,
      offsetY: 0,
      width: 8,
      height: 8,
    }
  }),

  /**
   * Particula de agua de ducha
   * Cae con gravedad y se desacelera
   */
  showerWater: (
    x: number,
    y: number,
    timeToLife: number,
    texture: HTMLImageElement,
    scale: number
  ): Particle => ({
    ...baseParticleConfig(x, y, timeToLife, texture, scale),
    tags: ['particle', 'water'],
    behaviors: [fadeBehavior],
    physics: {
      vx: (Math.random() - 0.5) * 100,
      vy: Math.random() * 10,
      gravity: 200,
      enabled: true,
    },
  }),
};

// ==================== Tipos de datos que retornan

/**
 * Tipo helper para los parametros comunes de las particulas
 */
export interface ParticleBaseParams {
  x: number;
  y: number;
  timeToLife: number;
  texture: HTMLImageElement;
  scale: number;
}

/**
 * Tipo helper para particulas sticky que necesitan un target
 */
export interface ParticleStickyParams extends ParticleBaseParams {
  entityTarget: Entity;
}