import { Injectable } from '@angular/core';
// Model
import { InteractuableObjectRuntime } from '../../models/object/Interactuable-object-runtime.model';
import { Pet, PetState } from '../../models/pet/pet.model';
import { ObjectType } from '../../models/object/interactuable-object.model';
// Service
import { InteractableObjectsService } from './interactable-objects.service';
import { PetService } from '../pet/pet.service';
import { Entity } from '../../models/entity/entity.model';
import { isPet } from '../../guards/is-pet.guard';
import { isInteractuableObject } from '../../guards/is-interactuable-object.guard';
import { hasGrab } from '../../guards/has-grab.guard';

@Injectable({ providedIn: 'root' })
export class PetObjectInteractionService {
  private readonly TouchCooldown = 2500; // ms para no colicionar varias veces

  constructor(
    private readonly petService: PetService,
    private readonly interactableObjectsService: InteractableObjectsService,
  ) {}

  onPetTouchObject(pet: Entity, obj: Entity) {
    if (!isPet(pet) || !isInteractuableObject(obj)) return;
    switch (obj.type) {
      case ObjectType.Food:
        this.petEat(pet, obj);
        break;
      case ObjectType.Bathroom:
        this.petBathing(pet, obj);
        break;
      case ObjectType.Garden:
        this.onPetGarden(pet, obj);
        break;
      case ObjectType.Room:
        this.onPetTouchRoomObject(pet, obj);
        break;

      default:
        return;
    }
  }

  private onPetGarden(pet: Pet, obj: InteractuableObjectRuntime){
    if (obj.tags.includes('ball')) {
      let MIN_SPEED = 100;
      if (obj.physics && MIN_SPEED <= obj.physics.vx) {
        this.petService.setState(PetState.PlayBall);
      }
    }
  }

  private onPetTouchRoomObject(pet: Pet, obj: InteractuableObjectRuntime) {
    if (hasGrab(pet) && obj.tags.includes('bed') && pet.grab.isGrabbed) {
      this.petService.setState(PetState.Sleeping);
    }
  }

  private petBathing(pet: Pet, obj: InteractuableObjectRuntime) {
    if (obj.tags.includes('soap') && obj.grab?.isGrabbed) {
      this.petService.setState(PetState.Bathing);
    }
  }

  private petEat(pet: Pet, food: InteractuableObjectRuntime) {
    if (pet.state === PetState.Eating) return;
    if (pet.state !== PetState.Idle) return;

    this.interactableObjectsService.deleteInteractuableObject(food);
    this.petService.setState(PetState.Eating);
    this.petService.sumMinusStat('hunger', 10);
  }
}
