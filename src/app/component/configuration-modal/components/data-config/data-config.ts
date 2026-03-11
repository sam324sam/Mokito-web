import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-data-config',
  imports: [],
  templateUrl: './data-config.html',
  styleUrl: './data-config.css',
})
export class DataConfig {
  @Input() isSaveSectionOpen: boolean = false;
}
