
// configuration-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PetService } from '../../services/pet.service';
// Modelo
import { Color } from '../../models/sprites/color.model';

@Component({
  selector: 'app-configuration-modal',
  imports: [],
  templateUrl: './configuration-modal.html',
  styleUrl: './configuration-modal.scss',
})
export class ConfigurationModal {
  @Input() isOpenConfiguration: boolean = false;
  @Output() toggleConfiguration = new EventEmitter<boolean>();
  
  colors: Color[];
  selectedColor: Color = {
    name: '',
    color: ''
  };

  constructor(private readonly petService: PetService) {
    this.colors = this.petService.colors;
    this.selectedColor = this.petService.pet.sprite.color;
  }

  selectColor(color: Color) {
    this.selectedColor = color;
  }

  close() {
    this.isOpenConfiguration = false;
    this.toggleConfiguration.emit(false);
  }

  apply() {
    if (this.selectedColor) {
      console.log('Color aplicado:', this.selectedColor);
      this.petService.pet.sprite.color = this.selectedColor;
    }
    this.close();
  }
}