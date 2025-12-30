import { Component, Input } from '@angular/core';
import { PetService } from '../../../../services/pet.service';

@Component({
  selector: 'app-cheats',
  imports: [],
  templateUrl: './cheats.html',
  styleUrl: './cheats.scss',
})
export class Cheats {
  @Input() isCheatsSectionOpen: boolean = false;

  constructor(private readonly petService: PetService) {}

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
  getNoMoreMove() {
    return this.petService.pet.cheats.noMoreMove;
  }
  setNoMoreMove(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.petService.pet.cheats.noMoreMove = checked;
  }
}
