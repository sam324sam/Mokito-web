import { Injectable } from '@angular/core';

import { Pet } from '../../../models/pet/pet.model';
import { PetState } from '../../../models/pet/pet-state.model';
import { PetStateContext } from './pet-state.context';
import { PetIaService } from '../pet-ia/pet-ia.service';

@Injectable({ providedIn: 'root' })
export class PetStateService {
  // Mapa de funciones de actualizacion por estado
  private readonly stateUpdate: Record<
    PetState,
    (pet: Pet, delta: number, ctx: PetStateContext) => void
  > = {
    [PetState.Idle]: (p, d, c) => this.updateIdle(p, d, c),
    [PetState.Walking]: () => {},
    [PetState.Grabbed]: () => {},
    [PetState.Sleeping]: (p, d, c) => this.updateSleeping(p, d, c),
    [PetState.Reacting]: () => {},
  };

  constructor(private readonly ia: PetIaService) {}

  // ==================== Metodos publicos ====================

  /**
   * Actualiza el estado actual de la mascota
   * Delega la logica especifica al handler correspondiente
   */
  update(pet: Pet, delta: number, ctx: PetStateContext): void {
    this.stateUpdate[pet.state]?.(pet, delta, ctx);
  }

  /**
   * Cambia el estado de la mascota
   * Detiene la IA si la mascota es agarrada
   */
  setState(pet: Pet, state: PetState): void {
    if (pet.state === state) return;
    
    pet.state = state;

    if (state === PetState.Grabbed) {
      this.ia.forceStop();
    }
  }

  // ==================== Metodos para los estados ====================

  /**
   * Actualiza el estado Idle
   * Ejecuta la logica de IA para movimiento autonomo
   */
  private updateIdle(pet: Pet, delta: number, ctx: PetStateContext): void {
    ctx.runIaIdle(pet, delta);
  }

  /**
   * Actualiza el estado Sleeping
   * Verifica si la energia alcanzo el 80% para despertar
   */
  private updateSleeping(pet: Pet, delta: number, ctx: PetStateContext): void {
    const stat = ctx.getStat('energy');
    
    if (stat !== null) {
      const energy = stat.porcent;
      
      if (energy !== null && energy >= 80) {
        ctx.setState(PetState.Idle);
      }
    }
  }
}