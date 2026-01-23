import { Injectable } from '@angular/core';
// Modelos
import { Pet, PetState } from '../models/pet/pet.model';
import { Color } from '../models/sprites/color.model';
import { AnimationSet } from '../models/sprites/animation-set.model';
import { AnimationType } from '../models/sprites/animation-sprite.model';
import { Room } from '../models/room/room.model';
import { InteractuableObject, ObjectType } from '../models/object/interactuable-object.model';
import { PetRuntime } from '../models/pet/pet-runtime.model';
// Servicios
import { EntityStoreService } from './entity-store.service';
// Json de datos
import petDefault from '../../assets/config/default-pet.json';
import animationsPet from '../../assets/config/animations-pet.json';
import colorsJson from '../../assets/config/color-pet.json';
import roomsJson from '../../assets/config/room-pet.json';
import objectsJson from '../../assets/config/interactuable-object.json';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Colores predefinidos
  colors: Color[] = {} as Color[];

  pet: Pet = {} as Pet;
  petRuntime!: PetRuntime;

  animationsCache: Record<number, AnimationSet[]> = {};

  rooms: Room[] = [];

  objects: InteractuableObject[] = [];

  constructor(private readonly entityStoreService: EntityStoreService) {
    this.initData();
  }

  /**
   * Inicializa los datos directamente sin JSON
   */
  initData() {
    this.loadFromJson();
    // Agregar la mascota al entity store
    //this.entityStoreService.add(this.petRuntime);
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

    this.petRuntime = {
      ...jsonPet,
      state: petState,
      conditions: new Set(),
      active: true,
      sprite: {
        ...jsonPet.sprite,
        color: this.colors[jsonPet.sprite.colorIndex],
        img: new Image(),
        animationSprite: {},
        frameCounter: 0,
        timeoutId: null,
      },
      // runtime components
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
    this.rooms = [...roomsJson.rooms];

    // cargar los objetos
    const objTimeToLife = 50000;
    this.objects = objectsJson.map((element) => {
      const img = new Image();
      img.src = element.sprite.img;

      return {
        ...element,
        type: element.type as ObjectType,
        sprite: {
          ...element.sprite,
          color: null,
          img,
          animationSprite: {},
          frameCounter: 0,
          timeoutId: null,
        },
        timeToLife: objTimeToLife,
        active: true,
      };
    });
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
