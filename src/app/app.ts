import { Component } from '@angular/core';
import { PetView } from './views/pet-view/pet-view';
import { Header } from './component/header/header';
import { RoomButton } from "./component/room-button/room-button";

@Component({
  selector: 'app-root',
  imports: [PetView, Header, RoomButton],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App{

}
