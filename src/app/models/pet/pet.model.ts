import { Entity } from '../entity/entity.model';

export interface Pet extends Entity {
  state: PetState;
  conditions: Set<PetCondition>;
  stats: Stats[];
  cheats: Cheats;
}

export interface Cheats {
  godMode: boolean;
  noMoreMove: boolean;
  noConditionProcces: boolean;
}

export interface Stats {
  name: string;
  porcent: number;
  decay: number;
  active: boolean;
}

export enum PetState {
  Idle = 'idle',
  Walking = 'walking',
  Grabbed = 'grabbed',
  Sleeping = 'sleeping',
  Reacting = 'reacting',
  Eating = 'eating',
  Bathing = 'bathing',
  Talking = 'talking',
  PlayBall = 'playBall',
}

export enum PetCondition {
  Dirty = 'dirty', // hygene < 15
  Tired = 'tired', // energia < 30
  Exhausted = 'exhausted', // energia < 15
  Happy = 'happy', // felicidad > 70
  Sad = 'sad', // felicidad < 30
  Depressed = 'depressed', // felicidad < 15
  Hungry = 'hungry', // hambre < 30
  Energetic = 'energetic', // energia > 70
}
