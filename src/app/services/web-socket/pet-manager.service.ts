import { Injectable } from '@angular/core';

import { PetClient } from '../../models/player/player-data.model';
import { Entity } from '../../models/entity/entity.model';
import { EntityStoreService } from '../entity-store.service';

import { lerpEntity } from './helpers/lerp.helper';
import { UserManagerService } from './user-manager.service';

@Injectable({
  providedIn: 'root',
})
export class PetManagerService {
  private readonly petEntities: Record<string, Entity> = {};

  private readonly pendingPetMoves: Map<string, PetClient> = new Map();

  constructor(
    private readonly entityStoreService: EntityStoreService,
    private readonly userManagerService: UserManagerService,
  ) {}

  createPetEntity(petClient: PetClient, userId: string) {
    console.log('llego una pet', petClient);
    if (petClient.userId == userId) return;

    let entity: Entity = {} as Entity;
    try {
      const newImage = new Image();
      newImage.src = 'assets/img/pet/default.png';

      entity = {
        id: null,
        name: `pet_${petClient.userId}`,
        active: true,
        tags: ['pet_server', 'remote'],
        sprite: {
          img: newImage,
          x: petClient.x,
          y: petClient.y,
          width: 32,
          height: 32,
          spriteScale: 1,
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
          zIndex: -1,
        },
      };

      this.entityStoreService.addEntity(entity);
      this.petEntities[petClient.userId] = entity;
      console.log(this.petEntities);
    } catch (error) {
      console.log(error);
    }
  }

  removePetEntity(userId: string) {
    if (this.petEntities[userId]) {
      this.entityStoreService.removeEntity(this.petEntities[userId].id);
      delete this.petEntities[userId];
    }
  }

  getPetEntityByUserId(userId: string): Entity {
    return this.petEntities[userId];
  }

  updatePetPosition(userId: string, x: number, y: number) {
    const entity = this.petEntities[userId];
    if (entity?.sprite) {
      entity.sprite.x = x;
      entity.sprite.y = y;
    }
  }

  updatePet(petClient: PetClient) {
    const entity = this.petEntities[petClient.userId];
    if (entity?.sprite) {
      entity.sprite.x = petClient.x;
      entity.sprite.y = petClient.y;
    }
  }

  enqueuePetMove(petClient: PetClient, localUserId: string) {
    if (petClient.userId === localUserId) return;
    console.log(this.pendingPetMoves);
    this.pendingPetMoves.set(petClient.userId, petClient);
  }

  /**
   * Llamado cada frame desde el game loop
   */
  update(deltaTime: number) {
    for (const [userId, petClient] of this.pendingPetMoves) {
      const entity = this.petEntities[userId];
      if (entity?.sprite) {
        lerpEntity(entity, petClient.x, petClient.y, deltaTime);
      }
    }
    this.pendingPetMoves.clear();
  }
}
