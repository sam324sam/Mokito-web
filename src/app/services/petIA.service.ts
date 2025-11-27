import { Injectable } from '@angular/core';
import { PetService } from './pet.service';
import { CollisionService } from './collision.service';

@Injectable({ providedIn: 'root' })
export class PetIaService {

  private canvas!: HTMLCanvasElement;

  private moving = false;
  private direction: 'left' | 'right' | 'up' | 'down' | 'idle' = 'idle';
  private speed = 1;

  private targetDistance = 0;
  private movedDistance = 0;

  private lastDecisionTime = 0;
  private decisionCooldown = 1000 * 2.5;

  constructor(
    private readonly petService: PetService,
    private readonly collisionService: CollisionService
  ) {}

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.loop();
  }

  private loop() {
    requestAnimationFrame(() => this.loop());

    const sprite = this.petService.sprite;
    if (!sprite) return;

    const now = performance.now();

    if (now - this.lastDecisionTime > this.decisionCooldown) {
      this.lastDecisionTime = now;
      this.startMovementFromAnimationDuration();
    }

    if (!this.moving || this.petService.pet.isGrab || this.petService.pet.blockMove) return;

    let dx = 0, dy = 0;

    switch (this.direction) {
      case 'left': dx = -this.speed; break;
      case 'right': dx = this.speed; break;
      case 'up': dy = -this.speed; break;
      case 'down': dy = this.speed; break;
    }

    if (this.collisionService.checkCollision(
      sprite.x + dx,
      sprite.y + dy,
      sprite.width,
      sprite.height,
      this.canvas
    )) {
      this.stop();
      return;
    }

    sprite.x += dx;
    sprite.y += dy;

    this.movedDistance += Math.abs(dx) + Math.abs(dy);

    if (this.movedDistance >= this.targetDistance) {
      this.stop();
    }
  }

  private stop() {
    this.moving = false;
    this.direction = 'idle';
    this.petService.setAnimation('idle');
  }

  // Comprueba si puede recorrer toda la animacion sin chocar
  private canMoveFullAnimation(direction: 'left' | 'right' | 'up' | 'down'): boolean {
    const sprite = this.petService.sprite;
    if (!sprite) return false;

    let dx = 0, dy = 0;

    switch (direction) {
      case 'left': dx = -this.speed; break;
      case 'right': dx = this.speed; break;
      case 'up': dy = -this.speed; break;
      case 'down': dy = this.speed; break;
    }

    let testX = sprite.x;
    let testY = sprite.y;

    for (let i = 0; i < this.targetDistance; i++) {
      testX += dx;
      testY += dy;

      if (this.collisionService.checkCollision(
        testX,
        testY,
        sprite.width,
        sprite.height,
        this.canvas
      )) {
        return false;
      }
    }

    return true;
  }

  // Nuevo movimiento basado en la duracion real de la animacion
  private startMovementFromAnimationDuration() {
    if (Math.random() < 0.5) return;

    const directions: ('left' | 'right' | 'up' | 'down')[] =
      ['left', 'right', 'up', 'down'];

    const dir = directions[Math.floor(Math.random() * directions.length)];

    // DISTANCIA BASADA EN LA DURACIoN DE LA ANIMACIoN (TU REQUISITO)
    this.targetDistance = this.petService.getAnimationDuration(dir) * this.speed;
    this.movedDistance = 0;

    // Validar si se puede mover toda la animacion sin chocar
    if (!this.canMoveFullAnimation(dir)) {
      return; // No hace nada si no cabe el movimiento completo
    }

    this.direction = dir;
    this.moving = true;

    this.petService.setAnimation(dir);
  }
}
