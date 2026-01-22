import { Entity } from '../models/entity/entity.model';
import { Grab } from '../models/entity/grab.model';

export function hasGrab(e: any): e is Entity & Grab {
  return e.grab !== undefined;
}