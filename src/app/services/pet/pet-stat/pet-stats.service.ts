import { Injectable } from '@angular/core';
// Modelo
import { Pet } from '../../../models/pet/pet.model';
// Contexto
import { PetStatContext } from './pet-stat.context';

@Injectable({ providedIn: 'root' })
export class PetStatService {
  // ==================== Metodos publicos ====================

  /**
   * Actualiza todas las stats de la mascota
   * Decrementa cada stat activa segun su decay rate y procesa comportamientos
   */
  updateStats(pet: Pet, delta: number, ctx: PetStatContext): void {
    if (!pet.cheats.godMode) {
      const dt = delta / 1000;
      for (const stat of pet.stats) {
        if (stat.active) {
          stat.porcent = Math.max(0, stat.porcent - stat.decay * dt);
        }
      }

      ctx.setStats(pet.stats);
    }
  }
}
