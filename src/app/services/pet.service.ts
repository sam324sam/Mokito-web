import { Injectable, signal } from '@angular/core';
// modelos
import { Pet } from '../models/pet/pet.model';
import { AnimationSprite } from '../models/sprites/animationSprite.model';
import { AnimationSet } from '../models/sprites/animation-set.model';
import { Stats } from '../models/pet/stats.model';
// Servicios
import { CollisionService } from './collision.service';
import { SpriteService } from './sprites.service';
import { AnimationService } from './animation.service';
import { DataService } from './data.service';
import { PetIaService } from './pet-ia.service';

@Injectable({ providedIn: 'root' })
export class PetService {
  readonly colors = [
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
  // Para el ui de stats
  statsChanged = signal<Stats[]>([]);
  animations: AnimationSet[] = [];
  activeIa: boolean = true;

  private pressTimer: any = null;
  private readonly LONG_PRESS = 250;
  private pointerOffsetX = 0;
  private pointerOffsetY = 0;

  constructor(
    private readonly collisionService: CollisionService,
    private readonly spriteService: SpriteService,
    private readonly animationService: AnimationService,
    private readonly dataService: DataService,
    private readonly petIaService: PetIaService
  ) {}

  update(delta: number) {
    if (this.activeIa) {
      this.petIaService.update(
        this.pet,
        // Injeccion de metodos para evitar dependencias circulares solo le paso los metodos que requiere
        (dir) => this.getAnimationDuration(dir), // funcion que devuelve duracion
        (dir) => this.setAnimation(dir), // funcion que cambia animacion
        (dx, dy) => this.movePet(dx, dy)
      );
    }
    this.updateStats(delta);
  }

  movePet(dx: number, dy: number) {
    this.pet.sprite.x += dx;
    this.pet.sprite.y += dy;
  }

  initPetService(scale: number) {
    this.pet = this.dataService.getPet();

    // la escala que de el sprite service
    this.pet.sprite.scale = scale;

    // cargar animaciones
    const animations = this.dataService.getAnimations(this.pet.id);
    this.animations = animations;

    this.animationService.loadAnimations(this.pet, animations);
    this.loadAnimations();
    console.log('pet:', this.pet);
  }

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
  }

  getMousePos(scale: number, evt: MouseEvent) {
    const rect = (evt.target as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) / scale,
      y: (evt.clientY - rect.top) / scale,
    };
  }

  handlePressDown(event: MouseEvent) {
    const scale = this.spriteService.getScale();
    const rect = this.spriteService.getCanvas().getBoundingClientRect();

    if (!this.isPetPresed(event)) {
      return;
    }

    this.clearPressTimer();

    this.pressTimer = setTimeout(() => {
      this.pet.isGrab = true;

      this.pointerOffsetX = event.clientX - rect.left - this.pet.sprite.x * scale;
      this.pointerOffsetY = event.clientY - rect.top - this.pet.sprite.y * scale;

      this.pet.sprite.currentAnimation = 'grab';
      this.pet.sprite.currentFrame = 0;
    }, this.LONG_PRESS);
  }

  handlePressUp(event: MouseEvent) {
    this.clearPressTimer();

    this.pet.isGrab = false;
    if (!this.isPetPresed(event)) {
      return;
    }

    this.pet.sprite.currentAnimation = 'tutsitutsi';
    this.pet.sprite.currentFrame = 0;
    this.pet.blockMove = true;

    setTimeout(() => {
      this.pet.blockMove = false;
    }, this.animationService.getAnimationDuration(this.pet.sprite));
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

    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));

    this.pet.sprite.x = clampedX;
    this.pet.sprite.y = clampedY;
  }

  // quitar el timer al parar de precionar
  clearPressTimer() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  // Cuando es precionada la mascta
  isPetPresed(event: MouseEvent) {
    const scale = this.spriteService.getScale();
    const rect = this.spriteService.getCanvas().getBoundingClientRect();
    const mx = (event.clientX - rect.left) / scale;
    const my = (event.clientY - rect.top) / scale;
    return this.collisionService.isPointInsideSprite(this.pet.sprite, mx, my);
  }

  // Setear las animacines
  setAnimation(name: string) {
    if (!this.pet.sprite.animationSprite[name]) return;
    if (this.pet.sprite.currentAnimation === name) return;

    this.pet.sprite.currentAnimation = name;
    this.pet.sprite.currentFrame = 0;
    this.pet.sprite.frameCounter = 0;
  }

  getAnimationDuration(animationName: string): number {
    return this.animationService.getAnimationDurationFrames(this.pet.sprite, animationName);
  }

  // Para bajar las estadisticas
  private updateStats(delta: number) {
    const dt = delta / 1000;

    for (const stat of this.pet.stats) {
      if (stat.active) {
        stat.porcent = Math.max(0, stat.porcent - stat.decay * dt);
      }
    }

    // Ntificacion para aplicar los cambios
    this.statsChanged.set([...this.pet.stats]);
  }
}
