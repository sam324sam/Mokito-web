import { Injectable } from '@angular/core';
// Modelos
import { Particle } from '../models/particle/particle.model';
import { EntityStoreService } from './entity-store.service';
import { hasPhysics } from '../guards/has-physics.guard';
import { Entity } from '../models/entity/entity.model';
import { SpriteService } from './sprites.service';

/**
 * Define la firma de un comportamiento de particula
 * Un comportamiento modifica el estado de una particula en cada update
 */
type ParticleBehavior = (particle: Particle, deltaTime: number) => void;

@Injectable({ providedIn: 'root' })
export class ParticleService {
  /** Escala aplicada al tamano de las particulas */
  private scale: number = 1;

  /** Array interno que contiene todas las particulas activas */
  private readonly particles: Particle[] = [];

  /** Textura por defecto usada si no se pasa ninguna */
  private readonly defaultTexture: HTMLImageElement;

  activeParticleSistem: boolean = true;

  /**
   * Constructor del servicio
   * Inicializa la textura por defecto de las particulas
   */
  constructor(private readonly entityStoreService: EntityStoreService, private readonly spriteService: SpriteService) {
    const img = new Image();
    img.src = './assets/particle/default.png';
    this.defaultTexture = img;
  }

  /**
   * Inicializa el sistema de particulas
   * Asocia el canvas y configura el contexto grafico
   */
  init() {
    this.scale = this.spriteService.getScale();
  }

  /**
   * Para el isertar particulas en la poscion asignada
   * @param amount Cantidad de particulas
   * @param newParticle La particula a copiar
   * @param randomVelocity Si se quiere que las particulas salgan con distintas velocidades
   */
  emit(amount: number, newParticle: Particle, randomVelocity = false) {
    if (!this.activeParticleSistem) {
      console.log('El sistema de particulas esta apagado');
      return;
    }
    for (let i = 0; i < amount; i++) {
      // Clonar la partícula para que cada una sea independiente
      const particle: Particle = {
        ...newParticle,
        physics: newParticle.physics ? { ...newParticle.physics } : undefined,
        sprite: { ...newParticle.sprite },
        collider: newParticle.collider ? { ...newParticle.collider } : undefined,
      };

      // Añadir variación aleatoria a la velocidad
      if (hasPhysics(particle) && randomVelocity) {
        particle.physics.vx = (Math.random() - 0.5) * 250;
        particle.physics.vy = -(Math.random() - 0.5) * 250;
      }

      this.particles.push(particle);
      this.entityStoreService.addEntity(particle);
    }
  }

  /**
   *Emite un conjunto de particulas con comportamiento de explosion
   * Usa gravedad y desvanecimiento progresivo
   * @param x
   * @param y
   * @param amount Cantidad de particulas
   * @param timeToLife Tiempo de vida en segundos
   */
  emitExplosion(
    x: number,
    y: number,
    amount: number,
    timeToLife: number,
    texture: HTMLImageElement | null,
  ) {
    let behaviors = [fadeBehavior];
    let newParticle: Particle = {
      id: 0,
      active: true,
      timeToLife: timeToLife,
      maxTimeToLife: timeToLife,
      behaviors,
      sprite: {
        x,
        y,
        img: texture || this.defaultTexture,
        width: 4,
        height: 4,
        scale: this.scale,
        color: null,
        animationSprite: {},
        currentAnimation: '',
        currentFrame: 0,
        frameSpeed: 0,
        frameCounter: 0,
        timeoutId: null,
        alpha: 100,
      },
      physics: {
        vx: 0,
        vy: 0,
        gravity: 100,
        enabled: true,
      },
      collider: {
        offsetX: 0,
        offsetY: 0,
        width: 4,
        height: 4,
      },
    };
    this.emit(amount, newParticle, true);
  }

