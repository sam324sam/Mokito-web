import { Entity } from '../../../models/entity/entity.model';

export function lerpEntity(entity: Entity, targetX: number, targetY: number, deltaTime: number): void {
  const t = 1 - Math.pow(0.01, deltaTime / 100);
  entity.sprite.x += (targetX - entity.sprite.x) * t;
  entity.sprite.y += (targetY - entity.sprite.y) * t;
}
