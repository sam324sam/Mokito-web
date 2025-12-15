// configuration-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
// servicios
import { PetService } from '../../services/pet.service';
import { DataService } from '../../services/data.service';
// modelo
import { Color } from '../../models/sprites/color.model';

@Component({
  selector: 'app-configuration-modal',
  templateUrl: './configuration-modal.html',
  styleUrl: './configuration-modal.scss',
})
export class ConfigurationModal {
  @Input() isOpenConfiguration: boolean = false;
  @Output() toggleConfiguration = new EventEmitter<boolean>();

  constructor(readonly petService: PetService, private readonly dataService: DataService) {}

  // Apartado para los togles de los menus
  isColorSectionOpen = false;
  isCheatsSectionOpen = false;
  isSaveSectionOpen = false;

  toggleColorSection() {
    this.isColorSectionOpen = !this.isColorSectionOpen;
    this.colors = this.petService.colors;
    this.selectedColor = this.petService.pet.sprite.color;
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
    this.petService.pet.sprite.color = this.selectedColor;
  }

  close() {
    this.isOpenConfiguration = false;
    this.isColorSectionOpen = false;
    this.isCheatsSectionOpen = false;
    this.toggleConfiguration.emit(false);
  }

  // Apartado de los trucos
  // God moide
  getGodMode() {
    return this.petService.pet.cheats.godMode;
  }
  setGodMode(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.petService.pet.cheats.godMode = checked;
    if (checked) {
      for (const stat of this.petService.pet.stats) {
        stat.porcent = 100;
      }
    }
  }

  // Bloquear movimiento
  getNoMoreMove(){
    return this.petService.pet.cheats.noMoreMove;
  }
  setNoMoreMove(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.petService.pet.cheats.noMoreMove = checked;
  }
}
