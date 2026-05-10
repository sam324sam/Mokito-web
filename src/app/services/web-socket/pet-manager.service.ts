import { Injectable } from '@angular/core';

import { PetClient } from '../../models/player/player-data.model';
import { Entity } from '../../models/entity/entity.model';
import { EntityStoreService } from '../entity-store.service';

import { lerpEntity } from './helpers/lerp.helper';
import { imageToBlob } from './helpers/image-to-blob.helper';

import { AnimationSprite, AnimationType } from '../../models/sprites/animation-sprite.model';
import { PetService } from '../pet/pet.service';
import { SpriteResponseDto } from '../../models/dtos/sprite-response.dto';

@Injectable({
  providedIn: 'root',
})
export class PetManagerService {
  private readonly petEntities: Record<string, Entity> = {};

  private readonly pendingPetMoves: Map<string, PetClient> = new Map();

  constructor(
    private readonly entityStoreService: EntityStoreService,
    private readonly petService: PetService,
  ) {}

  createPetEntity(
    petClient: PetClient,
    userId: string | null,
    animationSprite: Record<string, AnimationSprite>,
  ) {
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
          frameSpeed: 100,
          frameCounter: 0,
          timeoutId: null,
          rotation: null,
          animationSprite: animationSprite,
          zIndex: -1,
        },
      };

      this.entityStoreService.addEntity(entity);
      this.petEntities[petClient.userId] = entity;
      console.log('entidad generada', entity);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   *
   */
  async generateFormdata(): Promise<FormData | null> {
    const animations: Record<string, AnimationSprite> = this.petService.pet.sprite.animationSprite;
    const entries = Object.entries(animations);

    const formData = new FormData();

    const metadata = entries.map(([name, anim]) => ({
      name,
      frameWidth: anim.frameWidth,
      frameHeight: anim.frameHeight,
      frameCount: anim.frameCount,
      animationType: anim.animationType,
    }));

    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

    const blobs = await Promise.all(
      entries.map(([name, anim]) =>
        imageToBlob(anim.image).catch((err) => {
          console.error(`Error generando blob para ${name}:`, err);
          return null;
        }),
      ),
    );

    entries.forEach(([name], i) => {
      if (blobs[i]) {
        formData.append('files', blobs[i], `${name}.png`);
      }
    });

    return formData;
  }

  async loadOtherPlayerSprites(userId: string): Promise<Record<string, AnimationSprite>> {
    const dtos: SpriteResponseDto[] = await fetch(
      `http://localhost:8080/pet/${userId}/sprites`,
    ).then((r) => r.json());

    console.log('sprites recibidos:', dtos);

    const entries = await Promise.all(
      dtos.map(
        (dto) =>
          new Promise<[string, AnimationSprite]>((resolve, reject) => {
            const img = new Image();
            img.onload = () =>
              resolve([
                dto.name,
                {
                  image: img,
                  frameWidth: dto.frameWidth,
                  frameHeight: dto.frameHeight,
                  frameCount: dto.frameCount,
                  animationType: dto.animationType as AnimationType,
                  description: '',
                },
              ]);
            img.onerror = () => reject(new Error(`Error cargando imagen: ${dto.name}`));
            img.src = `http://localhost:8080${dto.src}`;
          }),
      ),
    );

    return Object.fromEntries(entries);
  }

  /**
   * Elimina las todas las mascotas
   */
  clear() {
    for (const [userId, pet] of Object.entries(this.petEntities)) {
      this.entityStoreService.removeEntity(pet.id);
      delete this.petEntities[userId];
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

  enqueuePetMove(petClient: PetClient, localUserId: string) {
    if (petClient.userId === localUserId) return;
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
        this.setAnimation(entity, petClient.currentAnimation);
      }
    }
    this.pendingPetMoves.clear();
  }

  setAnimation(entity: Entity, name: string): void {
    if (!entity.sprite.animationSprite[name]) {
      console.log('La animacion de ' + name + ' no se a encotrado');
    }
    if (entity.sprite.currentAnimation === name) return;

    entity.sprite.currentAnimation = name;
    entity.sprite.currentFrame = 0;
    entity.sprite.frameCounter = 0;
  }
}
