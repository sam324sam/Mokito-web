import { Component, Input } from '@angular/core';
import { Color } from '../../../../models/sprites/color.model';
// Servicios
import { PetService } from '../../../../services/pet/pet.service';
import { DataService } from '../../../../services/data.service';
@Component({
  selector: 'app-color-selector',
  imports: [],
  templateUrl: './color-selector.html',
  styleUrl: './color-selector.scss',
})
export class ColorSelector {
  @Input() isColorSectionOpen: boolean = false;
  // seccion del color
  colors: Color[] = [];
  selectedColor: Color | null = {} as Color;

  constructor(
    private readonly petService: PetService,
    private readonly dataService: DataService,
  ) {
    this.colors = this.dataService.getColors();
    this.selectedColor = this.dataService.getPetRuntime().sprite.color;
  }

  selectColor(color: Color) {
    this.selectedColor = color;
    this.petService.pet.sprite.color = this.selectedColor;
  }
}
