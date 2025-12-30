import { Component, Input } from '@angular/core';
import { Color } from '../../../../models/sprites/color.model';
import { PetService } from '../../../../services/pet.service';

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
  selectedColor: Color = { name: '', color: '' };

  constructor(private readonly petService: PetService) {
    this.colors = this.petService.colors;
    this.selectedColor = this.petService.pet.sprite.color;
  }

  selectColor(color: Color) {
    this.selectedColor = color;
    this.petService.pet.sprite.color = this.selectedColor;
  }
}
