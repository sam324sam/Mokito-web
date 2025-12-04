import { Injectable } from '@angular/core';
import { Pet } from '../models/pet/pet.model';
import { Color } from '../models/sprites/color.model';
import { AnimationSet } from '../models/sprites/animation-set.model';
import { AnimationType } from '../models/sprites/animationSprite.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Colores predefinidos
  readonly colors: Color[] = [
    { name: 'Azul suave', color: 'rgba(80, 120, 255, 0.25)' },
    { name: 'Rojo suave', color: 'rgba(255, 80, 80, 0.25)' },
    { name: 'Verde suave', color: 'rgba(80, 255, 150, 0.25)' },
    { name: 'Amarillo suave', color: 'rgba(255, 230, 80, 0.25)' },
    { name: 'Naranja suave', color: 'rgba(255, 150, 80, 0.25)' },
    { name: 'Morado suave', color: 'rgba(180, 80, 255, 0.25)' },
    { name: 'Blanco suave', color: 'rgba(255, 255, 255, 0.15)' },
    { name: 'Gris suave', color: 'rgba(120, 120, 120, 0.15)' },
  ];

  pet: Pet = {} as Pet;
  animationsCache: Record<number, AnimationSet[]> = {};

  constructor() {
    this.initData();
  }

  // Inicializa los datos directamente sin JSON
  initData() {
    // Mascota literal
    this.pet = {
      id: 0,
      isGrab: false,
      blockMove: false,
      sprite: {
        color: this.colors[1],
        img: new Image(),
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        scale: 1,
        animationSprite: {},
        currentAnimation: 'idle',
        currentFrame: 0,
        frameSpeed: 100,
        frameCounter: 0,
        timeoutId: null,
      },

      // El decay baja con porcentaje es decir si es = 1 baja un 1% por segund
      stats: [
        {
          name: 'hunger',
          decay: 0.103,
          porcent: 100,
          active: true,
        },
        {
          name: 'energy',
          decay: 0.102,
          porcent: 100,
          active: true,
        },
        {
          name: 'happiness',
          decay: 0.104,
          porcent: 100,
          active: true,
        },
        {
          name: 'hygiene',
          decay: 0.101,
          porcent: 100,
          active: true,
        },
      ],
    };

    // Animaciones literales
    this.animationsCache[this.pet.id] = [
      {
        name: 'idle',
        baseUrl: 'assets/pet/AnimationStanby/',
        frames: 30,
        animationType: AnimationType.Loop,
        petId: 0,
      },
      {
        name: 'tutsitutsi',
        baseUrl: 'assets/pet/tutsitutsi/',
        frames: 20,
        animationType: AnimationType.Once,
        petId: 0,
      },
      {
        name: 'grab',
        baseUrl: 'assets/pet/Grab/',
        frames: 11,
        animationType: AnimationType.Loop,
        petId: 0,
      },
      {
        name: 'right',
        baseUrl: 'assets/pet/Right/',
        frames: 12,
        animationType: AnimationType.Once,
        petId: 0,
      },
      {
        name: 'left',
        baseUrl: 'assets/pet/Left/',
        frames: 12,
        animationType: AnimationType.Once,
        petId: 0,
      },
      {
        name: 'up',
        baseUrl: 'assets/pet/Up/',
        frames: 12,
        animationType: AnimationType.Once,
        petId: 0,
      },
      {
        name: 'down',
        baseUrl: 'assets/pet/Down/',
        frames: 12,
        animationType: AnimationType.Once,
        petId: 0,
      },
    ];
  }

  // Devuelve la mascota
  getPet(): Pet {
    return this.pet;
  }

  // Devuelve las animaciones de la mascota
  getAnimations(petId: number): AnimationSet[] {
    return this.animationsCache[petId] || [];
  }
}
