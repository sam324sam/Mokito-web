// El name esta en el record
export interface AnimationSprite {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  animationType: AnimationType;
  description: string;
}

export interface AnimationFromJson {
  name: string;
  src: string;
  frames: number;
  animationType: string;
  description: string;
}

export interface AnimationSaveDb {
  blob: Blob;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
}

export enum AnimationType {
  loop = 'loop',
  once = 'once',
}
