import { Injectable } from '@angular/core';
import { CollisionService } from './collision.service';
import { Pet } from '../models/pet/pet.model';

type Direction = 'left' | 'right' | 'up' | 'down';

@Injectable({ providedIn: 'root' })
export class PetIaService {
  private canvas!: HTMLCanvasElement;

  private moving = false;
  private direction: Direction | 'idle' = 'idle';
  // pixeles por frame
  private readonly speed = 1;

  private targetDistance = 0;
  private movedDistance = 0;

  private lastDecisionTime = 0;
  private readonly decisionCooldown = 2500;

  constructor(private readonly collisionService: CollisionService) {}

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  update(
    pet: Pet,
    getAnimationDuration: (dir: string) => number,
    setAnimation: (dir: string) => void,
    movePet: (dx: number, dy: number) => void,
    sumMinusStat: (dx: any, dy: any) => void
  ) {
    // No realizar el movimiento si esto se cumple
    if (!pet.sprite || pet.cheats.noMoreMove) return;

    const now = performance.now();

    // Manejo de decisiones de la IA
    this.handleDecisionMaking(now, pet, getAnimationDuration, setAnimation);

    // Manejo de restricciones (agarrada o bloqueada)
    if (this.handleMovementRestrictions(pet)) return;

    // Si no se esta moviendo, no hacer nada
    if (!this.moving) return;

    // Ejecutar el movimiento actual
    this.executeMovement(pet, movePet, sumMinusStat);
  }

  //  Metodos para tomar deciciones

  /**
   * Decide si la mascota debe tomar una nueva accion
   */
  private handleDecisionMaking(
    now: number,
    pet: Pet,
    getAnimationDuration: (dir: string) => number,
    setAnimation: (dir: string) => void
  ): void {
    const shouldMakeDecision = 
      now - this.lastDecisionTime > this.decisionCooldown && 
      !pet.isGrab && 
      !pet.blockMove;

    // Solo tomar decisiones si NO esta agarrada ni bloqueada
    if (shouldMakeDecision) {
      this.lastDecisionTime = now;
      this.decideNextAction(pet, getAnimationDuration, setAnimation);
    }
  }

  /**
   * Decide la proxima accion de la mascota
   */
  private decideNextAction(
    pet: Pet,
    getAnimationDuration: (dir: string) => number,
    setAnimation: (dir: string) => void
  ): void {
    // 50% de probabilidad de no hacer nada
    if (Math.random() < 0.5) {
      // Decidio no moverse
      return;
    }

    this.tryToMove(pet, getAnimationDuration, setAnimation);
  }

  /**
   * Intenta encontrar una direccion valida para moverse
   */
  private tryToMove(
    pet: Pet,
    getAnimationDuration: (dir: string) => number,
    setAnimation: (dir: string) => void
  ): void {
    const directions: Direction[] = ['left', 'right', 'up', 'down'];
    const shuffledDirections = this.shuffleArray(directions);

    for (const dir of shuffledDirections) {
      if (this.tryMoveInDirection(dir, pet, getAnimationDuration, setAnimation)) {
        return; // Movimiento iniciado exitosamente
      }
    }
    //No se encontro ninguna direccion valida
  }

  /**
   * Intenta moverse en una direccion especifica
   */
  private tryMoveInDirection(
    dir: Direction,
    pet: Pet,
    getAnimationDuration: (dir: string) => number,
    setAnimation: (dir: string) => void
  ): boolean {
    const animDurationMs = getAnimationDuration(dir);
    const framesInAnimation = animDurationMs / 16.67;
    
    this.targetDistance = Math.floor(framesInAnimation * this.speed);
    this.movedDistance = 0;

    // ver a veces falla
    if (this.canMoveFullAnimation(pet, dir)) {
      this.startMovement(dir, setAnimation);
      return true;
    }

    return false;
  }

