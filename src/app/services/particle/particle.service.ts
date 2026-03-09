import { Injectable } from '@angular/core';
import { Particle } from '../../models/particle/particle.model';
import { EntityStoreService } from '../entity-store.service';
import { Entity } from '../../models/entity/entity.model';
import { SpriteService } from '../sprites.service';
import { DataService } from '../data.service';
import { ParticleConfigs } from './particle-configs';
import { Physics } from '../../models/entity/physics.model';
import { Sprite } from '../../models/sprites/sprites.model';

@Injectable({ providedIn: 'root' })
export class ParticleService {
  private scale: number = 1;
  private readonly particles: Particle[] = [];
  private readonly particlePool: Record<string, Particle[]> = {};
  private readonly texture: Record<string, HTMLImageElement> = {};
  activeParticleSistem: boolean = true;
  private status: boolean = false;
  testPerformance: boolean = false;
  private canvas!: HTMLCanvasElement;

  constructor(
    private readonly entityStoreService: EntityStoreService,
    private readonly spriteService: SpriteService,
    private readonly dataService: DataService,
  ) {
    this.texture = this.dataService.getParticleTexture();
  }

  init() {
    if (this.status) return;
    this.status = true;
    this.scale = this.spriteService.getScale();
    this.canvas = this.spriteService.getCanvas();
  }

  performanceTest() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const particlesPerSpawn = 5; // cantidad por emision
    const ttl = 6; // tiempo de vida

    const x = Math.random() * width;
    const y = Math.random() * height;

    this.emitSweatDrops(x, y, particlesPerSpawn, ttl, null);
  }

  /**
   * Metodo generico para emitir particulas
   */
  private emit(amount: number, particleConfig: Particle, type: string, randomVelocity = false) {
    if (!this.activeParticleSistem) {
      console.log('El sistema de particulas esta apagado');
      return;
    }

    if (!this.particlePool[type]) this.particlePool[type] = [];

    for (let i = 0; i < amount; i++) {
      const particle = this.particlePool[type].pop() ?? this.cloneParticle(particleConfig);
      // Resetear atributos que cambian por emisión
      particle.timeToLife = particleConfig.timeToLife;
      particle.sprite.x = particleConfig.sprite.x;
      particle.sprite.y = particleConfig.sprite.y;
      particle.sprite.alpha = 100;

      // Añadir variación aleatoria a la velocidad si se requiere
      if (particle.physics) {
        if (randomVelocity) {
          particle.physics.vx = (Math.random() - 0.5) * 250;
          particle.physics.vy = -(Math.random() - 0.5) * 250;
        } else if (particleConfig.physics) {
          particle.physics.vx = particleConfig.physics.vx;
          particle.physics.vy = particleConfig.physics.vy;
        } else {
          particle.physics.vx = 0;
          particle.physics.vy = 0;
        }
      }

      this.particles.push(particle);
      this.entityStoreService.addEntity(particle);
    }
  }

  /**
   * Clona una particula para que cada una sea independiente
   */
  private cloneParticle(particle: Particle): Particle {
    return {
      ...particle,
      physics: particle.physics ? { ...particle.physics } : undefined,
      sprite: { ...particle.sprite },
      collider: particle.collider ? { ...particle.collider } : undefined,
      stickyTarget: particle.stickyTarget ? { ...particle.stickyTarget } : undefined,
    };
  }

  // ==================== Metodos publicos

  /**
   * Emite particulas de explosión
   */
  emitExplosion(
    x: number,
    y: number,
    amount: number,
    timeToLife: number,
    texture: HTMLImageElement | null = null,
  ) {
    const tex = texture || this.texture['default'];
    const config = ParticleConfigs.explosion(x, y, timeToLife, tex, this.scale);
    this.emit(amount, config, 'explosion', true);
  }

  /**
   * Particulas zzz
   */
  emitSleepZZZ(
    x: number,
    y: number,
    timeToLife: number,
    textureName: string | null,
  ) {
    const tex = this.texture[textureName || 'default'] || this.texture['default'];
    const config = ParticleConfigs.sleepZZZ(x, y, timeToLife, tex, this.scale);
    this.emit(1, config, 'z');
  }

  /**
   * Emite particulas tipo gota
   */
  emitSweatDrops(
    x: number,
    y: number,
    amount: number,
    timeToLife: number,
    textureName: string | null = null,
  ) {
    const tex = this.texture[textureName || 'default'] || this.texture['default'];
    const config = ParticleConfigs.sweat_drops(x, y, timeToLife, tex, this.scale);
    this.emit(amount, config, 'sweat_drops');
  }

  /**
   * Emite una particula pegajosa
   */
  emitBubles(
    x: number,
    y: number,
    timeToLife: number,
    textureName: string | null,
    entityTarget: Entity,
  ) {
    const tex = this.texture[textureName || 'default'] || this.texture['default'];
    const config = ParticleConfigs.bubles(x, y, timeToLife, tex, this.scale, entityTarget);
    this.emit(1, config, 'bubles');
  }

  /**
   * Emite particulas de agua de ducha
   */
  emitShowerWater(
    x: number,
    y: number,
    amount: number,
    timeToLife: number,
    textureName: string | null = null,
  ) {
    const tex = this.texture[textureName || 'default'] || this.texture['default'];
    const config = ParticleConfigs.showerWater(x, y, timeToLife, tex, this.scale);
    this.emit(amount, config, 'showerWater');
  }

  /**
   * Particulas de olor sucio
   */
  emitDirty(
    x: number,
    y: number,
    amount: number,
    timeToLife: number,
    textureName: string | null = null,
  ) {
    const tex = this.texture[textureName || 'default'] || this.texture['default'];
    const config = ParticleConfigs.dirty(x, y, timeToLife, tex, this.scale);
    this.emit(amount, config, 'dirty');
  }

  /**
   *
   */
  emitStella(timeToLife: number, physics: Physics, spriteStela: Sprite) {
    const config = ParticleConfigs.stella(timeToLife, physics, spriteStela);
    this.emit(1, config, 'stella');
  }

  /**
   * Actualiza todas las particulas activas
   */
  update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Aplicar behaviors
      if (p.behaviors) {
        for (const behavior of p.behaviors) {
          behavior(p, delta);
        }
      }

      if (p.timeToLife <= 0) {
        const lastIndex = this.particles.length - 1;
        const lastParticle = this.particles[lastIndex];
        // Swap: reemplaza la particula muerta por la ultima ( para no reaorganizar el array con el splice -_-)
        this.particles[i] = lastParticle;
        this.particles.pop();
        this.entityStoreService.removeEntity(p.id);
        // roclocar el index para que no se salte la siguiente particula
        i--;
        // Para el pool de particulas
        const type = p.tags?.[1] || 'default'; // por ejemplo, usar el segundo tag como tipo
        if (!this.particlePool[type]) this.particlePool[type] = [];
        this.particlePool[type].push(p);
      }
    }
    if (this.testPerformance) {
      this.performanceTest();
    }
  }

  stop() {
    this.activeParticleSistem = false;
  }

  start() {
    this.activeParticleSistem = true;
  }
}
