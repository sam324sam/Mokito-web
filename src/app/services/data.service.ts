import { Injectable } from '@angular/core';
// Modelos
import { Pet, PetState } from '../models/pet/pet.model';
import { Color } from '../models/sprites/color.model';
import { AnimationSprite, AnimationType } from '../models/sprites/animation-sprite.model';
import { Room } from '../models/room/room.model';
import { InteractuableObject, ObjectType } from '../models/object/interactuable-object.model';
import { PetRuntime } from '../models/pet/pet-runtime.model';

// Json de datos
import petDefault from '../../assets/config/default-pet.json';
import animationsJson from '../../assets/config/animations.json';
import colorsJson from '../../assets/config/color-pet.json';
import roomsJson from '../../assets/config/room-pet.json';
import objectsJson from '../../assets/config/interactuable-object.json';
import particleTextureJson from '../../assets/config/particle-texture.json';
import musicJson from '../../assets/sound/music.json';
import efectsJson from '../../assets/sound/efects.json';
import { Entity } from '../models/entity/entity.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Datos principales
  colors: Color[] = {} as Color[];
  pet: Pet = {} as Pet;
  petRuntime!: PetRuntime;
  objects: InteractuableObject[] = [];
  rooms: Room[] = [];

  // Recursos en memoria
  particleTexture: Record<string, HTMLImageElement> = {};
  music: Map<string, string> = new Map();
  efects: Map<string, string> = new Map();

  /**
   * Carga todos los assets iniciales de la aplicacion
   * Inicializa datos desde json y precarga animaciones
   */
  async loadAllAssets(): Promise<void> {
    this.loadFromJson();

    this.loadAnimations(this.petRuntime);

    for (const object of this.objects) {
      this.loadAnimations(object);
    }
  }

  /**
   * Inicializa todos los datos base desde los json
   * Colores, pet, rooms, objetos, particulas y sonidos
   */
  private loadFromJson() {
    // Colores
    this.colors = [...colorsJson.colors];

    // Mascota base
    const jsonPet = petDefault;
    const rawState = jsonPet.state;
    const petState: PetState = Object.values(PetState).includes(rawState as PetState)
      ? (rawState as PetState)
      : PetState.Idle;

    const imgDefault = new Image();
    imgDefault.src = jsonPet.sprite.img;

    this.petRuntime = {
      ...jsonPet,
      state: petState,
      conditions: new Set(),
      active: true,
      sprite: {
        ...jsonPet.sprite,
        color: this.colors[jsonPet.sprite.colorIndex],
        img: imgDefault,
        animationSprite: {},
        frameCounter: 0,
        timeoutId: null,
        alpha: 100,
        rotation: null,
      },
      grab: {
        isGrabbed: false,
        grabOffsetX: 0,
        grabOffsetY: 0,
      },
      collider: {
        offsetX: 0,
        offsetY: 0,
        width: jsonPet.sprite.width,
        height: jsonPet.sprite.width,
      },
    };

    // Rooms y objetos internos
    this.rooms = roomsJson.rooms.map((room) => {
      const objects: Record<string, InteractuableObject> = {};

      for (const object of room.objects) {
        const spriteImage = new Image();
        spriteImage.src = object.sprite.img;

        objects[object.name] = {
          ...object,
          id: null,
          type: object.type as ObjectType,
          tags: [...object.tags],
          active: true,
          timeToLife: 1,
          nameBehaviors: [],
          sprite: {
            ...object.sprite,
            zIndex: 1,
            color: null,
            img: spriteImage,
            animationSprite: {},
            frameCounter: 0,
            timeoutId: null,
            alpha: 100,
            rotation: null,
          },
        };
      }

      return {
        ...room,
        objects,
      };
    });

    // Objetos globales
    const objTimeToLife = 50000;

    this.objects = objectsJson.map((element) => {
      const img = new Image();
      img.src = element.sprite.img;

      return {
        id: null,
        ...element,
        type: element.type as ObjectType,
        sprite: {
          ...element.sprite,
          zIndex: element.sprite.zIndex ? element.sprite.zIndex : 1,
          color: null,
          img,
          animationSprite: {},
          frameCounter: 0,
          timeoutId: null,
          alpha: 100,
          rotation: null,
        },
        physics: {
          ...element.physics,
          vx: 0,
          vy: 0,
          gravity: 980,
          enabled: true,
        },
        timeToLife: objTimeToLife,
        active: true,
      };
    });

    // Texturas de particulas
    for (const tex of particleTextureJson.texture) {
      if (!tex.name) continue;

      const img = new Image();
      img.src = tex.src;
      this.particleTexture[tex.name] = img;
    }

    // Musica
    for (const element of musicJson) {
      this.music.set(element.name, element.src);
    }

    // Efectos
    for (const element of efectsJson) {
      this.efects.set(element.name, element.src);
    }
  }

  /**
   * Carga todas las animaciones asociadas a una entidad
   * Busca las animaciones en el json por nombre
   */
  loadAnimations(entity: Entity) {
    const rawAnimations = animationsJson.find((o) => o.name === entity.name)?.animations;
    if (!rawAnimations) return;
    for (const anim of rawAnimations) {
      const img = new Image();
      img.src = anim.src;

      const animation: AnimationSprite = {
        image: img,
        frameWidth: entity.sprite.width,
        frameHeight: entity.sprite.height,
        frameCount: anim.frames,
        animationType: anim.animationType as AnimationType,
      };

      entity.sprite.animationSprite[anim.name] = animation;
    }
  }

  /**
   * Devuelve las texturas de particulas
   */
  getParticleTexture(): Record<string, HTMLImageElement> {
    return this.particleTexture;
  }

  /**
   * Devuelve el mapa de musica
   */
  getMusic(): Map<string, string> {
    return this.music;
  }

  /**
   * Devuelve el mapa de efectos
   */
  getEfects(): Map<string, string> {
    return this.efects;
  }

  /**
   * Devuelve el runtime actual de la mascota
   */
  getPetRuntime(): Pet {
    return this.petRuntime;
  }

  /**
   * Devuelve los colores disponibles
   */
  getColors(): Color[] {
    return this.colors;
  }

  /**
   * Devuelve las rooms cargadas
   */
  getRooms(): Room[] {
    return this.rooms;
  }

  /**
   * Devuelve los objetos globales
   */
  getObjects(): InteractuableObject[] {
    return this.objects;
  }
}
