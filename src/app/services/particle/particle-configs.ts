import { Particle } from '../../models/particle/particle.model';
import { Entity } from '../../models/entity/entity.model';
import { Physics } from '../../models/entity/physics.model';
import { Sprite } from '../../models/sprites/sprites.model';
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

/**
 * Rotar el sprite de una particula
 */
export const rotateBehavior: ParticleBehavior = (p, delta) => {
  if (p.sprite.rotation == null) return;

  const speed = Math.PI / 180;
  p.sprite.rotation += speed * delta;
};

// =================== Configuracion base

/**
 * Configuracion base para todas las particulas
 * Evita repetir propiedades comunes
 */
interface ParticleBaseOptions {
  width?: number;
  height?: number;
  rotation?: number | null;
  zIndex?: number | null;
}

const baseParticleConfig = (
  x: number,
  y: number,
  timeToLife: number,
  texture: HTMLImageElement,
  scale: number,
  options: ParticleBaseOptions = {},
): Particle => {
  const width = options.width ?? 5;
  const height = options.height ?? 5;
  const rotation = options.rotation ?? null;
  const zIndex = options.zIndex ?? -1;

  return {
    id: 0,
    name: 'particleBase',
    active: true,
    timeToLife,
    maxTimeToLife: timeToLife,
    sprite: {
      x,
      y,
      img: texture,
      width,
      height,
      scale,
      color: null,
      animationSprite: {},
      currentAnimation: '',
      currentFrame: 0,
      frameSpeed: 0,
      frameCounter: 0,
      timeoutId: null,
      alpha: 100,
      zIndex,
      rotation,
    },
    collider: {
      offsetX: 0,
      offsetY: 0,
      width: width,
      height: height,
    },
    tags: [],
  };
};

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
    scale: number,
  ): Particle => ({
    ...baseParticleConfig(x, y, timeToLife, texture, scale),
    tags: ['particle', 'explosion'],
    behaviors: [fadeBehavior],
    physics: {
      vx: 0,
      vy: 0,
      gravity: 100,
      enabled: true,
      restitution: null,
      friction: null,
    },
  }),

  /**
   * Particula tipo gota
   * Simula caida y desaceleracion progresiva
   */
  sweat_drops: (
    x: number,
    y: number,
    timeToLife: number,
    texture: HTMLImageElement,
    scale: number,
  ): Particle => ({
    ...baseParticleConfig(x, y, timeToLife, texture, scale),
    tags: ['particle', 'sweat_drops'],
    behaviors: [fadeBehavior, slowDownBehavior],
    physics: {
      vx: 0,
      vy: 0,
      gravity: 100,
      enabled: true,
      restitution: null,
      friction: null,
    },
    collider: undefined
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
    entityTarget: Entity,
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
    },
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
    scale: number,
  ): Particle => ({
    ...baseParticleConfig(x, y, timeToLife, texture, scale),
    tags: ['particle', 'showerWater'],
    behaviors: [fadeBehavior],
    physics: {
      vx: (Math.random() - 0.5) * 100,
      vy: Math.random() * 10,
      gravity: 200,
      enabled: true,
      restitution: null,
      friction: null,
    },
  }),

  dirty: (
    x: number,
    y: number,
    timeToLife: number,
    texture: HTMLImageElement,
    scale: number,
  ): Particle => ({
    ...baseParticleConfig(x, y, timeToLife, texture, scale),
    tags: ['particle', 'dirty'],
    behaviors: [fadeBehavior, rotateBehavior],
    sprite: {
      ...baseParticleConfig(x, y, timeToLife, texture, scale).sprite,
      rotation: 0,
    },
    physics: {
      vx: (Math.random() - 0.5) * 100,
      vy: Math.random() * 10,
      gravity: -200,
      enabled: true,
      friction: null,
      restitution: null,
    },
    collider: undefined
  }),

  sleepZZZ: (
    x: number,
    y: number,
    timeToLife: number,
    texture: HTMLImageElement,
    scale: number,
  ): Particle => ({
    ...baseParticleConfig(x, y, timeToLife, texture, scale),
    tags: ['particle', 'z'],
    behaviors: [fadeBehavior],
    sprite: {
      ...baseParticleConfig(x, y, timeToLife, texture, scale).sprite,
      rotation: 0,
    },
    physics: {
      vx: (Math.random() - 0.5) * 100,
      vy: Math.random() * 10,
      gravity: -200,
      enabled: true,
      friction: null,
      restitution: null,
    },
    collider: undefined
  }),

  stella: (timeToLife: number, physics: Physics, spriteStela: Sprite): Particle => {
    const offset = 1;
    const directionX = Math.sign(physics.vx) || 1;
    const directionY = Math.sign(physics.vy) || 1;

    return {
      ...baseParticleConfig(
        spriteStela.x + directionX * offset,
        spriteStela.y + directionY * offset,
        timeToLife,
        spriteStela.img,
        spriteStela.scale,
        {
          width: spriteStela.width,
          height: spriteStela.height,
          zIndex: spriteStela.zIndex + 1,
          rotation: spriteStela.rotation,
        },
      ),
      tags: ['particle', 'stella'],
      behaviors: [fadeBehavior],
      physics: {
        vx: -physics.vx * 0.5,
        vy: -physics.vy * 0.5,
        gravity: 0,
        enabled: true,
        restitution: 0,
        friction: 0,
      },
      collider: undefined
    };
  },
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
