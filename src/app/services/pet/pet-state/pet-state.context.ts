import { Pet, PetState, Stats} from '../../../models/pet/pet.model';

export interface PetStateContext {
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
