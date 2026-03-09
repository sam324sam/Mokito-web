import { Entity } from '../models/entity/entity.model';
import { Collider } from '../models/entity/collider.model';

export function hasCollider(e: Entity): e is Entity & Collider {
  return !!(e as any).collider;
}