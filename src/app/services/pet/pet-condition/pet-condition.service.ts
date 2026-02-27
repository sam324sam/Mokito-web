import { Injectable } from '@angular/core';
// Modelos
import { Pet, PetState, PetCondition } from '../../../models/pet/pet.model';
import { ParticleService } from '../../particle/particle.service';

//Context
import { PetConditionContext } from './pet-condition.context';
import { MessageService } from '../../mesage/message.service';

export type PetConditionBehavior = (pet: Pet, deltaTime: number, ctx: PetConditionContext) => void;

@Injectable({ providedIn: 'root' })
export class PetConditionService {
  constructor(
    private readonly particleService: ParticleService,
    private readonly messageService: MessageService,
  ) {}

  update(pet: Pet, delta: number, ctx: PetConditionContext): void {
    for (const condition of pet.conditions) {
      const behavior = this.behaviors.get(condition);
      behavior?.(pet, delta, ctx);
    }
    if (!pet.cheats.noConditionProcces) {
      this.conditionProcess(pet, ctx);
    }
  }

  conditionProcess(pet: Pet, ctx: PetConditionContext) {
    this.energyProcess(pet, ctx);
    this.happyProcess(pet, ctx);
    this.hungerProcess(pet, ctx);
    this.hygieneProcess(pet, ctx);
  }

  // ==================== Metodos que se ejecutan segun las condiciones de la pet ====================

  private readonly exhausted: PetConditionBehavior = (pet, delta, ctx) => {};

  private readonly energetic: PetConditionBehavior = (pet, delta, ctx) => {};

  private hungerCooldown: number = 0;
  private readonly hungry: PetConditionBehavior = (pet, delta, ctx) => {
    this.hungerCooldown -= delta;

    if (this.hungerCooldown > 0) return;
    if (pet.state == PetState.Idle) {
      const hunger = ctx.getStat('hunger');
      if (!hunger) return;
      const hungerFactor = Math.min(hunger.porcent / 100, 1);
      const probability = 0.02 + (1 - hungerFactor) * 0.3;

      if (Math.random() < probability) {
        if (this.messageService.addMessage('lauy', '', pet.sprite, pet.sprite.x, pet.sprite.y)) {
          ctx.setState(PetState.Talking);
        }
      }
    }
    this.hungerCooldown = 1000;
  };

  private happy(pet: Pet, delta: number, ctx: PetConditionContext): void {
    if (pet.state == PetState.Idle) {
      ctx.setAnimation('happiness100');
    }
  }

  private sadCooldown: number = 0;
  private readonly sad: PetConditionBehavior = (pet, delta, ctx) => {
    if (pet.state == PetState.Idle) {
      this.sadCooldown -= delta;
      ctx.setAnimation('happiness65');
      if (this.sadCooldown > 0) return;
      if (pet.state == PetState.Idle) {
        const happiness = ctx.getStat('happiness');
        if (!happiness) return;
        const happinessFactor = Math.min(happiness.porcent / 100, 1);
        const probability = 0.02 + (1 - happinessFactor) * 0.3;

        if (Math.random() < probability) {
          if (this.messageService.addMessage('lE?', '', pet.sprite, pet.sprite.x, pet.sprite.y)) {
            ctx.setState(PetState.Talking);
          }
        }
      }
      this.sadCooldown = 1500;
    }
  };

  private depressed(pet: Pet, delta: number, ctx: PetConditionContext): void {
    if (pet.state == PetState.Idle) {
      ctx.setAnimation('happiness15');
    }
  }

  // Cooldown para emision de particulas de energia
  private energyCooldown: number = 0;
  /**
   * Gestiona efectos visuales de particulas basados en energia
   * Emite gotas aleatorias con probabilidad inversamente proporcional a la energia
   * Menos energia = mas probabilidad de emitir particulas (cansancio visual)
   */
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
      if (pet.state !== PetState.Sleeping) {
        this.particleService.emitSweatDrops(x, y, 1, 2, 'sweat-drops');
        if (Math.random() < 0.08) {
          if (this.messageService.addMessage('olty', '', pet.sprite, pet.sprite.x, pet.sprite.y)) {
            ctx.setState(PetState.Talking);
          }
        }
      }
      this.energyCooldown = 1000;
    }
  };

  private dirtyCooldown: number = 0;
  private readonly dirty: PetConditionBehavior = (pet, delta, ctx) => {
    this.dirtyCooldown -= delta;

    if (this.dirtyCooldown > 0) return;

    const hygiene = ctx.getStat('hygiene');
    if (!hygiene) return;
    const energyFactor = Math.min(hygiene.porcent / 100, 0.5);
    const probability = 0.5 + energyFactor;

    if (Math.random() > probability) {
      const width = pet.sprite.width * pet.sprite.scale;
      const height = pet.sprite.height * pet.sprite.scale;

      const x = pet.sprite.x + Math.random() * width;
      const y = pet.sprite.y + Math.random() * height;
      const number = Math.floor(Math.random() * 3) + 1;
      const textureName = 'dirty' + number;
      this.particleService.emitDirty(x, y, 1, 2, textureName);
      if (Math.random() < 0.08) {
        if (this.messageService.addMessage('olt?', '', pet.sprite, pet.sprite.x, pet.sprite.y)) {
          ctx.setState(PetState.Talking);
        }
      }
      this.dirtyCooldown = 1000;
    }
  };

  private readonly behaviors: Map<PetCondition, PetConditionBehavior> = new Map([
    [PetCondition.Exhausted, this.exhausted],
    [PetCondition.Tired, this.tired],
    [PetCondition.Hungry, this.hungry],
    [PetCondition.Energetic, this.energetic],
    [PetCondition.Happy, this.happy],
    [PetCondition.Sad, this.sad],
    [PetCondition.Depressed, this.depressed],
    [PetCondition.Dirty, this.dirty],
  ]);

  // ==================== Lo que genera la condicion de la pet ====================¡

  /**
   * Calcula cuando poner y quitar la condicion de cansado
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

  private happyProcess(pet: Pet, ctx: PetConditionContext) {
    const happiness = ctx.getStat('happiness');
    if (!happiness) return;
    if (happiness.porcent > 65) {
      pet.conditions.add(PetCondition.Happy);
      pet.conditions.delete(PetCondition.Sad);
      pet.conditions.delete(PetCondition.Depressed);
    } else if (happiness.porcent <= 65 && happiness.porcent >= 15) {
      pet.conditions.add(PetCondition.Sad);
      pet.conditions.delete(PetCondition.Happy);
      pet.conditions.delete(PetCondition.Depressed);
    } else {
      pet.conditions.add(PetCondition.Depressed);
      pet.conditions.delete(PetCondition.Sad);
      pet.conditions.delete(PetCondition.Happy);
    }
  }

  private hungerProcess(pet: Pet, ctx: PetConditionContext) {
    const hunger = ctx.getStat('hunger');
    if (!hunger) return;
    if (hunger.porcent <= 15) {
      pet.conditions.add(PetCondition.Hungry);
    } else if (pet.conditions.has(PetCondition.Hungry)) {
      pet.conditions.delete(PetCondition.Hungry);
    }
  }

  private hygieneProcess(pet: Pet, ctx: PetConditionContext) {
    const hygiene = ctx.getStat('hygiene');
    if (!hygiene) return;
    if (hygiene.porcent <= 40) {
      pet.conditions.add(PetCondition.Dirty);
    } else if (pet.conditions.has(PetCondition.Dirty)) {
      pet.conditions.delete(PetCondition.Dirty);
    }
  }
}
