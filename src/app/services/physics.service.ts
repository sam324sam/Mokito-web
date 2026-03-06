import { Injectable } from '@angular/core';
// Servicios
import { CollisionService } from './collision.service';
import { EntityStoreService } from './entity-store.service';
import { SpriteService } from './sprites.service';
//guards
import { hasPhysics } from '../guards/has-physics.guard';
import { hasCollider } from '../guards/has-collider.guard';
import { hasGrab } from '../guards/has-grab.guard';
import { isParticle } from '../guards/is-particle.guard';
// Model
import { Entity } from '../models/entity/entity.model';
import { Particle } from '../models/particle/particle.model';
@Injectable({ providedIn: 'root' })
export class PhysicsService {
  constructor(
    private readonly entityStore: EntityStoreService,
    private readonly spriteService: SpriteService,
    private readonly collisionService: CollisionService,
  ) {}

  MIN_SPEED = 0.1;

  update(delta: number) {
    const canvas = this.spriteService.getCanvas();
    if (!canvas) return;

    const dt = delta / 1000;
    const entities = this.entityStore.getZOrder();

    // Aplicar fisica a todas las entidades
    for (const element of entities) {
      this.applyPhysics(element, dt, canvas);
    }

    // Verificar colisiones entre las entidades

    for (let i = 0; i < entities.length; i++) {
      const a = entities[i];
      if (!hasCollider(a)) continue;

      this.checkEntityCollisions(a, entities, i);
    }
  }

  /**
   * Aplica fisica para entidades
   */
  private applyPhysics(e: Entity | Particle, dt: number, canvas: HTMLCanvasElement) {
    if (!hasPhysics(e) || !e.physics.enabled) return;
    if (hasGrab(e) && e.grab.isGrabbed) return;

    const FLOOR_Y = canvas.height;
    let restitution = isParticle(e) ? 0.5 : 0.25;
    let friction = isParticle(e) ? 1 : 0.8;
    // Esto se puede hacer mejor luego cambiar
    if (e.physics.restitution !== null) {
      restitution = e.physics.restitution;
    }
    if (e.physics.friction !== null) {
      friction = e.physics.friction;
    }
    
    // Gravedad
    e.physics.vy += e.physics.gravity * dt;

    // Movimiento
    e.sprite.x += e.physics.vx * dt;
    e.sprite.y += e.physics.vy * dt;

    if (!hasCollider(e)) return;

    const width = e.collider.width * (e.sprite.scale ?? 1);
    const height = e.collider.height * (e.sprite.scale ?? 1);

    // Suelo
    if (e.sprite.y + height > FLOOR_Y) {
      e.sprite.y = FLOOR_Y - height;
      e.physics.vy = -e.physics.vy * restitution;
      e.physics.vx *= friction;
    }

    // Pared izquierda
    if (e.sprite.x < 0) {
      e.sprite.x = 0;
      e.physics.vx = -e.physics.vx * restitution;
    }

    // Pared derecha
    if (e.sprite.x + width > canvas.width) {
      e.sprite.x = canvas.width - width;
      e.physics.vx = -e.physics.vx * restitution;
    }

    // Techo
    if (e.sprite.y < 0) {
      e.sprite.y = 0;
      e.physics.vy = -e.physics.vy * restitution;
    }

    if (Math.abs(e.physics.vx) < this.MIN_SPEED){
      e.physics.vx = 0;
      
    }
    if (Math.abs(e.physics.vy) < this.MIN_SPEED){
      e.physics.vy = 0;
    }
  }

  private checkEntityCollisions(a: Entity, entities: Entity[], i: number) {
    for (let j = i + 1; j < entities.length; j++) {
      const b = entities[j];
      if (!hasCollider(b)) continue;

      if (this.collisionService.areColliding(a, b)) {
        this.collisionService.resolve(a, b);
      }
    }
  }
}
