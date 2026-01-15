import { PetState } from '../../../models/pet/pet-state.model';
import { Pet } from '../../../models/pet/pet.model';
import { Stats } from '../../../models/pet/stats.model';

export interface PetStateContext {
  setState(state: PetState): void;
  getStat(name: string): Stats | null;
  setAnimation(name: string): void;
  sumMinusStat(name: string, value: number): void;
  getDirection(): string;
  clearDirection(): void;
  runIaIdle(pet: Pet, delta: number): void;
  runIaWalk(pet: Pet, delta: number): void;
}
