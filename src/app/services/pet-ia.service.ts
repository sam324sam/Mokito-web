import { Injectable } from '@angular/core';
import { CollisionService } from './collision.service';
import { Pet } from '../models/pet/pet.model';
import { Stats } from '../models/pet/stats.model';

type Direction = 'left' | 'right' | 'up' | 'down';

@Injectable({ providedIn: 'root' })
export class PetIaService {
  private canvas!: HTMLCanvasElement;

  private moving = false;
  private direction: Direction | 'idle' = 'idle';
  // pixeles por frame
  private readonly speed = 1;
  // Para el movimiento
  private targetDistance = 0;
  private movedDistance = 0;
  private lastDecisionTime = 0;
  private readonly decisionCooldown = 2500;

  // para los estados del idle
  private actualIdle: string = '';

  constructor(private readonly collisionService: CollisionService) {}

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  update(
    pet: Pet,
    getAnimationDuration: (dir: string) => number,
    setAnimation: (dir: string) => void,
    movePet: (dx: number, dy: number) => void,
    sumMinusStat: (dx: any, dy: any) => void,
    getStatPet: (dir: any) => Stats | null,
    setIdleAnimation: (dir: string) => void
  ) {
    this.moveProcess(pet, getAnimationDuration, setAnimation, movePet, sumMinusStat, getStatPet);
    this.statsProcess(setIdleAnimation, getStatPet);
  }

  /**
   * Para la organizacion y uso de los comportamientos segun el estado de la pet
   */
  private statsProcess(
    setIdleAnimation: (dir: string) => void,
    getStatPet: (dir: string) => Stats | null
  ) {
    // seccion para la felicidad
    const happiness: Stats | null = getStatPet('happiness');
    if (happiness) {
      if (happiness.porcent > 65) {
        if (this.actualIdle === 'happiness100') return;
        setIdleAnimation('happiness100');
        this.actualIdle = 'happiness100';
      } else if (happiness.porcent <= 65 && happiness.porcent >= 15) {
        if (this.actualIdle === 'happiness65') return;
        setIdleAnimation('happiness65');
        this.actualIdle = 'happiness65';
      } else {
        if (this.actualIdle === 'happiness15') return;
        setIdleAnimation('happiness15');
        this.actualIdle = 'happiness15';
      }
    }
  }

  /**
   * Procesa toda la logica de IA de la mascota
   */
  private moveProcess(
    pet: Pet,
    getAnimationDuration: (dir: string) => number,
    setAnimation: (dir: string) => void,
    movePet: (dx: number, dy: number) => void,
    sumMinusStat: (dx: any, dy: any) => void,
    getStatPet: (dir: any) => Stats | null
  ) {
    // No realizar el movimiento si esto se cumple
    if (!pet.sprite || pet.cheats.noMoreMove) return;

    const now = performance.now();

    // Solo tomar decisiones si no esta agarrada ni bloqueada
    if (now - this.lastDecisionTime > this.decisionCooldown && !pet.isGrab && !pet.blockMove) {
      this.lastDecisionTime = now;
      this.startMovementFromAnimationDuration(pet, getAnimationDuration, setAnimation, getStatPet);
    }

    // Si esta agarrada o bloqueada, detener el movimiento actual
    if (pet.isGrab || pet.blockMove) {
      if (this.moving) {
        this.stop();
      }
      return;
    }

    // Si no se esta moviendo, no hacer nada
    if (!this.moving) return;

    // Ejecutar el movimiento actual
    this.executeMovement(pet, movePet, sumMinusStat);
  }

  /**
   * Ejecuta el movimiento frame a frame
   */
  private executeMovement(
    pet: Pet,
    movePet: (dx: number, dy: number) => void,
    sumMinusStat: (dx: any, dy: any) => void
  ) {
    let dx = 0,
      dy = 0;
    switch (this.direction) {
      case 'left':
        dx = -this.speed;
        break;
      case 'right':
        dx = this.speed;
        break;
      case 'up':
        dy = -this.speed;
        break;
      case 'down':
        dy = this.speed;
        break;
    }

    // Verificar colision antes de mover
    if (
      this.collisionService.checkCollision(
        pet.sprite.x + dx,
        pet.sprite.y + dy,
        pet.sprite.width,
        pet.sprite.height,
        this.canvas
      )
    ) {
      this.stop();
      return;
    }

    // se mueve le llama al metod de pet
    movePet(dx, dy);
    this.movedDistance += Math.abs(dx) + Math.abs(dy);

    if (this.movedDistance >= this.targetDistance) {
      this.stop();
      sumMinusStat('energy', -3);
    }
  }

  // Detener el movimiento
  private stop() {
    this.moving = false;
    this.direction = 'idle';
  }

  private canMoveFullAnimation(pet: Pet, direction: Direction): boolean {
    const sprite = pet.sprite;
    if (!sprite) return false;

    let dx = 0,
      dy = 0;
    switch (direction) {
      case 'left':
        dx = -this.speed;
        break;
      case 'right':
        dx = this.speed;
        break;
      case 'up':
        dy = -this.speed;
        break;
      case 'down':
        dy = this.speed;
        break;
    }

    // Calcular la posicion final despues de moverse la distancia completa
    const finalX = sprite.x + dx * this.targetDistance;
    const finalY = sprite.y + dy * this.targetDistance;

    // Verificar solo la posicion final en lugar de cada pixel
    const canMove = !this.collisionService.checkCollision(
      finalX,
      finalY,
      sprite.width,
      sprite.height,
      this.canvas
    );

    return canMove;
  }

  private shuffleArray<T>(array: T[]): T[] {
    // Creamos una copia del array original para no modificarlo
    const shuffled = [...array];

    // Recorremos el array de atras hacia adelante
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Elegimos un indice aleatorio entre 0 e i
      const j = Math.floor(Math.random() * (i + 1));

      // se cambian los elementos en las posiciones i y j
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // array mezclado
    return shuffled;
  }

  private startMovementFromAnimationDuration(
    pet: Pet,
    getAnimationDuration: (dir: string) => number,
    setAnimation: (dir: string) => void,
    getStatPet: (dir: any) => Stats | null
  ) {
    if (Math.random() < this.decisionMove(getStatPet)) {
      // Decidio no moverse
      return;
    }

    const directions: Direction[] = ['left', 'right', 'up', 'down'];
    const shuffledDirections = this.shuffleArray(directions);

    for (const dir of shuffledDirections) {
      const animDurationMs = getAnimationDuration(dir);

      const framesInAnimation = animDurationMs / 16.67;
      this.targetDistance = Math.floor(framesInAnimation * this.speed);
      this.movedDistance = 0;

      // ver a veces falla
      if (this.canMoveFullAnimation(pet, dir)) {
        this.direction = dir;
        this.moving = true;
        setAnimation(dir);
        return;
      }
    }
    //No se encontro ninguna direccion valida
  }

  /**
   * Funcion para calcular la descion de moverse segun stats como la energia
   */
  private decisionMove(getStatPet: (dir: any) => Stats | null): number {
    let probability: number = 0;
    const happiness: Stats | null = getStatPet('energy');
    if (happiness) {
      if (happiness.porcent > 65) {
        probability = 0.5;
      } else if (happiness.porcent <= 65 && happiness.porcent >= 15) {
        probability = 0.3;
      } else {
        probability = 0.1;
      }
    }
    return probability;
  }
}
