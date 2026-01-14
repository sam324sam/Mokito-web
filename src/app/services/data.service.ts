import { Injectable } from '@angular/core';
// Modelos
import { Pet } from '../models/pet/pet.model';
import { Color } from '../models/sprites/color.model';
import { AnimationSet } from '../models/sprites/animation-set.model';
import { AnimationType } from '../models/sprites/animation-sprite.model';
import { Room } from '../models/room/room.model';
import { PetState } from '../models/pet/pet-state.model';
// Json de datos
import petDefault from '../../assets/config/default-pet.json';
import animationsPet from '../../assets/config/animations-pet.json';
import colorsJson from '../../assets/config/color-pet.json';
import roomsJson from '../../assets/config/room-pet.json';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Colores predefinidos
  colors: Color[] = {} as Color[];

  pet: Pet = {} as Pet;
  animationsCache: Record<number, AnimationSet[]> = {};

  rooms: Room[] = [];

  constructor() {
    this.initData();
  }

  /**
   * Inicializa los datos directamente sin JSON
   */
  initData() {
    this.loadFromJson();
  }

  /**
   * Cargar los datos del json por defecto
   */
  private loadFromJson() {
    // Cargar los colores
    this.colors = [...colorsJson.colors];
    // Cargar mascota
    const jsonPet = petDefault;

    const rawState = jsonPet.state;
    // Ver si el state es correcto
    const petState: PetState = Object.values(PetState).includes(rawState as PetState)
      ? (rawState as PetState)
      : PetState.Idle;

    this.pet = {
      ...jsonPet,
      state: petState,
      conditions: new Set(),
      sprite: {
        ...jsonPet.sprite,
        color: this.colors[jsonPet.sprite.colorIndex],
        img: new Image(),
        animationSprite: {},
        frameCounter: 0,
        timeoutId: null,
      },
    };

    // Cargar animaciones
    const animations: AnimationSet[] = animationsPet.animations.map((a) => ({
      ...a,
      petId: this.pet.id,
      animationType: a.animationType as AnimationType,
    }));

    this.animationsCache[this.pet.id] = animations;

    // cargar room
    this.rooms = [...roomsJson.rooms];
  }

  // Devuelve la mascota
  getPet(): Pet {
    return this.pet;
  }

  getColors(): Color[] {
    return this.colors;
  }

  getRooms(): Room[] {
    return this.rooms;
  }

  /**
   * Devuelve las animaciones de la mascota
   */
  getAnimations(petId: number): AnimationSet[] {
    return this.animationsCache[petId] || [];
  }
}
