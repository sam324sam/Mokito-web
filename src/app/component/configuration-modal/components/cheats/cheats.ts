import { Component, effect, Input } from '@angular/core';
import { PetService } from '../../../../services/pet/pet.service';
import { Stats } from '../../../../models/pet/stats.model';

@Component({
  selector: 'app-cheats',
  imports: [],
  templateUrl: './cheats.html',
  styleUrl: './cheats.scss',
})
export class Cheats {
  @Input() isCheatsSectionOpen: boolean = false;
  energia: any;
  hambre: any;
  felicidad: any;
  fuerza: any;
  stats: Stats[] = [];

  constructor(private readonly petService: PetService) {
    effect(() => {
      this.stats = this.petService.statsChanged();
    });
  }

  // Apartado de los trucos
  // God moide
  getGodMode() {
    return this.petService.pet.cheats.godMode;
  }
  setGodMode(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.petService.pet.cheats.godMode = checked;
  }

  // Bloquear movimiento
  getNoMoreMove() {
    return this.petService.pet.cheats.noMoreMove;
  }
  setNoMoreMove(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.petService.pet.cheats.noMoreMove = checked;
  }

  // apartado de las stats
  roundStat(porcent: number) {
    return Math.round(porcent);
  }

  getManipulateStats() {
    this.stats = this.petService.statsChanged();
  }
}
