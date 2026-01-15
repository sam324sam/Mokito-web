import { Injectable } from '@angular/core';

import { Pet } from '../../../models/pet/pet.model';
import { PetState } from '../../../models/pet/pet-state.model';
import { PetIaContext } from './pet-ia.context';
import { CollisionService } from '../../collision.service';
import { PetCondition } from '../../../models/pet/pet-condition.model';

type Direction = 'left' | 'right' | 'up' | 'down';

@Injectable({ providedIn: 'root' })
export class PetIaService {
  private canvas!: HTMLCanvasElement;

  // Estado del movimiento
  private direction: Direction | 'idle' = 'idle';
  private lastDirection: Direction | null = null;

  // Configuracion de movimiento
  private readonly speed = 1; // pixeles por frame
  private targetDistance = 0;
  private movedDistance = 0;

  // Control de decisiones de IA
  private lastDecisionTime = 0;
  private readonly decisionCooldown = 2500; // ms entre decisiones

  constructor(private readonly collisionService: CollisionService) {}

  // ==================== Metodos publicos ====================

  /**
   * Inicializa el servicio con referencia al canvas
   * Debe llamarse antes de usar cualquier funcionalidad de movimiento
   */
  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  /**
   * Ejecuta la logica de IA cuando la mascota esta en estado Idle
   * Procesa decisiones de movimiento y ejecuta desplazamientos
   */
  runIaIdle(pet: Pet, ctx: PetIaContext): void {
    this.moveProcess(pet, ctx);
  }

  /**
   *
   */
  runIaWalk(pet: Pet, ctx: PetIaContext) {
    // Ejecutar movimiento activo si existe
    this.executeMovement(pet, ctx);
  }

  /**
   * Fuerza la detencion completa del movimiento
   * Resetea todos los estados de movimiento
   */
  forceStop(): void {
    this.direction = 'idle';
    this.movedDistance = 0;
    this.targetDistance = 0;
  }

  // ==================== Logica del movimiento ====================

  /**
   * Procesa toda la logica de movimiento de la IA
   * Gestiona decisiones periodicas y ejecucion de movimientos activos
   */
  private moveProcess(pet: Pet, ctx: PetIaContext): void {
    const now = performance.now();

    // Tomar nueva decision de movimiento si paso el cooldown
    if (now - this.lastDecisionTime > this.decisionCooldown) {
      this.lastDecisionTime = now;
      this.startMovementFromAnimationDuration(pet, ctx);
    }
  }

  /**
   * Ejecuta el movimiento frame a frame en la direccion actual
   * Verifica colisiones y consume energia al completar el movimiento
   */
  private executeMovement(pet: Pet, ctx: PetIaContext): void {
    if (pet.state !== PetState.Walking) return;
    let dx = 0;
    let dy = 0;

    // Calcular desplazamiento segun direccion
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
      this.stop(ctx);
      return;
    }

    // Ejecutar movimiento
    ctx.move(dx, dy);
    this.movedDistance += Math.abs(dx) + Math.abs(dy);

    // Verificar si completo la distancia objetivo
    if (this.movedDistance >= this.targetDistance) {
      this.stop(ctx);
      ctx.sumMinusStat('energy', -3);
    }
  }

  /**
   * Detiene el movimiento actual y resetea la direccion a idle
   */
  private stop(ctx: PetIaContext): void {
    this.direction = 'idle';
    ctx.setState(PetState.Idle);
  }

  /**
   * Inicia un nuevo movimiento basado en la duracion de la animacion
   * Selecciona direccion aleatoria validando colisiones en el recorrido
   */
  private startMovementFromAnimationDuration(pet: Pet, ctx: PetIaContext): void {
    // Decidir si moverse basado en stats
    if (Math.random() > this.decisionMove(pet, ctx)) {
      return;
    }

    const directions: Direction[] = ['left', 'right', 'up', 'down'];

    // Filtrar la ultima direccion para evitar repeticion
    const filteredDirections = this.lastDirection
      ? directions.filter((d) => d !== this.lastDirection)
      : directions;

    const shuffledDirections = this.shuffleArray(filteredDirections);

    // Buscar primera direccion valida sin colisiones
    for (const dir of shuffledDirections) {
      const animDurationMs = ctx.getAnimationDuration(dir);
      const framesInAnimation = animDurationMs / 16.67;

      this.targetDistance = Math.floor(framesInAnimation * this.speed);
      this.movedDistance = 0;

      // Validar que se puede completar el movimiento sin colisiones
      if (this.canMoveFullAnimation(pet, dir)) {
        // Ponerle el estado de moverse
        ctx.setState(PetState.Walking);

        const sprite = pet.sprite;
        if (!sprite || !this.canvas) return;

        this.direction = dir;
        this.lastDirection = dir;
        return;
      }
    }
    // No se encontro ninguna direccion valida
  }

  // ==================== Validaciones y utilidades ====================

  /**
   * Verifica si se puede realizar el recorrido completo sin colisiones
   * Simula el movimiento pixel a pixel antes de ejecutarlo
   */
  private canMoveFullAnimation(pet: Pet, direction: Direction): boolean {
    const sprite = pet.sprite;
    if (!sprite) return false;

    let dx = 0;
    let dy = 0;

    // Calcular incremento segun direccion
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

    let testX = sprite.x;
    let testY = sprite.y;

    // Simular recorrido pixel a pixel
    for (let i = 0; i < this.targetDistance; i++) {
      testX += dx;
      testY += dy;

      if (
        this.collisionService.checkCollision(testX, testY, sprite.width, sprite.height, this.canvas)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calcula la probabilidad de moverse segun energia y felicidad
   * Retorna valor entre 0 y 1 (mayor = mas probable que se mueva)
   */
  private decisionMove(pet: Pet, ctx: PetIaContext): number {
    let probability = 0.6; // valor base neutro

    // Energia

    if (pet.conditions.has(PetCondition.Energetic)) {
      probability += 0.2;
    }

    if (pet.conditions.has(PetCondition.Tired)) {
      probability -= 0.25;
    }

    if (pet.conditions.has(PetCondition.Exhausted)) {
      probability -= 0.4;
    }

    // Estado emocional

    if (pet.conditions.has(PetCondition.Happy)) {
      probability += 0.15;
    }

    if (pet.conditions.has(PetCondition.Sad)) {
      probability -= 0.15;
    }

    if (pet.conditions.has(PetCondition.Depressed)) {
      probability -= 0.3;
    }

    return Math.min(Math.max(probability, 0), 1);
  }

  /**
   * Mezcla aleatoriamente un array usando Fisher-Yates shuffle
   * Retorna una copia mezclada sin modificar el original
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  /**
   * Da la direccion actual de la pet
   */
  getDirection() {
    return this.direction;
  }

  /**
   * Pone la direccion pordefecto
   */
  clearDirection() {
    this.direction = 'idle';
    this.forceStop();
  }
}
