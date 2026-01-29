import { Injectable } from '@angular/core';

import { Pet, PetState } from '../../../models/pet/pet.model';
import { PetInputContext } from './pet-input.context';
// service
import { AnimationService } from '../../animation.service';

@Injectable({ providedIn: 'root' })
export class PetInputService {
  private canvas!: HTMLCanvasElement;

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
    console.log("comidita");
  }
}