  /**
   * Inicia el movimiento en una direccion
   */
  private startMovement(
    dir: Direction,
    setAnimation: (dir: string) => void
  ): void {
    this.direction = dir;
    this.moving = true;
    setAnimation(dir);
  }

  //  Metodos para las restricciones

  /**
   * Maneja las restricciones de movimiento (agarrada, bloqueada)
   * @returns true si el movimiento debe detenerse
   */
  private handleMovementRestrictions(pet: Pet): boolean {
    // Si esta agarrada o bloqueada, detener el movimiento actual
    if (pet.isGrab || pet.blockMove) {
      if (this.moving) {
        this.stop();
      }
      return true;
    }
    return false;
  }

  //  Metodos de ejecucion de movimientos

  /**
   * Ejecuta el movimiento actual frame a frame
   */
  private executeMovement(
    pet: Pet,
    movePet: (dx: number, dy: number) => void,
    sumMinusStat: (dx: any, dy: any) => void
  ): void {
    const { dx, dy } = this.calculateMovementDelta();

    // Verificar colision antes de mover
    if (this.willCollide(pet, dx, dy)) {
      this.stop();
      return;
    }

    // se mueve le llama al metod de pet
    this.applyMovement(dx, dy, movePet);

    // Verificar si completo el movimiento
    if (this.hasCompletedMovement()) {
      this.completeMovement(sumMinusStat);
    }
  }

  /**
   * Calcula el delta de movimiento segun la direccion actual
   */
  private calculateMovementDelta(): { dx: number; dy: number } {
    let dx = 0, dy = 0;
    
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

    return { dx, dy };
  }

  /**
   * Verifica si habra colision en la siguiente posicion
   */
  private willCollide(pet: Pet, dx: number, dy: number): boolean {
    return this.collisionService.checkCollision(
      pet.sprite.x + dx,
      pet.sprite.y + dy,
      pet.sprite.width,
      pet.sprite.height,
      this.canvas
    );
  }

  /**
   * Aplica el movimiento a la mascota
   */
  private applyMovement(
    dx: number,
    dy: number,
    movePet: (dx: number, dy: number) => void
  ): void {
    movePet(dx, dy);
    this.movedDistance += Math.abs(dx) + Math.abs(dy);
  }

  /**
   * Verifica si se completo la distancia objetivo
   */
  private hasCompletedMovement(): boolean {
    return this.movedDistance >= this.targetDistance;
  }

  /**
   * Finaliza el movimiento y aplica el costo de energia
   */
  private completeMovement(sumMinusStat: (dx: any, dy: any) => void): void {
    this.stop();
    sumMinusStat('energy', -3);
  }

  //  METODOS DE VALIDACIoN 

  /**
   * Verifica si la mascota puede completar toda la animacion sin colisionar
   */
  private canMoveFullAnimation(pet: Pet, direction: Direction): boolean {
    const sprite = pet.sprite;
    if (!sprite) return false;

    const { dx, dy } = this.getDirectionDeltas(direction);
    const { finalX, finalY } = this.calculateFinalPosition(sprite, dx, dy);

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

  /**
   * Obtiene los deltas segun la direccion
   */
  private getDirectionDeltas(direction: Direction): { dx: number; dy: number } {
    let dx = 0, dy = 0;
    
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

    return { dx, dy };
  }

  /**
   * Calcula la posicion final despuEs del movimiento completo
   */
  private calculateFinalPosition(
    sprite: any,
    dx: number,
    dy: number
  ): { finalX: number; finalY: number } {
    // Calcular la posicion final despues de moverse la distancia completa
    const finalX = sprite.x + dx * this.targetDistance;
    const finalY = sprite.y + dy * this.targetDistance;

    return { finalX, finalY };
  }

  //  Metodos utiles

  /**
   * Detiene el movimiento actual
   */
  private stop(): void {
    this.moving = false;
    this.direction = 'idle';
  }

  /**
   * Mezcla aleatoriamente un array (Fisher-Yates shuffle)
   */
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
}