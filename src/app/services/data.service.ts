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
import animations from '../../assets/config/animations.json';
import colorsJson from '../../assets/config/color-pet.json';
import roomsJson from '../../assets/config/room-pet.json';
import objectsJson from '../../assets/config/interactuable-object.json';
import particleTextureJson from '../../assets/config/particle-texture.json';
import musicJson from '../../assets/sound/music.json';
import efectsJson from '../../assets/sound/efects.json';
import doom from '../../assets/config/img/dom.json';
import { Entity } from '../models/entity/entity.model';

/**
 * Interfaz para los datos de animación crudos del JSON
 * No incluye petId ya que se agrega programáticamente
 */
interface RawAnimationSet {
  name: string;
  baseUrl: string;
  frames: number;
  animationType: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  // Colores predefinidos
  colors: Color[] = {} as Color[];

  pet: Pet = {} as Pet;
  petRuntime!: PetRuntime;
  objects: InteractuableObject[] = [];

  // Luego cargar la config de la particula para cargarla
  particleTexture: Record<string, HTMLImageElement> = {};

  animationsCache: Record<number, AnimationSet[]> = {};
  rooms: Room[] = [];

  music: Map<string, string> = new Map();
  efects: Map<string, string> = new Map();

  async loadAllAssets(): Promise<void> {
    // pet, rooms, objects
    this.loadFromJson();
    // imagenes del DOM
    await this.preloadImagesFromJson();

    // Preload de animaciones
    await this.loadAnimations(this.petRuntime);
    for (const object of this.objects) {
      await this.loadAnimations(object);
    }
  }

  /**
   *Precarga de imagenes del doom
   */
  async preloadImagesFromJson(): Promise<void> {
    const promises: Promise<void>[] = doom.images.map((src) =>
      this.loadImage(src)
        .then(() => {
          // se cargo la img
        })
        .catch((err) => {
          console.warn(`No se pudo cargar la imagen: ${src}`, err);
        }),
    );

    await Promise.all(promises);
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
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
        rotation: null,
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

    // cargar room
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
      // Precargar la imgen de la room para que deje de popear al cambiar de una vez
      this.loadImage(room.img);
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
          zIndex: element.sprite.zIndex ? element.sprite.zIndex : 1,
          color: null,
          img,
          animationSprite: {},
          frameCounter: 0,
          timeoutId: null,
          alpha: 100,
          rotation: null,
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

  /**
   * para las cargar las animaciones (se deve cambiar para poder meter animaciones a cualquier entidad)
   * @param entity - La entidad a la que se le cargarán las animaciones
   * @param rawAnimations - Array de animaciones crudas del JSON (sin petId)
   * @param petId - ID de la mascota para asociar las animaciones
   */
  async loadAnimations(entity: Entity): Promise<void> {
    entity.sprite.animationSprite = {};
    const rawAnimations = animations.find((o) => o.name === entity.name)?.animations;
    if (!rawAnimations) return;

    const promises: Promise<number>[] = [];

    for (const anim of rawAnimations) {
      const frames: HTMLImageElement[] = [];

      for (let i = 0; i < anim.frames; i++) {
        const frameSrc = `${anim.baseUrl}pixil-frame-${i}.png`;
        const promise = this.loadImage(frameSrc).then((img) => frames.push(img));
        promises.push(promise);
      }

      // Guardar el AnimationSprite temporalmente
      entity.sprite.animationSprite[anim.name] = {
        frameImg: frames,
        animationType: anim.animationType as AnimationType,
      };
    }

    await Promise.all(promises);
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
