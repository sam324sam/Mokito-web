import { Grab } from '../entity/grab.model';
import { InteractuableObject } from './interactuable-object.model';

export interface InteractuableObjectRuntime
  extends InteractuableObject, Partial<Grab> {
    isTouchingPet: boolean,
  }