  /**
   * Emite particulas con comportamiento de gotas
   * Simula caida y desaceleracion progresiva
   * @param x
   * @param y
   * @param amount Cantidad de particulas
   * @param timeToLife Tiempo de vida en segundos
   *
   */
  emitDroplets(
    x: number,
    y: number,
    amount: number,
    timeToLife: number,
    texture: HTMLImageElement | null,
  ) {
    if (texture == null) {
      texture = new Image();
      texture.src = './assets/particle/drops.png';
    }

    let behaviors = [fadeBehavior, slowDownBehavior];
    let newParticle: Particle = {
      id: 0,
      active: true,
      timeToLife: timeToLife,
      maxTimeToLife: timeToLife,
      behaviors,
      sprite: {
        x,
        y,
        img: texture,
        width: 4,
        height: 4,
        scale: this.scale,
        color: null,
        animationSprite: {},
        currentAnimation: '',
        currentFrame: 0,
        frameSpeed: 0,
        frameCounter: 0,
        timeoutId: null,
        alpha: 100,
      },
      physics: {
        vx: 0,
        vy: 0,
        gravity: 100,
        enabled: true,
      },
      collider: {
        offsetX: 0,
        offsetY: 0,
        width: 4,
        height: 4,
      },
    };
    this.emit(amount, newParticle);
  }

  emitSticky(
    x: number,
    y: number,
    timeToLife: number,
    texture: HTMLImageElement | null,
    entityTarget: Entity,
  ) {
    if (texture == null) {
      texture = new Image();
      texture.src = './assets/particle/drops.png';
    }

    let behaviors = [fadeBehavior, stickyBehavior];
    let newParticle: Particle = {
      id: 0,
      active: true,
      timeToLife: timeToLife,
      maxTimeToLife: timeToLife,
      behaviors,
      sprite: {
        x,
        y,
        img: texture,
        width: 4,
        height: 4,
        scale: this.scale,
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
        width: 4,
        height: 4,
      },
      stickyTarget: {
        spriteTarget: entityTarget.sprite,
        offsetX: 0,
        offsetY: 0,
      },
    };
    this.emit(1, newParticle);
  }

  /**
   * Se encarga de mover y el tiempo de vida de las particulas
   * Ahora solo maneja behaviors y timeToLife
   * El movimiento lo maneja PhysicsService
   */
  update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Aplicar behaviors (fade, slowdown, etc.)
      if (p.behaviors) {
        for (const behavior of p.behaviors) {
          behavior(p, delta);
        }
      }

      // Remover partículas muertas
      if (p.timeToLife <= 0) {
        this.particles.splice(i, 1);
        this.entityStoreService.removeEntity(p.id);
      }
    }
  }

  stop() {
    this.activeParticleSistem = false;
  }
  start() {
    this.activeParticleSistem = true;
  }
}

// Comportamientos
/**
 * Comportamiento de desvanecimiento
 * No modifica la particula directamente
 */
const fadeBehavior: ParticleBehavior = (p, delta) => {
  const dt = delta / 1000;

  p.timeToLife -= dt;
  if (p.timeToLife < 0) p.timeToLife = 0;

  p.sprite.alpha = (p.timeToLife / p.maxTimeToLife) * 100;
};

/**
 * Simula que la particula este pegada al sprite que le indiquen
 */
const stickyBehavior: ParticleBehavior = (p, delta) => {
  if (!p.stickyTarget) return;

  p.sprite.x = p.stickyTarget.spriteTarget.x + p.stickyTarget.offsetX;
  p.sprite.y = p.stickyTarget.spriteTarget.y + p.stickyTarget.offsetY;
};

/**
 * Reduce progresivamente la velocidad de la particula
 */
const slowDownBehavior: ParticleBehavior = (p, delta) => {
  if (!hasPhysics(p)) return;
  const dt = delta / 1000;
  p.physics.vx *= Math.pow(0.95, dt * 60);
  p.physics.vy *= Math.pow(0.95, dt * 60);
};
