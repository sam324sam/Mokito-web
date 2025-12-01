import { Injectable } from '@angular/core';
// modelos
import { Sprite } from '../models/sprites/sprites.model';
import { AnimationSet } from '../models/sprites/animation-set.model';
import { AnimationSprite } from '../models/sprites/animationSprite.model';
import { Pet } from '../models/pet/pet.model';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  private sprites: Sprite[] = [];

  addSprite(sprite: Sprite) {
    this.sprites.push(sprite);
  }

  deleteSprite(sprite: Sprite) {
    this.sprites = this.sprites.filter((s) => s !== sprite);
  }

  update(deltaTime: number) {
    for (const sprite of this.sprites) {
      const anim = sprite.animationSprite[sprite.currentAnimation];
      if (!anim) continue;

      // deltaTime está en ms
      sprite.frameCounter += deltaTime;

      // frameSpeed también debe estar en ms por frame
      if (sprite.frameCounter >= sprite.frameSpeed) {
        sprite.frameCounter -= sprite.frameSpeed; // no =0 para no perder exceso
        sprite.currentFrame++;

        const totalFrames = anim.frameImg.length;
        if (sprite.currentFrame >= totalFrames) {
          if (anim.animationType === 'loop') {
            sprite.currentFrame = 0;
          } else if (anim.animationType === 'once') {
            sprite.currentAnimation = 'idle';
            sprite.currentFrame = 0;
          }
        }
      }
    }
  }

  getFrame(sprite: Sprite) {
    const animation = sprite.animationSprite[sprite.currentAnimation];

    // Si la animación aún no existe o no tiene frames, evitar error
    if (!animation?.frameImg || animation.frameImg.length === 0) {
      return null;
    }

    return animation.frameImg[sprite.currentFrame] ?? animation.frameImg[0];
  }

  // Duracion de la animacion en segundos
  getAnimationDuration(sprite: Sprite): number {
    const frames = sprite.animationSprite[sprite.currentAnimation].frameImg.length;
    // total de ticks
    return frames * sprite.frameSpeed;
  }

  // Duracion de la animacion en frames
  getAnimationDurationFrames(sprite: Sprite, animationName: string): number {
    const anim = sprite.animationSprite[animationName];
    if (!anim) return 0;

    const totalFrames = anim.frameImg.length;
    const frameSpeed = sprite.frameSpeed;
    // frames
    return totalFrames * frameSpeed;
  }

  // para las animaciones que se asiugnn arriba
  loadAnimations(pet: Pet, animations: AnimationSet[]) {
    for (const anim of animations) {
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

      pet.sprite.animationSprite[anim.name] = animation;
    }
    console.log(pet, 'La mascota');
    return pet;
  }
}
