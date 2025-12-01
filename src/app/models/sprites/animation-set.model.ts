import { AnimationType } from "./animationSprite.model";

// El name esta en el record
export interface AnimationSet {
  petId: number;
  name: string;
  baseUrl: string;
  frames: number;
  animationType: AnimationType;
}
