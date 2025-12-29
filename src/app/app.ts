import { Component } from '@angular/core';
import { PetView } from './views/pet-view/pet-view';
import { Header } from './component/header/header';

@Component({
  selector: 'app-root',
  imports: [PetView, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App{

}
