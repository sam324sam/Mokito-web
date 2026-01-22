import { Entity } from '../models/entity/entity.model';
import { Physics } from '../models/entity/physics.model';

export function hasPhysics(e: Entity): e is Entity & Physics {
  return !!(e as any).physics;
}