import { Injectable } from '@angular/core';
// modelos
import { Sprite } from '../models/sprites/sprites.model';
import { Pet } from '../models/pet/pet.model';
import { AnimationSprite, AnimationType } from '../models/sprites/animationSprite.model';
// Servicios
import { CollisionService } from './collision.service';
import { SpriteService } from './sprites.service';

@Injectable({ providedIn: 'root' })
export class PetService {
  // tonos muy suaves para no afectar casi nada al negro
  private readonly colors = [
    'rgba(80, 120, 255, 0.25)', // azul suave
    'rgba(255, 80, 80, 0.25)', // rojo suave
    'rgba(80, 255, 150, 0.25)', // verde suave
    'rgba(255, 230, 80, 0.25)', // amarillo suave
    'rgba(255, 150, 80, 0.25)', // naranja suave
    'rgba(180, 80, 255, 0.25)', // morado suave
    'rgba(255, 255, 255, 0.15)', // blanco suave
    'rgba(120, 120, 120, 0.15)', // gris suave
  ];

  private readonly animations = [
    {
      name: 'idle',
      baseUrl: 'assets/pet/AnimationStanby/',
      frames: 30,
      animationType: AnimationType.Loop,
    },
    {
      name: 'tutsitutsi',
      baseUrl: 'assets/pet/tutsitutsi/',
      frames: 20,
      animationType: AnimationType.Once,
    },
    {
      name: 'grab',
      baseUrl: 'assets/pet/Grab/',
      frames: 11,
      animationType: AnimationType.Loop,
    },
    {
      name: 'right',
      baseUrl: 'assets/pet/Right/',
      frames: 12,
      animationType: AnimationType.Once,
    },
    {
      name: 'left',
      baseUrl: 'assets/pet/Left/',
      frames: 12,
      animationType: AnimationType.Once,
    },
    {
      name: 'up',
      baseUrl: 'assets/pet/Up/',
      frames: 12,
      animationType: AnimationType.Once,
    },
    {
      name: 'down',
      baseUrl: 'assets/pet/Down/',
      frames: 12,
      animationType: AnimationType.Once,
    },
  ];

  sprite: Sprite = {
    color: this.colors[1],
    img: new Image(),
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    animationSprite: {},
    scale: 1,

    currentAnimation: 'idle',
    currentFrame: 0,
    frameSpeed: 10,
    frameCounter: 0,

    timeoutId: null,
  };

  pet: Pet = {
    sprite: this.sprite,
    isGrab: false,
    blockMove: false
  };

  private pressTimer: any = null;
  private readonly LONG_PRESS = 250;
  private pointerOffsetX = 0;
  private pointerOffsetY = 0;

  constructor(
    private readonly collisionService: CollisionService,
    private readonly spriteService: SpriteService
  ) {}

  initPetService(petImg: string, scale: number) {
    this.sprite.img.src = petImg;
    this.sprite.scale = scale;
    this.loadAnimations();
  }

  // para las animaciones que se asiugnn arriba
  private loadAnimations() {
    for (const anim of this.animations) {
      const frames: HTMLImageElement[] = [];

      for (let i = 0; i < anim.frames; i++) {
        const frameImg = new Image();
        frameImg.src = `${anim.baseUrl}pixil-frame-${i}.png`;
        frames.push(frameImg);
      }

      const animation: AnimationSprite = {
        frameImg: frames,
        animationType: anim.animationType,
      };

      this.pet.sprite.animationSprite[anim.name] = animation;
    }
    console.log(this.pet, 'La mascota');
  }

  getMousePos(scale: number, evt: MouseEvent) {
    const rect = (evt.target as HTMLCanvasElement).getBoundingClientRect();
    console.log('Escala del sprite', scale);
    return {
      x: (evt.clientX - rect.left) / scale,
      y: (evt.clientY - rect.top) / scale,
    };
  }

  handlePressDown(event: MouseEvent) {
    const scale = this.spriteService.getScale();
    const rect = this.spriteService.getCanvas().getBoundingClientRect();
    const mx = (event.clientX - rect.left) / scale;
    const my = (event.clientY - rect.top) / scale;
    // no iniciar timer si no esta sobre la mascota
    if (!this.collisionService.isPointInsideSprite(this.pet.sprite, mx, my)) {
      return;
    }
    this.clearPressTimer();
    this.pressTimer = setTimeout(() => {
      this.pet.isGrab = true;
      // guardar offset relativo para que el sprite no "salte" al puntero
      this.pointerOffsetX = event.clientX - rect.left - this.pet.sprite.x * scale;
      this.pointerOffsetY = event.clientY - rect.top - this.pet.sprite.y * scale;
      this.spriteService.changesAnimationClick(event, 'grab');
    }, this.LONG_PRESS);
  }

  handlePressUp(event: MouseEvent) {
    this.clearPressTimer();

    this.pet.isGrab = false;

    this.spriteService.changesAnimationClick(event, 'tutsitutsi');
    // desactivar movimiento hasta que tutsi tutsi se acabe
    this.pet.blockMove = true;
    setTimeout(() =>{
      this.pet.blockMove = false;
    }, this.spriteService.getAnimationDuration(this.pet.sprite))
  }

  handleMouseMove(event: MouseEvent) {
    if (!this.pet.isGrab) return;

    const canvas = this.spriteService.getCanvas();

    const newX = (event.offsetX - this.pointerOffsetX) / this.pet.sprite.scale;
    const newY = (event.offsetY - this.pointerOffsetY) / this.pet.sprite.scale;

    const maxX =
      (canvas.width - this.pet.sprite.width * this.pet.sprite.scale) / this.pet.sprite.scale;
    const maxY =
      (canvas.height - this.pet.sprite.height * this.pet.sprite.scale) / this.pet.sprite.scale;

    this.pet.sprite.x = Math.max(0, Math.min(newX, maxX));
    this.pet.sprite.y = Math.max(0, Math.min(newY, maxY));
  }

  clearPressTimer() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  // Para el manejo de las animaciones dentro del petService para el movimiento
  setAnimation(name: string) {
    // si la animacion no existe no hacer nada
    if (!this.sprite.animationSprite[name]) return;

    // si ya está en esa animación → no volver a setear
    if (this.sprite.currentAnimation === name) return;

    // Cambiar ahora
    this.sprite.currentAnimation = name;

    // Forzar el cambio de animacion
    this.sprite.currentFrame = 0;
    this.sprite.frameCounter = 0;
  }

  getAnimationDuration(animationName: string): number {
    return this.spriteService.getAnimationDurationFrames(this.pet.sprite, animationName);
  }
}
