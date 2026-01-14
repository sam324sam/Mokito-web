import { Injectable } from '@angular/core';
// Modelos
import { PetCondition } from '../../../models/pet/pet-condition.model';
import { Pet } from '../../../models/pet/pet.model';
import { ParticleService } from '../../particle.service';

//Context
import { PetConditionContext } from './pet-condition.context';

export type PetConditionBehavior = (pet: Pet, deltaTime: number, ctx: PetConditionContext) => void;

@Injectable({ providedIn: 'root' })
export class PetConditionService {
  constructor(private readonly particleService: ParticleService) {}

  update(pet: Pet, delta: number, ctx: PetConditionContext): void {
    for (const condition of pet.conditions) {
      const behavior = this.behaviors.get(condition);
      behavior?.(pet, delta, ctx);
    }
    this.energyProcess(pet, ctx);
  }

  // ==================== Metodos que se ejecutan segun las condiciones de la pet ====================

  private exhausted(pet: Pet, delta: number, ctx: PetConditionContext): void {
    console.log("")
  }

  private energetic(pet: Pet, delta: number, ctx: PetConditionContext): void {
    console.log("")
  }

  private hungry(pet: Pet, delta: number, ctx: PetConditionContext): void {
    console.log("")
  }

  private depressed(pet: Pet, delta: number, ctx: PetConditionContext): void {
    console.log("")
  }

  private happy(pet: Pet, delta: number, ctx: PetConditionContext): void {
    // animación idle feliz, sin bloquear estado
  }
  // Cooldown para emision de particulas de energia
  private energyCooldown: number = 0;
  private readonly tired: PetConditionBehavior = (pet, delta, ctx) => {
    this.energyCooldown -= delta;

    if (this.energyCooldown > 0) return;

    const energy = ctx.getStat('energy');
    if (!energy) return;

    const energyFactor = Math.min(energy.porcent / 100, 0.5);
    const probability = 0.5 + energyFactor;

    if (Math.random() > probability) {
      const width = pet.sprite.width * pet.sprite.scale;
      const height = pet.sprite.height * pet.sprite.scale;

      const x = pet.sprite.x + Math.random() * width;
      const y = pet.sprite.y + Math.random() * height;

      this.particleService.emitDroplets(x, y, 1, 120, null);
      this.energyCooldown = 1000;
    }
  };

  private readonly behaviors: Map<PetCondition, PetConditionBehavior> = new Map([
    [PetCondition.Exhausted, this.exhausted],
    [PetCondition.Tired, this.tired],
    [PetCondition.Hungry, this.hungry],
    [PetCondition.Depressed, this.depressed],
    [PetCondition.Energetic, this.energetic],
    [PetCondition.Happy, this.happy],
  ]);

  // ==================== Lo que genera la condicion de la pet ====================¡

  /**
   * Gestiona efectos visuales de particulas basados en energia
   * Emite gotas aleatorias con probabilidad inversamente proporcional a la energia
   * Menos energia = mas probabilidad de emitir particulas (cansancio visual)
   */
  private energyProcess(pet: Pet, ctx: PetConditionContext): void {
    const energy = ctx.getStat('energy');
    if (!energy) return;
    if (energy.porcent <= 40) {
      pet.conditions.add(PetCondition.Tired);
    } else if (pet.conditions.has(PetCondition.Tired)) {
      pet.conditions.delete(PetCondition.Tired);
    }
  }
}
