import { PetState, Stats} from '../../../models/pet/pet.model';

export interface PetIaContext {
  getAnimationDuration(dir: string): number;
  setState(state: PetState): void;
  move(dx: number, dy: number): void;
  modifyStat(name: string, amount: number): void;
  getStat(name: string): Stats | null;
  sumMinusStat(name:string, n:number): void;
  setIdleAnimation(name: string): void;
  emitParticle(x: number, y: number): void;
}
