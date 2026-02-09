import { Entity } from "../entity/entity.model";
import { Sprite } from "../sprites/sprites.model";

export interface InteractuableObject extends Entity{
  name: string;
  sprite: Sprite;
  type: ObjectType;
  timeToLife: number;
}

export enum ObjectType {
  Food = 'food',
  Bathroom = 'bathroom',
  Default = 'default',
  Room = 'room'
}