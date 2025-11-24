import { Injectable } from '@angular/core';
// modelos
import { Sprite } from '../models/sprites/sprites.model';
import { Pet } from '../models/pet/pet.model';
import { AnimationSprite, AnimationType } from '../models/sprites/animationSprite.model';
import { ReactiveFormsModule } from '@angular/forms';
@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly animations = [
    {
      name: 'idle',
      baseUrl: 'assets/pet/AnimationStanby/',
      frames: 30,
      animationType: AnimationType.Loop,
    },
    {
      name: 'tutsitutsi',
      baseUrl: 'assets/pet/tutsitutsi/',
      frames: 20,
      animationType: AnimationType.Once,
    },
    {
      name: 'grab',
      baseUrl: 'assets/pet/Grab/',
      frames: 11,
      animationType: AnimationType.Loop,
    },
  ];

  sprite: Sprite = {
    img: new Image(),
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    animationSprite: {},

    currentAnimation: 'idle',
    currentFrame: 0,
    frameSpeed: 10,
    frameCounter: 0,

    timeoutId: null,
  };

  pet: Pet = {
    sprite: this.sprite,
    isGrab: false,
  };

  initPetService(petImg: string) {
    this.sprite.img.src = petImg;
    this.loadAnimations();
  }

  // para las animaciones que se asiugnn arriba
  private loadAnimations() {
    for (const anim of this.animations) {
      const frames: HTMLImageElement[] = [];

      for (let i = 0; i < anim.frames; i++) {
        const frameImg = new Image();
        frameImg.src = `${anim.baseUrl}pixil-frame-${i}.png`;
        frames.push(frameImg);
      }

      const animation: AnimationSprite = {
        frameImg: frames,
        animationType: anim.animationType,
      };

      this.pet.sprite.animationSprite[anim.name] = animation;
    }
    console.log(this.pet, 'La mascota');
  }

  getMousePos(scale: number, evt: MouseEvent) {
    const rect = (evt.target as HTMLCanvasElement).getBoundingClientRect();

    return {
      x: ((evt.clientX - rect.left) / scale) - 15,
      y: ((evt.clientY - rect.top) / scale) - 15,
    };
  }

  movePet(scale: number, event: MouseEvent) {
    if (!this.pet.isGrab) return;

    const pos = this.getMousePos(scale, event);
    this.pet.sprite.x = pos.x;
    this.pet.sprite.y = pos.y;
  }
}
