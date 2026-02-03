import { Injectable } from '@angular/core';
// Servicios
import { CollisionService } from './collision.service';
import { EntityStoreService } from './entity-store.service';
import { SpriteService } from './sprites.service';
//guards
import { hasPhysics } from '../guards/has-physics.guard';
import { hasCollider } from '../guards/has-collider.guard';
import { hasGrab } from '../guards/has-grab.guard';
import { Entity } from '../models/entity/entity.model';
import { Particle } from '../models/particle/particle.model';

@Injectable({ providedIn: 'root' })
export class PhysicsService {
  constructor(
    private readonly entityStore: EntityStoreService,
    private readonly spriteService: SpriteService,
    private readonly collisionService: CollisionService,
  ) {}

  update(delta: number) {
    const canvas = this.spriteService.getCanvas();
    if (!canvas) return;

    const dt = delta / 1000;
    const entities = this.entityStore.getAllEntities();

    for (let i = 0; i < entities.length; i++) {
      const e = entities[i];

      // Verificar si es una partícula
      if (this.isParticle(e)) {
        this.applyParticlePhysics(e, dt, canvas);
        continue;
      }

      // Física normal para entidades con collider
      if (!hasCollider(e)) continue;
      this.applyPhysics(e, dt, canvas);
      this.checkEntityCollisions(e, entities, i);
    }
  }

  /**
   * Type guard para verificar si una entidad es una partícula
   */
  private isParticle(entity: Entity): entity is Particle {
    return 'timeToLife' in entity && 'maxTimeToLife' in entity && 'behaviors' in entity;
  }

  /**
   * Aplica física específica para partículas
   * Las partículas no necesitan colisiones complejas, solo gravedad y movimiento
   */
  private applyParticlePhysics(particle: Particle, dt: number, canvas: HTMLCanvasElement) {
    if (!hasPhysics(particle)) return;
    if (!particle.physics.enabled) return;

    const FLOOR_Y = canvas.height;

    // Aplicar gravedad
    particle.physics.vy += particle.physics.gravity * dt;

    // Aplicar velocidades
    particle.sprite.x += particle.physics.vx * dt;
    particle.sprite.y += particle.physics.vy * dt;

    // Colisión con el suelo (opcional, puedes comentar si no quieres)
    if (hasCollider(particle)) {
      if (particle.sprite.y + particle.collider.height >= FLOOR_Y) {
        particle.sprite.y = FLOOR_Y - particle.collider.height;
        particle.physics.vy = 0;
        // rebote
        particle.physics.vy = -particle.physics.vy * 0.5;
      }

      // Colisión con paredes (opcional)
      if (particle.sprite.x < 0) {
        particle.sprite.x = 0;
        particle.physics.vx = -particle.physics.vx * 0.5; // rebote
      }
      if (particle.sprite.x + particle.collider.width > canvas.width) {
        particle.sprite.x = canvas.width - particle.collider.width;
        particle.physics.vx = -particle.physics.vx * 0.5; // rebote
      }
    } else if (particle.sprite.y > FLOOR_Y) {
      particle.sprite.y = FLOOR_Y;
      particle.physics.vy = 0;
    }
  }

  /**
   * Aplica física para entidades normales (no partículas)
   */
  applyPhysics(e: Entity, dt: number, canvas: HTMLCanvasElement) {
    if (!hasCollider(e)) return;
    if (!hasPhysics(e)) return;
    if (!hasGrab(e)) {
      e.physics.vy = 0;
      e.physics.vx = 0;
      return;
    }
    if (!e.physics.enabled || e.grab.isGrabbed) return;

    const FLOOR_Y = canvas.height;

    e.physics.vy += e.physics.gravity * dt;
    e.sprite.x += e.physics.vx * dt;
    e.sprite.y += e.physics.vy * dt;

    // Suelo
    if (e.sprite.y + e.collider.height * e.sprite.scale > FLOOR_Y) {
      e.sprite.y = FLOOR_Y - e.collider.height * e.sprite.scale;
      e.physics.vy = 0;
    }

    // Paredes
    if (e.sprite.x < 0 || e.sprite.x + e.collider.width > canvas.width) {
      e.sprite.x = Math.max(0, Math.min(e.sprite.x, canvas.width - e.collider.width));
      e.physics.vx = 0;
    }
  }

  private checkEntityCollisions(a: Entity, entities: Entity[], i: number) {
    for (let j = i; j < entities.length; j++) {
      const b = entities[j];
      if (a === b || !hasCollider(b)) continue;

      // Ignorar colisiones con partículas (las partículas no colisionan con otras entidades)
      if (this.isParticle(b)) continue;

      if (this.collisionService.areColliding(a, b)) {
        this.collisionService.resolve(a, b);
      }
    }
  }
}
