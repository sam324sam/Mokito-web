import { Injectable } from '@angular/core';
import { CollisionService } from './collision.service';
import { Pet } from '../models/pet/pet.model';

@Injectable({ providedIn: 'root' })
export class PetIaService {
  private canvas!: HTMLCanvasElement;

  private moving = false;
  private direction: 'left' | 'right' | 'up' | 'down' | 'idle' = 'idle';
  private readonly speed = 1; // pixeles por frame (60fps aprox)

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
    movePet: (dx: number, dy: number) => void
  ) {
    if (!pet.sprite) return;

    const now = performance.now();

    // Solo tomar decisiones si NO esta agarrada ni bloqueada
    if (now - this.lastDecisionTime > this.decisionCooldown && !pet.isGrab && !pet.blockMove) {
      this.lastDecisionTime = now;
      this.startMovementFromAnimationDuration(pet, getAnimationDuration, setAnimation);
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

    console.log('se mueve', this.direction, dx, dy);
    movePet(dx, dy);
    this.movedDistance += Math.abs(dx) + Math.abs(dy);

    if (this.movedDistance >= this.targetDistance) {
      this.stop();
    }
  }

  private stop() {
    this.moving = false;
    this.direction = 'idle';
    console.log('Movimiento detenido');
  }

  private canMoveFullAnimation(pet: Pet, direction: 'left' | 'right' | 'up' | 'down'): boolean {
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

    console.log(
      `Verificando ${direction}: actual (${Math.round(sprite.x)}, ${Math.round(
        sprite.y
      )}) -> final (${Math.round(finalX)}, ${Math.round(finalY)}), puede: ${canMove}`
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
    setAnimation: (dir: string) => void
  ) {
    if (Math.random() < 0.5) {
      console.log('Decidio no moverse esta vez');
      return;
    }

    const directions: ('left' | 'right' | 'up' | 'down')[] = ['left', 'right', 'up', 'down'];
    const shuffledDirections = this.shuffleArray(directions);

    for (const dir of shuffledDirections) {
      const animDurationMs = getAnimationDuration(dir);

      const framesInAnimation = animDurationMs / 16.67;
      this.targetDistance = Math.floor(framesInAnimation * this.speed);
      this.movedDistance = 0;

      console.log(
        `Intentando ${dir}: ${animDurationMs}ms = ${Math.round(framesInAnimation)} frames = ${
          this.targetDistance
        }px`
      );

      if (this.canMoveFullAnimation(pet, dir)) {
        this.direction = dir;
        this.moving = true;
        setAnimation(dir);
        console.log('¡Movimiento iniciado!');
        return;
      }
    }

    console.log('No se encontro ninguna direccion valida');
  }
}
