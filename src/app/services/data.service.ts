import { Injectable } from '@angular/core';
// Modelos
import { Pet, PetState } from '../models/pet/pet.model';
import { Color } from '../models/sprites/color.model';
import { AnimationSet } from '../models/sprites/animation-set.model';
import { AnimationType } from '../models/sprites/animation-sprite.model';
import { Room } from '../models/room/room.model';
import { InteractuableObject, ObjectType } from '../models/object/interactuable-object.model';
import { PetRuntime } from '../models/pet/pet-runtime.model';

// Json de datos
import petDefault from '../../assets/config/default-pet.json';
import animationsPet from '../../assets/config/animations-pet.json';
import colorsJson from '../../assets/config/color-pet.json';
import roomsJson from '../../assets/config/room-pet.json';
import objectsJson from '../../assets/config/interactuable-object.json';
import particleTextureJson from '../../assets/config/particle-texture.json';
import musicJson from '../../assets/sound/music.json';
import efectsJson from '../../assets/sound/efects.json';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Colores predefinidos
  colors: Color[] = {} as Color[];

  pet: Pet = {} as Pet;
  petRuntime!: PetRuntime;

  animationsCache: Record<number, AnimationSet[]> = {};

  rooms: Room[] = [];

  objects: InteractuableObject[] = [];

  particleTexture: Record<string, HTMLImageElement> = {};

  music: Map<string, string> = new Map();
  efects: Map<string, string> = new Map();

  constructor() {
    /**
     * Inicializa los datos directamente sin JSON
     */
    this.loadFromJson();
  }

  /**
   * Cargar los datos del json por defecto
   */
  private loadFromJson() {
    // Cargar los colores
    this.colors = [...colorsJson.colors];
    // Cargar mascota
    // Mascota
    const jsonPet = petDefault;
    const rawState = jsonPet.state;
    const petState: PetState = Object.values(PetState).includes(rawState as PetState)
      ? (rawState as PetState)
      : PetState.Idle;

    // Imagen default
    let imgDefault = new Image();
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
      },
      // runtime cambiar luego a otro sitio
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

    // Cargar animaciones
    const animations: AnimationSet[] = animationsPet.animations.map((a) => ({
      ...a,
      petId: this.pet.id,
      animationType: a.animationType as AnimationType,
    }));

    // De momento con el id que viene del json
    this.animationsCache[jsonPet.id] = animations;

    // cargar room
    this.rooms = roomsJson.rooms.map((room) => {
      const objects: Record<string, InteractuableObject> = {};

      for (const object of room.objects) {
        const spriteImage = new Image();
        spriteImage.src = object.sprite.img;

        objects[object.name] = {
          id: null,
          name: object.name,
          type: object.type as ObjectType,
          tags: [...object.tags],
          active: true,
          timeToLife: 1,
          nameBehaviors: [],
          sprite: {
            ...object.sprite,
            color: null,
            img: spriteImage,
            animationSprite: {},
            frameCounter: 0,
            timeoutId: null,
            alpha: 100,
          },
        };
      }
      return {
        ...room,
        objects,
      };
    });

    // cargar los objetos
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
          color: null,
          img,
          animationSprite: {},
          frameCounter: 0,
          timeoutId: null,
          alpha: 100,
        },
        timeToLife: objTimeToLife,
        active: true,
      };
    });

    // Carga las texturas de las particulas
    for (const tex of particleTextureJson.texture) {
      if (!tex.name) continue;

      const img = new Image();
      img.src = tex.src;

      this.particleTexture[tex.name] = img;
    }

    // Cargar los ejectos de sonido y musica
    for (const element of musicJson) {
      this.music.set(element.name, element.src);
    }
    for (const element of efectsJson) {
      this.efects.set(element.name, element.src);
    }
  }

  getParticleTexture(): Record<string, HTMLImageElement> {
    return this.particleTexture;
  }

  getMusic(): Map<string, string> {
    return this.music;
  }

  getEfects(): Map<string, string> {
    return this.efects;
  }

  // Devuelve la mascota
  getPetRuntime(): Pet {
    return this.petRuntime;
  }

  getColors(): Color[] {
    return this.colors;
  }

  getRooms(): Room[] {
    return this.rooms;
  }

  getObjects(): InteractuableObject[] {
    return this.objects;
  }

  /**
   * Devuelve las animaciones de la mascota
   */
  getAnimations(petId: number): AnimationSet[] {
    console.log('Animaciones en cache', this.animationsCache[petId]);
    return this.animationsCache[petId] || [];
  }
}
