import { Injectable } from '@angular/core';
// Modelo
import { Pet } from '../../../models/pet/pet.model';
import { Stats } from '../../../models/pet/stats.model';
// Contexto
import { PetStatContext } from './pet-stat.context';


@Injectable({ providedIn: 'root' })
export class PetStatService {
  // Estado actual de la animacion idle basada en felicidad
  private actualIdle: string = '';

  // ==================== Metodos publicos ====================

  /**
   * Actualiza todas las stats de la mascota
   * Decrementa cada stat activa segun su decay rate y procesa comportamientos
   */
  updateStats(pet: Pet, delta: number, ctx: PetStatContext): void {
    const dt = delta / 1000;

    for (const stat of pet.stats) {
      if (stat.active) {
        stat.porcent = Math.max(0, stat.porcent - stat.decay * dt);
      }
    }

    ctx.setStats(pet.stats);
    this.statsProcess(pet, delta, ctx);
  }

  // ==================== Manejo de los stats ====================

  /**
   * Organiza y ejecuta comportamientos basados en las stats de la mascota
   * Procesa happiness y energy si existen
   */
  private statsProcess(pet: Pet, delta: number, ctx: PetStatContext): void {
    const happiness: Stats | null = ctx.getStat('happiness');

    if (happiness) {
      this.happinessProcess(happiness, ctx);
    }
  }

  /**
   * Gestiona animaciones idle basadas en el nivel de felicidad
   * Cambia la animacion idle segun umbrales: >65%, 15-65%, <15%
   */
  private happinessProcess(happiness: Stats, ctx: PetStatContext): void {
    if (happiness.porcent > 65) {
      if (this.actualIdle === 'happiness100') return;
      ctx.setIdleAnimation('happiness100');
      this.actualIdle = 'happiness100';
    } else if (happiness.porcent <= 65 && happiness.porcent >= 15) {
      if (this.actualIdle === 'happiness65') return;
      ctx.setIdleAnimation('happiness65');
      this.actualIdle = 'happiness65';
    } else {
      if (this.actualIdle === 'happiness15') return;
      ctx.setIdleAnimation('happiness15');
      this.actualIdle = 'happiness15';
    }
  }
}
