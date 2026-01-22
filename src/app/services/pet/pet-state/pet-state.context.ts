import { Pet, PetState, Stats} from '../../../models/pet/pet.model';
import { Sprite } from '../../../models/sprites/sprites.model';

export interface PetStateContext {
  getAnimationDuration(sprite: Sprite): number;
  setState(state: PetState): void;
  getStat(name: string): Stats | null;
  setStatActive(name: string, active: boolean): void;
  setAnimation(name: string): void;
  sumMinusStat(name: string, value: number): void;
  getDirection(): string;
  clearDirection(): void;
  runIaIdle(pet: Pet, delta: number): void;
  runIaWalk(pet: Pet, delta: number): void;
}
