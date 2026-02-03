import { Injectable } from '@angular/core';
// Modelos
import { Particle } from '../models/particle/particle.model';
import { EntityStoreService } from './entity-store.service';
import { hasPhysics } from '../guards/has-physics.guard';

/**
 * Define la firma de un comportamiento de particula
 * Un comportamiento modifica el estado de una particula en cada update
 */
type ParticleBehavior = (particle: Particle, deltaTime: number) => void;

@Injectable({ providedIn: 'root' })
export class ParticleService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

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
  constructor(private readonly entityStoreService: EntityStoreService) {
    const img = new Image();
    img.src = './assets/particle/default.png';
    this.defaultTexture = img;
  }

  /**
   * Inicializa el sistema de particulas
   * Asocia el canvas y configura el contexto grafico
   */
  init(canvas: HTMLCanvasElement, scale: number) {
    this.canvas = canvas;
    this.scale = scale;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Para el isertar particulas en la poscion asignada
   * @param x
   * @param y
   * @param amount Cantidad de particulas
   * @param colors Colores que puede usar las particulas de forma random
   */
  emit(amount: number, newParticle: Particle) {
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
      if (hasPhysics(particle)) {
        particle.physics.vx = (Math.random() - 0.5) * 1.5;
        particle.physics.vy = (Math.random() - 0.5) * 1.5;
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
        gravity: 980,
        enabled: true,
      },
      collider: {
        offsetX: x,
        offsetY: y,
        width: 4,
        height: 4,
      },
    };
    this.emit(amount, newParticle);
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
const sticky: ParticleBehavior = (p, delta) => {};

/**
 * Reduce progresivamente la velocidad de la particula
 */
const slowDownBehavior: ParticleBehavior = (p, delta) => {
  if (!hasPhysics(p)) return;
  const dt = delta / 1000;
  p.physics.vx *= Math.pow(0.95, dt * 60);
  p.physics.vy *= Math.pow(0.95, dt * 60);
};
