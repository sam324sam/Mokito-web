// El name esta en el record
export interface AnimationSprite {
  frameImg: HTMLImageElement[];
  animationType: AnimationType;
}

export enum AnimationType {
  loop = "loop",
  once = "once"
}
