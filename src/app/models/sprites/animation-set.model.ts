import { AnimationType } from './animation-sprite.model';

/**
 * El name esta en el record
 */
export interface AnimationSet {
  petId: number;
  name: string;
  baseUrl: string;
  frames: number;
  animationType: AnimationType;
}
