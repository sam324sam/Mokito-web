import { Injectable } from '@angular/core';

import { Pet, PetState } from '../../../models/pet/pet.model';
import { PetInputContext } from './pet-input.context';
// service
import { AnimationService } from '../../animation.service';

@Injectable({ providedIn: 'root' })
export class PetInputService {
  private canvas!: HTMLCanvasElement;

  // Control de presion prolongada para agarre
  private pressTimer: any = null;
  private readonly LONG_PRESS_DURATION = 250; // ms para activar agarre

  // Offset del mouse respecto al sprite al agarrarlo
  private grabOffsetX = 0;
  private grabOffsetY = 0;

  constructor(private readonly animationService: AnimationService) {}

  // ==================== Metodos publicos ====================

  /**
   * Inicializa el servicio con referencia al canvas
   * Necesario para calcular coordenadas correctamente
   */
  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  // ==================== Metodos publicos para botones de la room ====================

  /**
   *
   */
  sleep(pet: Pet, ctx: PetInputContext) {
    if (pet.state == PetState.Sleeping) {
      ctx.setState(PetState.Idle);
    } else {
      ctx.setState(PetState.Sleeping);
    }
  }

  /**
   *
   */
  feed(pet: Pet, ctx: PetInputContext) {
    console.log("comidita")
  }

  // ==================== Utilidades ====================

  /**
   * Verifica si el click esta dentro del area del sprite escalado
   * Usa coordenadas del canvas logico para comparacion
   */
  private isPetClicked(pet: Pet, event: PointerEvent): boolean {
    const mouse = this.getMousePos(event);
    const sprite = pet.sprite;

    // Calcular dimensiones escaladas del sprite
    const scaledWidth = sprite.width * pet.sprite.scale;
    const scaledHeight = sprite.height * pet.sprite.scale;

    const isInside =
      mouse.x >= sprite.x &&
      mouse.x <= sprite.x + scaledWidth &&
      mouse.y >= sprite.y &&
      mouse.y <= sprite.y + scaledHeight;

    return isInside;
  }

  /**
   * Convierte coordenadas del mouse (CSS) a coordenadas del canvas logico
   * Compensa diferencia entre tamano visual (CSS) y buffer interno
   */
  private getMousePos(evt: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();

    // Escala para convertir de CSS a canvas logico
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY,
    };
  }

  /**
   * Limpia el timer de presion prolongada
   * Previene que se active agarre despues de soltar
   */
  private clearPressTimer(): void {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }
}
