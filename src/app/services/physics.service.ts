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
      const a = entities[i];
      if (!hasCollider(a)) continue;
      this.applyPhysics(a, dt, canvas);
      this.checkEntityCollisions(a, entities, i);
    }
  }
  applyPhysics(a: Entity, dt: number, canvas: HTMLCanvasElement) {
    if (!hasCollider(a)) return;
    if (!hasPhysics(a)) return;
    if (!hasGrab(a)) {
      a.physics.vy = 0;
      a.physics.vx = 0;
      return;
    }
    if (!a.physics.enabled || a.grab.isGrabbed) return;

    const FLOOR_Y = canvas.height;

    a.physics.vy += a.physics.gravity * dt;
    a.sprite.x += a.physics.vx * dt;
    a.sprite.y += a.physics.vy * dt;

    // Suelo
    if (a.sprite.y + a.collider.height * a.sprite.scale > FLOOR_Y) {
      a.sprite.y = FLOOR_Y - a.collider.height * a.sprite.scale;
      a.physics.vy = 0;
    }

    // Paredes
    if (a.sprite.x < 0 || a.sprite.x + a.collider.width > canvas.width) {
      a.sprite.x = Math.max(0, Math.min(a.sprite.x, canvas.width - a.collider.width));
      a.physics.vx = 0;
    }
  }

  private checkEntityCollisions(a: Entity, entities: Entity[], i: number) {
    for (let j = i; j < entities.length; j++) {
      const b = entities[j];
      if (a === b || !hasCollider(b)) continue;

      if (this.collisionService.areColliding(a, b)) {
        this.collisionService.resolve(a, b);
      }
    }
  }
}
