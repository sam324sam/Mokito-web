import { Component } from '@angular/core';
import { Header } from '../../component/header/header';
import { RoomButton } from '../../component/room-button/room-button';
import { PetView } from '../pet-view/pet-view';

@Component({
  selector: 'app-console-view',
  imports: [PetView, Header, RoomButton],
  templateUrl: './console-view.html',
  styleUrl: './console-view.scss',
})
export class ConsoleView {

}
