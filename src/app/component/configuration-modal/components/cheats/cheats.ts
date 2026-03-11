import { Component, effect, Input } from '@angular/core';
import { PetService } from '../../../../services/pet/pet.service';
import { Stats } from '../../../../models/pet/pet.model';
import { DataService } from '../../../../services/data.service';
@Component({
  selector: 'app-cheats',
  imports: [],
  templateUrl: './cheats.html',
  styleUrl: './cheats.css',
})
export class Cheats {
  @Input() isCheatsSectionOpen: boolean = false;
  stats: Stats[] = [];

  constructor(
    private readonly petService: PetService,
    private readonly dataService: DataService,
  ) {
    effect(() => {
      this.stats = this.petService.statsChanged();
    });
  }

  // Apartado de los trucos
  // God moide
  getGodMode() {
    return this.petService.pet?.cheats?.godMode ?? this.dataService.getPetRuntime().cheats.godMode;
  }
  setGodMode(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.petService.pet.cheats.godMode = checked;
  }

  // Bloquear movimiento
  getNoMoreMove() {
    return (
      this.petService.pet?.cheats?.noMoreMove ?? this.dataService.getPetRuntime().cheats.noMoreMove
    );
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

  // stats
  onStatChange(name: string, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.petService.setStatPorcent(name, value);
  }
}
