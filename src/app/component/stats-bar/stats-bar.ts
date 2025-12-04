import { Component, effect } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { Stats } from '../../models/pet/stats.model';

@Component({
  selector: 'app-stats-bar',
  templateUrl: './stats-bar.html',
  styleUrl: './stats-bar.scss',
})
export class StatsBar {
  stats: Stats[] = [];

  constructor(private readonly petService: PetService) {
    
    effect(() => {
      this.stats = this.petService.statsChanged();
    });
  }

  roundStat(porcent: number) {
    return Math.round(porcent);
  }

  getColor(porcent: number): string {
    if (porcent > 70) return '#00ff00';
    if (porcent > 40) return '#ffff00';
    return '#ff0000';
  }
}
