import { Injectable } from '@angular/core';

import { Pet, PetState } from '../../../models/pet/pet.model';
import { PetStateContext } from './pet-state.context';
import { ParticleService } from '../../particle.service';

type PetStateHandler = {
  onEnter?: (pet: Pet, ctx: PetStateContext) => void;
  update?: (pet: Pet, delta: number, ctx: PetStateContext) => void;
  onExit?: (pet: Pet, ctx: PetStateContext) => void;
};
@Injectable({ providedIn: 'root' })
export class PetStateService {
  // Mapa de funciones de actualizacion por estado
  private readonly stateHandlers: Record<PetState, PetStateHandler> = {
    [PetState.Idle]: {
      onEnter: (p, c) => this.enterIdle(p, c),
      update: (p, d, c) => this.updateIdle(p, d, c),
    },

    [PetState.Walking]: {
      onEnter: (p, c) => this.enterWalk(p, c),
      update: (p, d, c) => this.updateWalk(p, d, c),
      onExit: (p, c) => this.exitWalk(p, c),
    },

    [PetState.Sleeping]: {
      onEnter: (p, c) => this.enterSleeping(p, c),
      update: (p, d, c) => this.updateSleeping(p, d, c),
      onExit: (p, c) => this.exitSleeping(p, c),
    },

    [PetState.Grabbed]: {
      onEnter: (p, c) => this.enterGrabbed(p, c),
    },
    [PetState.Reacting]: {
      onEnter: (p, c) => this.enterReacting(p, c),
      onExit: (p, c) => this.exitReacting(p, c),
    },
    [PetState.Eating]: {
      onEnter: (p, c) => this.enterEating(p, c),
      onExit: (p, c) => this.exitEating(p, c),
    },
    [PetState.Bathing]: {
      onEnter: (p, c) => this.enterBathing(p, c),
      
      onExit: (p, c) => this.exitBathing(p, c),
    },
  };
  lastState: PetState = {} as PetState;
  // Temporisadores
  // Para el reacting
  private reactingTimeout: any = null;
  private eatTimeout: any = null;

  constructor(private readonly particleService: ParticleService) {}

  // ==================== Metodos publicos ====================

  /**
   * Actualiza el estado actual de la mascota
   * Delega la logica especifica al handler correspondiente
   */
  update(pet: Pet, delta: number, ctx: PetStateContext): void {
    if (pet.state !== this.lastState) {
      if (this.lastState !== null) {
        this.stateHandlers[this.lastState]?.onExit?.(pet, ctx);
      }
      this.stateHandlers[pet.state]?.onEnter?.(pet, ctx);
      this.lastState = pet.state;
    }

    this.stateHandlers[pet.state]?.update?.(pet, delta, ctx);
  }

  // ==================== Utilidades ====================

  private clearTimer(timer: any): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  // ==================== Metodos para los estados ====================

  /**
   * Actualiza el estado Idle
   * Ejecuta la logica de IA para movimiento autonomo
   */
  private enterIdle(pet: Pet, ctx: PetStateContext): void {
    ctx.setAnimation('idle');
  }

  private updateIdle(pet: Pet, delta: number, ctx: PetStateContext): void {
    ctx.runIaIdle(pet, delta);
  }

  // Agarrar
  private enterGrabbed(pet: Pet, ctx: PetStateContext) {
    ctx.setAnimation('grab');
  }

  /// ====================== Reacting
  enterReacting(pet: Pet, ctx: PetStateContext): void {
    if (this.lastState == PetState.Sleeping) return;
    ctx.setAnimation('tutsitutsi');
    ctx.sumMinusStat('happiness', 5);

    // Emitir particulas de felicidad
    const sprite = pet.sprite;
    const scale = pet.sprite.scale;

    const centerX = sprite.x + (sprite.width * scale) / 2;
    const centerY = sprite.y + (sprite.height * scale) / 2;

    this.particleService.emitExplosion(centerX, centerY, 10, 2, null);

    const durationMs = ctx.getAnimationDuration(sprite, 'tutsitutsi');

    this.clearTimer(this.reactingTimeout);

    this.reactingTimeout = setTimeout(() => {
      ctx.setState(PetState.Idle);
    }, durationMs);
  }

  private exitReacting(pet: Pet, ctx: PetStateContext): void {
    this.clearTimer(this.reactingTimeout);
  }

  // ======================== Caminar
  private updateWalk(pet: Pet, delta: number, ctx: PetStateContext): void {
    ctx.runIaWalk(pet, delta);
  }

  private enterWalk(pet: Pet, ctx: PetStateContext): void {
    ctx.setAnimation(ctx.getDirection());
  }

  private exitWalk(pet: Pet, ctx: PetStateContext): void {
    ctx.clearDirection();
  }

  // ========================= Comer
  private enterEating(pet: Pet, ctx: PetStateContext) {
    // limpiar timeout anterior

    ctx.setAnimation('eat');
    const durationMs = ctx.getAnimationDuration(pet.sprite, 'eat');
    this.clearTimer(this.eatTimeout);
    this.eatTimeout = setTimeout(() => {
      ctx.setState(PetState.Idle);
    }, durationMs);
  }

  private exitEating(pet: Pet, ctx: PetStateContext) {
    this.clearTimer(this.eatTimeout);
  }

  //============================ Dormir
  private enterSleeping(pet: Pet, ctx: PetStateContext): void {
    ctx.setAnimation('sleep');
    ctx.setStatActive('energy', true);
  }
  /**
   * Actualiza el estado Sleeping
   * Verifica si la energia alcanzo el 80% para despertar
   */
  private updateSleeping(pet: Pet, delta: number, ctx: PetStateContext): void {
    const stat = ctx.getStat('energy');
    ctx.sumMinusStat('energy', 0.005);

    if (stat !== null) {
      const energy = stat.porcent;
      if (energy >= 100) {
        ctx.setState(PetState.Idle);
      }
    }
  }

  private exitSleeping(pet: Pet, ctx: PetStateContext): void {
    ctx.setAnimation('idle');
    ctx.setStatActive('energy', false);
  }
  //============================ Bañandolo
  private enterBathing(pet: Pet, ctx: PetStateContext): void {
    ctx.setAnimation('idle');
  }
  /**
   * 
   */

  private exitBathing(pet: Pet, ctx: PetStateContext): void {
    ctx.setAnimation('idle');
  }
}
