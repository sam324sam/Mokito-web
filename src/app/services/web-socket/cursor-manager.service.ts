import { Injectable } from '@angular/core';

import { Cursor, User } from '../../models/player/player-data.model';
import { Entity } from '../../models/entity/entity.model';
import { EntityStoreService } from '../entity-store.service';

import { lerpEntity } from './helpers/lerp.helper';

@Injectable({
  providedIn: 'root',
})
export class CursorManagerService {
  private readonly cursorEntities: Record<string, Entity> = {};
  private readonly pendingCursorMoves: Map<string, { user: User; localX: number; localY: number }> =
    new Map();

  constructor(private readonly entityStoreService: EntityStoreService) {}

  createCursorEntity(user: User): Entity {
    let entity: Entity = {} as Entity;
    try {
      if (user.cursor && user.userId) {
        const newImage = new Image();
        newImage.src = user.cursor.src || 'assets/img/cursor/cursor.png';
        entity = {
          id: null,
          name: `cursor_${user.userId}`,
          active: true,
          tags: ['cursor', 'remote'],
          sprite: {
            img: newImage,
            x: user.cursor.x,
            y: user.cursor.y,
            width: 32,
            height: 32,
            spriteScale: 0.25,
            totalScale: 1,
            canvasScale: 1,
            color: null,
            alpha: 100,
            currentAnimation: '',
            currentFrame: 0,
            frameSpeed: 0,
            frameCounter: 0,
            timeoutId: null,
            rotation: null,
            animationSprite: {},
            zIndex: -2,
          },
        };
        this.entityStoreService.addEntity(entity);
        this.cursorEntities[user.userId] = entity;
      }
    } catch (error) {
      console.log(error);
    }
    return entity;
  }

  removeCursorEntity(userId: string) {
    if (this.cursorEntities[userId]) {
      this.entityStoreService.removeEntity(this.cursorEntities[userId].id);
      delete this.cursorEntities[userId];
    }
  }

  getCursorEntityByUserId(userId: string): Entity {
    return this.cursorEntities[userId];
  }

  updateCursorPosition(userId: string, x: number, y: number) {
    const entity = this.cursorEntities[userId];
    if (entity?.sprite) {
      entity.sprite.x = x;
      entity.sprite.y = y;
    }
  }

  setUserCursor(user: User, cursor: Cursor) {
    user.cursor = cursor;
    if (user.userId && this.cursorEntities[user.userId]) {
      const entity = this.cursorEntities[user.userId];
      if (entity.sprite) {
        entity.sprite.x = cursor.x;
        entity.sprite.y = cursor.y;
      }
    }
  }

  enqueueCursorMove(user: User, localX: number, localY: number) {
    this.pendingCursorMoves.set(user.userId!, { user, localX, localY });
  }

  update(deltaTime: number) {
    for (const [userId, { user, localX, localY }] of this.pendingCursorMoves) {
      const entity = this.cursorEntities[userId];
      if (!entity?.sprite) continue;

      lerpEntity(entity, localX, localY, deltaTime);

      if (user.cursor && entity.sprite.img.src !== user.cursor.src) {
        entity.sprite.img = new Image();
        entity.sprite.img.src = user.cursor.src;
      }
    }
    this.pendingCursorMoves.clear();
  }
}
