import { Entity } from "../entity/entity.model";

// Setear el tipo de comportamientos
type ObjectBehaviors = (p: InteractuableObject, delta: number) => void;
export interface InteractuableObject extends Entity{
  name: string;
  type: ObjectType;
  timeToLife: number;
  behaviors?: ObjectBehaviors[];
  nameBehaviors: string[];
}

export enum ObjectType {
  Food = 'food',
  Bathroom = 'bathroom',
  Default = 'default',
  Room = 'room'
}