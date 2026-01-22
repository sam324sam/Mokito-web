import { Collider } from '../entity/collider.model';
import { Grab } from '../entity/grab.model';
import { Physics } from '../entity/physics.model';
import { InteractuableObject } from './interactuable-object.model';

export interface InteractuableObjectRuntime
  extends InteractuableObject, Partial<Grab>, Partial<Collider>, Partial<Physics> {
    isTouchingPet: boolean,
  }
