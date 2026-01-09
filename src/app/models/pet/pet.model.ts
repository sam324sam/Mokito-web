import { Sprite } from '../sprites/sprites.model';
import { Stats } from './stats.model';
import { Cheats } from './cheats.model'

export interface Pet {
  id: number;
  sprite: Sprite;
  isGrab: boolean;
  blockMove: boolean;

  stats: Stats[];
  cheats: Cheats;
}