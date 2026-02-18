import { Entity } from '../entity/entity.model';
import { Sprite } from '../sprites/sprites.model';

export interface Message extends Entity {
  body: string;
  type: string;
  timeToLife: number;
  maxTimeToLife: number;
  stickyTarget?: {
    spriteTarget: Sprite;
    offsetX: number;
    offsetY: number;
  };
}
