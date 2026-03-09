import { Pet } from './pet.model';
import { Grab } from '../entity/grab.model';

export interface PetRuntime extends Pet, Partial<Grab> {}
