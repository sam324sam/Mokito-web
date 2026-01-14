import { Stats } from '../../../models/pet/stats.model';

export interface PetIaContext {
  getAnimationDuration(dir: string): number;
  setAnimation(dir: string): void;
  move(dx: number, dy: number): void;
  modifyStat(name: string, amount: number): void;
  getStat(name: string): Stats | null;
  sumMinusStat(name:string, n:number): void;
  setIdleAnimation(name: string): void;
  emitParticle(x: number, y: number): void;
}
