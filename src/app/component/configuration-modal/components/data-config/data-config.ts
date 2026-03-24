import { Component, Input } from '@angular/core';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-data-config',
  imports: [],
  templateUrl: './data-config.html',
  styleUrl: './data-config.css',
})
export class DataConfig {
  @Input() isSaveSectionOpen: boolean = false;

  constructor(private readonly dataService: DataService) {}
  clearSaveData() {
    const confirmReset = confirm('¿Seguro que quieres borrar todos los datos?');

    if (!confirmReset) return;

    this.dataService.clearSaveData();
  }
}
