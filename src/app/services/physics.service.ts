import { Injectable } from '@angular/core';
import { EntityStoreService } from './entity-store.service';
import { SpriteService } from './sprites.service';
//guards
import { hasPhysics } from '../guards/has-physics.guard';
import { hasCollider } from '../guards/has-collider.guard';

@Injectable({ providedIn: 'root' })
export class PhysicsService {
  constructor(
    private readonly entityStore: EntityStoreService,
    private readonly spriteService: SpriteService,
  ) {}

  update(delta: number) {
    const dt = delta / 1000;

    const canvas = this.spriteService.getCanvas();
    if (!canvas) return;

    const FLOOR_Y = canvas.height - 20;
    const LEFT_X = 0;
    const RIGHT_X = canvas.width;

    const entities = this.entityStore.getAllEntities();

    for (const e of entities) {
      // filtramos los que tienen physics y collider
      if (!hasPhysics(e) || !hasCollider(e)) continue;
      if (!e.physics.enabled) continue;

      // aquí TypeScript ya sabe que e tiene physics y collider
      e.physics.vy += e.physics.gravity * dt;
      e.sprite.y += e.physics.vy * dt;

      e.physics.vy += e.physics.gravity * dt;
      e.sprite.y += e.physics.vy * dt;
      e.sprite.x += e.physics.vx * dt;

      // suelo
      if (e.sprite.y + e.collider.height > FLOOR_Y) {
        e.sprite.y = FLOOR_Y - e.collider.height;
        e.physics.vy = 0;
      }

      // paredes
      if (e.sprite.x < LEFT_X) {
        e.sprite.x = LEFT_X;
        e.physics.vx = 0;
      }

      if (e.sprite.x + e.collider.width > RIGHT_X) {
        e.sprite.x = RIGHT_X - e.collider.width;
        e.physics.vx = 0;
      }
    }
  }
}
