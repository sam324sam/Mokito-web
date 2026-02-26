import { Stats } from '../../../models/pet/pet.model';

export interface PetStatContext {
  getStat(name: string): Stats | null;
  setStats(stats:Stats[]): void;
}
