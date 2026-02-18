import { Injectable } from '@angular/core';
import { Particle } from '../../models/particle/particle.model';
import { EntityStoreService } from '../entity-store.service';
import { Entity } from '../../models/entity/entity.model';
import { SpriteService } from '../sprites.service';
import { DataService } from '../data.service';
import { ParticleConfigs } from './particle-configs';

@Injectable({ providedIn: 'root' })
export class ParticleService {
  private scale: number = 1;
  private readonly particles: Particle[] = [];
  private readonly texture: Record<string, HTMLImageElement> = {};
  activeParticleSistem: boolean = true;
  private status: boolean = false

  constructor(
    private readonly entityStoreService: EntityStoreService,
    private readonly spriteService: SpriteService,
    private readonly dataService: DataService,
  ) {
    this.texture = this.dataService.getParticleTexture();
  }

  init() {
    if (this.status) return;
    this.status = true
    this.scale = this.spriteService.getScale();
  }

  /**
   * Metodo generico para emitir particulas
   */
  private emit(amount: number, particleConfig: Particle, randomVelocity = false) {
    if (!this.activeParticleSistem) {
      console.log('El sistema de particulas esta apagado');
      return;
    }

    for (let i = 0; i < amount; i++) {
      const particle = this.cloneParticle(particleConfig);

      // Añadir variación aleatoria a la velocidad si se requiere
      if (particle.physics && randomVelocity) {
        particle.physics.vx = (Math.random() - 0.5) * 250;
        particle.physics.vy = -(Math.random() - 0.5) * 250;
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
    this.emit(amount, config, true);
  }

  /**
   * Emite particulas tipo gota
   */
  emitDroplets(
    x: number,
    y: number,
    amount: number,
    timeToLife: number,
    textureName: string | null = null,
  ) {
    const tex = this.texture[textureName || 'default'];
    const config = ParticleConfigs.droplet(x, y, timeToLife, tex, this.scale);
    this.emit(amount, config);
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
    const tex = this.texture[textureName || 'default'];
    const config = ParticleConfigs.bubles(x, y, timeToLife, tex, this.scale, entityTarget);
    this.emit(1, config);
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
    const tex = this.texture[textureName || 'default'];
    const config = ParticleConfigs.showerWater(x, y, timeToLife, tex, this.scale);
    this.emit(amount, config);
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

      // Remover particulas muertas
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
