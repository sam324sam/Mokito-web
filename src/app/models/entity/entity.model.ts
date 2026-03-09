import { Sprite } from '../sprites/sprites.model';
import { Physics } from './physics.model';
import { Collider } from './collider.model';

export interface Entity {
  id: number | null;
  name: string;
  sprite: Sprite;
  active: boolean;
  tags: string[];

  physics?: Physics;
  collider?: Collider;
}
