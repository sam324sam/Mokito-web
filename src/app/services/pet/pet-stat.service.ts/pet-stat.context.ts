import { Stats } from '../../../models/pet/stats.model';

export interface PetStatContext {
  getStat(name: string): Stats | null;
  setIdleAnimation(name: string): void;
  setStats(stats:Stats[]): void;
}
