import { Injectable } from '@angular/core';
// Servicios
import { InteractableObjectsService } from './interactable-objects/interactable-objects.service';
import { SpriteService } from './sprites.service';
// Moldel
import { InteractuableObjectRuntime } from '../models/object/interactuable-object.model';

@Injectable({ providedIn: 'root' })
export class PhysicsService {
  constructor(
    private readonly interactableObjectsService: InteractableObjectsService,
    private readonly spriteService: SpriteService,
  ) {}

  update(delta: number) {
    const dt = delta / 1000;

    const canvasHeight = this.spriteService.getCanvas()?.height || 600;
    const FLOOR_Y = canvasHeight - 20;

    const canvasWidth = this.spriteService.getCanvas()?.width || 800;
    const LEFT_X = 0;
    const RIGHT_X = canvasWidth;

    const activeObjects = this.interactableObjectsService
      .activeObjects as InteractuableObjectRuntime[];

    for (const obj of activeObjects) {
      if (!obj.physics.enabled) continue;

      obj.physics.vy += obj.physics.gravity * dt;
      obj.sprite.y += obj.physics.vy * dt;

      // suelo
      if (obj.sprite.y + obj.collider.height > FLOOR_Y) {
        obj.sprite.y = FLOOR_Y - obj.collider.height;
        obj.physics.vy = 0;
      }

      // paredes
      if (obj.sprite.x < LEFT_X) {
        obj.sprite.x = LEFT_X;
        obj.physics.vx = 0;
      }
      if (obj.sprite.x + obj.collider.width > RIGHT_X) {
        obj.sprite.x = RIGHT_X - obj.collider.width;
        obj.physics.vx = 0;
      }
    }
  }


}
