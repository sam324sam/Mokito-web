// El name esta en el record
export interface AnimationSprite {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  animationType: AnimationType;
}

export enum AnimationType {
  loop = 'loop',
  once = 'once',
}
