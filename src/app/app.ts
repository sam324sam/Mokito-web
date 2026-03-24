import { Component, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  constructor(private readonly dataService: DataService) {}

  ngAfterViewInit() {
    const playerData = this.dataService.getPlayerData();
    document.documentElement.style.setProperty(
      '--console-frame',
      `url('assets/img/icon/UI/console/${playerData.frameConsoleColor}/frame-console.png')`,
    );
    document.documentElement.style.setProperty(
      '--screen-frame',
      `url('assets/img/icon/UI/console/${playerData.framePetColor}/frame-pet.png')`,
    );
  }
}
