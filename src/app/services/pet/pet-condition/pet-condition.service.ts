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

  // ==================== Metodos para la condicion de la pet

  /**
   * Gestiona efectos visuales de agotamiento extremo (exhausted)
   * Mas severo que tired - mas particulas de sudor y mensajes de agotamiento
   */
  private exhaustedCooldown: number = 0;
  private readonly exhausted: PetConditionBehavior = (pet, delta, ctx) => {
    const energy = ctx.getStat('energy');
    if (!energy) return;

    const { cooldown, triggered } = this.tickCooldown(
      this.exhaustedCooldown,
      delta,
      0.3 + Math.min(energy.porcent / 100, 0.3),
    );
    this.exhaustedCooldown = triggered ? 800 : cooldown;
    if (!triggered) return;

    if (pet.state === PetState.Idle) ctx.setAnimation('happiness15');

    if (pet.state !== PetState.Sleeping) {
      const { x, y } = this.getRandomSpritePosition(pet);
      this.particleService.emitSweatDrops(x, y, 2, 4, 'sweat-drops');
      this.tryEmitMessage(pet, ctx, 'olty', 0.15);
    }
  };

  /**
   * Gestiona efectos visuales de energia positiva (energetic)
   */
  private energeticCooldown: number = 0;
  private readonly energetic: PetConditionBehavior = (pet, delta, ctx) => {
    const energy = ctx.getStat('energy');
    if (!energy) return;

    const { cooldown, triggered } = this.tickCooldown(
      this.energeticCooldown,
      delta,
      0.6 + (energy.porcent / 100) * 0.4,
    );
    this.energeticCooldown = triggered ? 1500 : cooldown;
    if (!triggered) return;
  };

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

  /**
   * Gestiona efectos visuales de particulas basados en energia
   * Emite gotas aleatorias con probabilidad inversamente proporcional a la energia
   * Menos energia = mas probabilidad de emitir particulas (cansancio visual)
   */
  private energyCooldown: number = 0;
  private readonly tired: PetConditionBehavior = (pet, delta, ctx) => {
    const energy = ctx.getStat('energy');
    if (!energy) return;

    const { cooldown, triggered } = this.tickCooldown(
      this.energyCooldown,
      delta,
      0.5 + Math.min(energy.porcent / 100, 0.5),
    );
    this.energyCooldown = triggered ? 1000 : cooldown;
    if (!triggered) return;

    if (pet.state !== PetState.Sleeping) {
      const { x, y } = this.getRandomSpritePosition(pet);
      this.particleService.emitSweatDrops(x, y, 1, 2, 'sweat-drops');
      this.tryEmitMessage(pet, ctx, 'olty', 0.08);
    }
  };

  private dirtyCooldown: number = 0;
  private readonly dirty: PetConditionBehavior = (pet, delta, ctx) => {
    const hygiene = ctx.getStat('hygiene');
    if (!hygiene) return;

    const { cooldown, triggered } = this.tickCooldown(
      this.dirtyCooldown,
      delta,
      0.5 + Math.min(hygiene.porcent / 100, 0.5),
    );
    this.dirtyCooldown = triggered ? 1000 : cooldown;
    if (!triggered) return;

    const { x, y } = this.getRandomSpritePosition(pet);
    const textureName = 'dirty' + (Math.floor(Math.random() * 3) + 1);
    this.particleService.emitDirty(x, y, 1, 2, textureName);
    this.tryEmitMessage(pet, ctx, 'olt?', 0.08);
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
   * Calcula cuando poner y quitar la condicion de cansado y agotado
   */
  private energyProcess(pet: Pet, ctx: PetConditionContext): void {
    const energy = ctx.getStat('energy');
    if (!energy) return;

    // Exhausted: energia < 15
    if (energy.porcent <= 15) {
      pet.conditions.add(PetCondition.Exhausted);
      pet.conditions.delete(PetCondition.Tired);
    } else if (pet.conditions.has(PetCondition.Exhausted)) {
      pet.conditions.delete(PetCondition.Exhausted);
    }

    // Tired: energia < 40
    if (energy.porcent <= 40) {
      pet.conditions.add(PetCondition.Tired);
    } else if (pet.conditions.has(PetCondition.Tired)) {
      pet.conditions.delete(PetCondition.Tired);
    }

    // Energetic: energia > 70
    if (energy.porcent >= 70) {
      pet.conditions.add(PetCondition.Energetic);
    } else if (pet.conditions.has(PetCondition.Energetic)) {
      pet.conditions.delete(PetCondition.Energetic);
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

  // ==================== metodos reutilizables

  /**
   * Calcula una posicion aleatoria dentro del sprite de la pet
   */
  private getRandomSpritePosition(pet: Pet): { x: number; y: number } {
    const width = pet.sprite.width * pet.sprite.scale;
    const height = pet.sprite.height * pet.sprite.scale;
    return {
      x: pet.sprite.x + Math.random() * width,
      y: pet.sprite.y + Math.random() * height,
    };
  }

  /**
   * Intenta mostrar un mensaje con cierta probabilidad.
   * Si se muestra, cambia el estado a Talking.
   */
  private tryEmitMessage(
    pet: Pet,
    ctx: PetConditionContext,
    messageKey: string,
    probability: number,
  ): void {
    if (Math.random() < probability) {
      if (this.messageService.addMessage(messageKey, '', pet.sprite, pet.sprite.x, pet.sprite.y)) {
        ctx.setState(PetState.Talking);
      }
    }
  }

  /**
   * Ejecuta un behavior basado en cooldown con probabilidad configurable.
   * Retorna true si el tick fue procesado (cooldown llego a 0 y se supero la probabilidad).
   */
  private tickCooldown(
    cooldown: number,
    delta: number,
    probability: number,
  ): { cooldown: number; triggered: boolean } {
    const updated = cooldown - delta;
    if (updated > 0) return { cooldown: updated, triggered: false };
    const triggered = Math.random() > probability;
    return { cooldown: triggered ? 0 : updated, triggered };
  }
}
