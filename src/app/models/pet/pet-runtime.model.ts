import { Pet } from './pet.model';
import { Grab } from '../entity/grab.model';
import { Collider } from '../entity/collider.model';
import { Physics } from '../entity/physics.model';

export interface PetRuntime extends Pet, Partial<Grab>, Partial<Collider>, Partial<Physics> {}
