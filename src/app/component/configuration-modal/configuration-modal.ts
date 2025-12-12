// configuration-modal.component.ts
import { Component, EventEmitter, Input, Output, AfterViewInit } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { Color } from '../../models/sprites/color.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-configuration-modal',
  templateUrl: './configuration-modal.html',
  styleUrl: './configuration-modal.scss',
})
export class ConfigurationModal implements AfterViewInit {
  @Input() isOpenConfiguration: boolean = false;
  @Output() toggleConfiguration = new EventEmitter<boolean>();

  constructor(private readonly petService: PetService, private readonly dataService: DataService) {}

  ngAfterViewInit() {
    this.colors = this.petService.colors;
    console.log('color de la mascota', this.colors);
    setTimeout(() => {
      this.selectedColor = this.petService.pet.sprite.color;
    }, 100);
  }

  // Apartado para los togles de los menus
  isColorSectionOpen = false;
  isCheatsSectionOpen = false;
  isSaveSectionOpen = false;

  toggleColorSection() {
    this.isColorSectionOpen = !this.isColorSectionOpen;
  }

  toggleCheatsSection() {
    this.isCheatsSectionOpen = !this.isCheatsSectionOpen;
  }

  toggleSaveSection() {
    this.isSaveSectionOpen = !this.isSaveSectionOpen;
  }

  // seccion del color
  colors: Color[] = [];
  selectedColor: Color = { name: '', color: '' };

  selectColor(color: Color) {
    this.selectedColor = color;
  }

  close() {
    this.isOpenConfiguration = false;
    this.isColorSectionOpen = false;
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
