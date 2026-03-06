import { Entity } from '../entity/entity.model';
import { Physics } from '../entity/physics.model';

// Setear el tipo de comportamientos
type ObjectBehaviors = (p: InteractuableObject, delta: number) => void;
export interface InteractuableObject extends Entity {
  type: ObjectType;
  timeToLife: number;
  behaviors?: ObjectBehaviors[];
  nameBehaviors: string[];
}

export enum ObjectType {
  Food = 'food',
  Bathroom = 'bathroom',
  Garden = 'garden',
  Default = 'default',
  Room = 'room',
}
