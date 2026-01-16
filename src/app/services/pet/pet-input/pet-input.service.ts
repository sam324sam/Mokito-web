import { Injectable } from '@angular/core';

import { Pet } from '../../../models/pet/pet.model';
import { PetState } from '../../../models/pet/pet-state.model';
import { PetInputContext } from './pet-input.context';
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

  /**
   * Maneja el evento de presionar el mouse sobre el pet
   * Inicia timer para detectar presion prolongada (agarre)
   */
  handlePressDown(pet: Pet, event: PointerEvent, ctx: PetInputContext): void {
    event.preventDefault();
    if (!this.isPetClicked(pet, event)) return;

    this.clearPressTimer();

    // Iniciar timer para agarre
    this.pressTimer = setTimeout(() => {
      this.startGrabbing(pet, event, ctx);
    }, this.LONG_PRESS_DURATION);
  }

  /**
   * Maneja el evento de soltar el mouse
   * Cancela agarre o ejecuta animacion de respuesta si fue click corto
   */
  handlePressUp(pet: Pet, event: PointerEvent, ctx: PetInputContext): void {
    event.preventDefault();

    this.clearPressTimer();

    // Si fue un click corto sobre la mascota, ejecutar respuesta
    if (this.isPetClicked(pet, event)) {
      this.triggerPetResponse(pet, ctx);
    }
  }

  /**
   * Maneja el movimiento del mouse mientras se agarra el pet
   * Actualiza posicion del sprite siguiendo el cursor
   */
  handleMouseMove(pet: Pet, event: PointerEvent): void {
    if (pet.state !== PetState.Grabbed) return;

    const mouse = this.getMousePos(event);

    // Calcular nueva posicion manteniendo offset donde se clickeo
    let newX = mouse.x - this.grabOffsetX;
    let newY = mouse.y - this.grabOffsetY;

    // Limitar al canvas para que no se salga
    pet.sprite.x = Math.max(0, newX);
    pet.sprite.y = Math.max(0, newY);
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

  

  // ==================== Logica del input ====================

  /**
   * Inicia el modo de agarre del pet
   * Calcula offset entre mouse y sprite para mantener posicion relativa
   */
  private startGrabbing(pet: Pet, event: PointerEvent, ctx: PetInputContext): void {
    if (pet.state == PetState.Reacting) return;

    const mouse = this.getMousePos(event);

    ctx.setState(PetState.Grabbed);

    // Calcular offset para mantener posicion relativa al agarrar
    this.grabOffsetX = mouse.x - pet.sprite.x;
    this.grabOffsetY = mouse.y - pet.sprite.y;

    console.log('grabOffsetX', this.grabOffsetX, 'grabOffsetY', this.grabOffsetY);
  }

  /**
   * Ejecuta la animacion de respuesta al click (tutsitutsi)
   * Bloquea movimiento durante animacion y aumenta felicidad
   */
  private triggerPetResponse(pet: Pet, ctx: PetInputContext): void {
    if (pet.state == PetState.Reacting) return;

    ctx.setState(PetState.Reacting);

    // Volver a Idle cuando termine la animacion
    const duration = this.animationService.getAnimationDuration(pet.sprite);
    setTimeout(() => {
      if (pet.state == PetState.Reacting) {
        ctx.setState(PetState.Idle);
      }
    }, duration);
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
