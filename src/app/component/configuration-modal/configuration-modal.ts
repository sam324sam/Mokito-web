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

  colors: Color[] = [];
  selectedColor: Color = { name: '', color: '' };

  constructor(private readonly petService: PetService, private readonly dataService: DataService) {}

  ngAfterViewInit() {
    this.colors = this.petService.colors;

    // Esperar a que la mascota esté lista
    if (this.petService.pet?.sprite) {
      this.selectedColor = this.petService.pet.sprite.color;
    } else {
      // Puede que aún no esté cargada; usar setTimeout o Promise
      const interval = setInterval(() => {
        if (this.petService.pet?.sprite) {
          this.selectedColor = this.petService.pet.sprite.color;
          clearInterval(interval);
        }
      }, 50);
    }
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

      // FORMA CORRECTA: actualizar el sprite mediante el DataService
      this.petService.pet.sprite.color = this.selectedColor;

      this.close();
    }
  }
}
