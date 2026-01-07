import { Injectable } from '@angular/core';
// Modelos
import { Particle } from '../models/particle/particle.model';
import { Color } from '../models/sprites/color.model';

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

  /**
   * Constructor del servicio
   * Inicializa la textura por defecto de las particulas
   */
  constructor() {
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
  emit(
    x: number,
    y: number,
    amount: number,
    colors: Color[],
    timeToLife: number,
    texture: HTMLImageElement | null,
    behaviors: ParticleBehavior[]
  ) {
    for (let i = 0; i < amount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        timeToLife: timeToLife,
        maxTimeToLife: timeToLife,
        size: 1 * this.scale,
        color,
        behaviors,
        img: texture || this.defaultTexture,
      });
    }
  }

  /**
   * Emite un conjunto de particulas con comportamiento de explosion
   * Usa gravedad y desvanecimiento progresivo
   */
  emitExplosion(
    x: number,
    y: number,
    amount: number,
    colors: Color[],
    timeToLife: number,
    texture: HTMLImageElement | null
  ) {
    this.emit(x, y, amount, colors, timeToLife, texture, [gravityBehavior, fadeBehavior]);
  }

  /**
   * Emite particulas con comportamiento de gotas
   * Simula caida y desaceleracion progresiva
   */
  emitDroplets(
    x: number,
    y: number,
    amount: number,
    colors: Color[],
    timeToLife: number,
    texture: HTMLImageElement | null
  ) {
    this.emit(x, y, amount, colors, timeToLife, texture, [
      gravityBehavior,
      slowDownBehavior,
      fadeBehavior,
      sweatBehavior,
    ]);
  }

  /**
   * Se encarga de mover y el tiempo de vida de las particulas
   */
  update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // aceleracion por la gravedad
      if (p.behaviors) {
        for (const behavior of p.behaviors) {
          behavior(p, delta);
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.timeToLife <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Dibujar el array de particulas
   * Aplica transparencia segun el tiempo de vida restante
   */
  render() {
    for (const p of this.particles) {
      const alpha = p.timeToLife / p.maxTimeToLife;
      this.ctx.globalAlpha = alpha;

      if (p.img) {
        this.ctx.drawImage(p.img, p.x, p.y, p.size, p.size);

        if (p.color) {
          this.ctx.fillStyle = p.color.color;
          this.ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      }
    }

    this.ctx.globalAlpha = 1;
  }
}

// Comportamientos

/**
 * Aplica aceleracion vertical simulando gravedad
 */
const gravityBehavior: ParticleBehavior = (p, delta) => {
  const dt = delta / 1000;
  p.vy += 0.8 * dt;
};

/**
 * Comportamiento de desvanecimiento
 * No modifica la particula directamente
 */
const fadeBehavior: ParticleBehavior = (p, delta) => {
  const dt = delta / 1000;
  p.timeToLife -= dt * 60;
};

/**
 * Simula sudor o liquido ligero
 * Reduce la velocidad horizontal y aumenta la vertical
 */
const sweatBehavior: ParticleBehavior = (p, delta) => {
  const dt = delta / 1000;

  p.vx *= Math.pow(0.98, dt * 60);
  p.vy += 0.6 * dt;
};

/**
 * Reduce progresivamente la velocidad de la particula
 */
const slowDownBehavior: ParticleBehavior = (p, delta) => {
  const dt = delta / 1000;

  p.vx *= Math.pow(0.95, dt * 60);
  p.vy *= Math.pow(0.95, dt * 60);
};
