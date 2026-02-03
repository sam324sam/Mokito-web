import { Injectable } from '@angular/core';
// modelos
import { Sprite } from '../models/sprites/sprites.model';
import { AnimationSet } from '../models/sprites/animation-set.model';
import { AnimationSprite } from '../models/sprites/animation-sprite.model';
import { Pet } from '../models/pet/pet.model';
// Servicio
import { EntityStoreService } from './entity-store.service';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  constructor(private readonly entityStoreService: EntityStoreService) {}

  update(deltaTime: number) {
    const entities = this.entityStoreService.getAllEntities();
    for (const entitie of entities) {
      const anim = entitie.sprite.animationSprite[entitie.sprite.currentAnimation];
      if (!anim) continue;

      // deltaTime está en ms
      entitie.sprite.frameCounter += deltaTime;

      // frameSpeed también debe estar en ms por frame
      if (entitie.sprite.frameCounter >= entitie.sprite.frameSpeed) {
        entitie.sprite.frameCounter -= entitie.sprite.frameSpeed; // no =0 para no perder exceso
        entitie.sprite.currentFrame++;

        const totalFrames = anim.frameImg.length;
        if (entitie.sprite.currentFrame >= totalFrames) {
          if (anim.animationType === 'loop') {
            entitie.sprite.currentFrame = 0;
          } else if (anim.animationType === 'once') {
            entitie.sprite.currentAnimation = 'idle';
            entitie.sprite.currentFrame = 0;
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

  /**
   * Duracion de la animacion en milisegundos
   */
  getAnimationDuration(sprite: Sprite, animationName: string): number {
    const anim = sprite.animationSprite[animationName];
    if (!anim) return 0;

    if (anim.animationType === 'loop') {
      return Infinity;
    }

    return anim.frameImg.length * sprite.frameSpeed;
  }

  /**
   * Duracion de la animacion en frames
   */
  getAnimationDurationFrames(sprite: Sprite, animationName: string): number {
    const anim = sprite.animationSprite[animationName];
    if (!anim) return 0;

    const totalFrames = anim.frameImg.length;
    const frameSpeed = sprite.frameSpeed;
    // frames
    return totalFrames * frameSpeed;
  }

  /**
   * para las cargar las animaciones
   */
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
  }
}
