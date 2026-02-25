import { Component, Input } from '@angular/core';
import { PetService } from '../../../../services/pet/pet.service';
import { Pet, PetCondition } from '../../../../models/pet/pet.model';

@Component({
  selector: 'app-debug-pet',
  imports: [],
  templateUrl: './debug-pet.html',
  styleUrl: './debug-pet.scss',
})
export class DebugPet {
  @Input() idDebugPetSectionOpen: boolean = false;

  pet: Pet = {} as Pet;
  constructor(private readonly petService: PetService) {
    this.pet = this.petService.pet;
  }

  get allConditions(): PetCondition[] {
    return Object.values(PetCondition) as PetCondition[];
  }

  activeCondition(condition: PetCondition) {
    return this.petService.pet.conditions.has(condition);
  }

  onConditionChange(event: Event, condition: PetCondition) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.petService.pet.conditions.add(condition);
    } else {
      this.petService.pet.conditions.delete(condition);
    }
  }
  
  getNoConditionProcces() {
    return this.petService.pet.cheats.noConditionProcces;
  }

  setNoConditionProcces(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.petService.pet.cheats.noConditionProcces = checked;
  }
}
