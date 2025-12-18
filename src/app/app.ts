import { Component } from '@angular/core';
import { PetView } from './views/pet-view/pet-view';
import { Header } from './component/header/header';
import { StatsBar } from "./component/stats-bar/stats-bar";

@Component({
  selector: 'app-root',
  imports: [PetView, Header, StatsBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App{

}
