import { Sprite } from "../sprites/sprites.model";

export interface InteractuableObject {
  id: number;
  name: string;
  sprite: Sprite;
  type: ObjectType;
  timeToLife: number;
}

export enum ObjectType {
  Food = 'food',
  Toy = 'toy',
  Default = 'default'
}

export interface InteractuableObjectRuntime extends InteractuableObject {
  physics: {
    vx: number;
    vy: number;
    gravity: number;
    enabled: boolean;
  };

  collider: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  };

  isTouchingPet: boolean;
}
