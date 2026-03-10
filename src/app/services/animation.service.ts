import { Injectable } from '@angular/core';
// modelos
import { Sprite } from '../models/sprites/sprites.model';
// Servicio
import { EntityStoreService } from './entity-store.service';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  constructor(private readonly entityStoreService: EntityStoreService) {}

  update(deltaTime: number) {
    const entities = this.entityStoreService.getZOrder();
    for (const entitie of entities) {
      const anim = entitie.sprite.animationSprite[entitie.sprite.currentAnimation];
      if (!anim) continue;

      entitie.sprite.frameCounter += deltaTime;

      if (entitie.sprite.frameCounter >= entitie.sprite.frameSpeed) {
        entitie.sprite.frameCounter -= entitie.sprite.frameSpeed;
        entitie.sprite.currentFrame++;

        const totalFrames = anim.frameCount;
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

  getAnimation(sprite: Sprite) {
    return sprite.animationSprite[sprite.currentAnimation] ?? null;
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

    return anim.frameCount * sprite.frameSpeed;
  }

  /**
   * Duracion de la animacion en frames
   */
  getAnimationDurationFrames(sprite: Sprite, animationName: string): number {
    const anim = sprite.animationSprite[animationName];
    if (!anim) return 0;

    return anim.frameCount;
  }
}
