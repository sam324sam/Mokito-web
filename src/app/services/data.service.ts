import { Injectable } from '@angular/core';
import { Pet } from '../models/pet/pet.model';
import { Sprite } from '../models/sprites/sprites.model';
import { Color } from '../models/sprites/color.model';
import { AnimationSet } from '../models/sprites/animation-set.model';
import { AnimationType } from '../models/sprites/animationSprite.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Colores predefinidos
  readonly colors: Color[] = [
    { name: 'azul suave', color: 'rgba(80, 120, 255, 0.25)' },
    { name: 'rojo suave', color: 'rgba(255, 80, 80, 0.25)' },
    { name: 'verde suave', color: 'rgba(80, 255, 150, 0.25)' },
    { name: 'amarillo suave', color: 'rgba(255, 230, 80, 0.25)' },
    { name: 'naranja suave', color: 'rgba(255, 150, 80, 0.25)' },
    { name: 'morado suave', color: 'rgba(180, 80, 255, 0.25)' },
    { name: 'blanco suave', color: 'rgba(255, 255, 255, 0.15)' },
    { name: 'gris suave', color: 'rgba(120, 120, 120, 0.15)' },
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
