import { Sprite } from '../sprites/sprites.model';

export interface Pet {
  id: number;
  sprite: Sprite;
  isGrab: boolean;
  blockMove: boolean;
}
