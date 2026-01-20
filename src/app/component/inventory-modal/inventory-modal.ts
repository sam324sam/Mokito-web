import { Component, computed, effect } from '@angular/core';
import { InteractuableObject, ObjectType } from '../../models/object/interactuable-object.model';
// Servicios
import { InteractableObjectsService } from '../../services/interactable-objects/interactable-objects.service';
import { PetService } from '../../services/pet/pet.service';

@Component({
  selector: 'app-inventory-modal',
  imports: [],
  templateUrl: './inventory-modal.html',
  styleUrl: './inventory-modal.scss',
})
export class InventoryModal {
  type: ObjectType | null = {} as ObjectType;
  isOpenInventory: boolean = false;
  interactuableObjects: InteractuableObject[] = [];
  activeObjects: InteractuableObject[] = [];
  constructor(
    private readonly interactableObjectsService: InteractableObjectsService,
    private readonly petService: PetService,
  ) {
    this.interactuableObjects = this.interactableObjectsService.getInteractuableObjects();
    effect(() => {
      this.type = this.petService.selectedTypeInventory();
      this.isOpenInventory = this.petService.isOpenInventory();
    });
  }

  filteredObjects = computed(() => {
    const type = this.petService.selectedTypeInventory();
    const objects = this.interactableObjectsService.getInteractuableObjects();

    if (!type) return [];
    return objects.filter((o) => o.type === type);
  });

  generateObject(obj: InteractuableObject) {
    this.interactableObjectsService.addInteractuableObject(obj);
  }

  closeInventory() {
    this.petService.toggleInventory();
  }
}
