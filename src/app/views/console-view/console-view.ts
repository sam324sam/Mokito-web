import { Component } from '@angular/core';
import { Header } from '../../component/header/header';
import { RoomButton } from '../../component/room-button/room-button';
import { ConsoleFrame } from '../../component/console-frame/console-frame';
// Servicios
import { DataService } from '../../services/data.service';
@Component({
  selector: 'app-console-view',
  imports: [Header, RoomButton, ConsoleFrame],
  templateUrl: './console-view.html',
  styleUrl: './console-view.css',
})
export class ConsoleView {
  isLoading = false;
  constructor(private readonly dataService: DataService) {
    this.isLoading = this.dataService.getIsloading();
  }
}
