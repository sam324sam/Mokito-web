import { PetState, Stats} from '../../../models/pet/pet.model';
import { Sprite } from '../../../models/sprites/sprites.model';

export interface PetIaContext {
  getAnimationDuration(sprite: Sprite, name: string): number;
  setState(state: PetState): void;
  move(dx: number, dy: number): void;
  modifyStat(name: string, amount: number): void;
  getStat(name: string): Stats | null;
  sumMinusStat(name:string, n:number): void;
  setIdleAnimation(name: string): void;
  emitParticle(x: number, y: number): void;
}
