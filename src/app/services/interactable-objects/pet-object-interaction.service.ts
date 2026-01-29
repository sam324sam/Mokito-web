import { Injectable } from '@angular/core';
// Model
import { InteractuableObjectRuntime } from '../../models/object/Interactuable-object-runtime.model';
import { Pet, PetState } from '../../models/pet/pet.model';
import { ObjectType } from '../../models/object/interactuable-object.model';
// Service
import { InteractableObjectsService } from './interactable-objects.service';
import { PetService } from '../pet/pet.service';

@Injectable({ providedIn: 'root' })
export class PetObjectInteractionService {
  constructor(
    private readonly petService: PetService,
    private readonly interactableObjectsService: InteractableObjectsService,
  ) {}

  onPetTouchObject(pet: Pet, obj: InteractuableObjectRuntime) {
    if (obj.type === ObjectType.Food) {
      this.petEat(pet, obj);
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
