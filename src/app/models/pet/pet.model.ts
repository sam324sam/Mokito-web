import { Sprite } from '../sprites/sprites.model';
import { Stats } from './stats.model';
import { Cheats } from './cheats.model';
import { PetState } from './pet-state.model';
import { PetCondition } from './pet-condition.model';

export interface Pet {
  id: number;
  sprite: Sprite;

  state: PetState;
  conditions: Set<PetCondition>;

  stats: Stats[];
  cheats: Cheats;
}
