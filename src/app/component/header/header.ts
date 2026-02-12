import { Component } from '@angular/core';
// Componente
import { ConfigurationModal } from '../configuration-modal/configuration-modal';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-header',
  imports: [ConfigurationModal, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header {

  isOpenConfiguration: boolean = false;
  toggleConfiguration(event: Event) {
    event.preventDefault(); // Evita que el # cambie la URL
    this.isOpenConfiguration = !this.isOpenConfiguration;
  }

  handleModalToggle(isOpen: boolean) {
    this.isOpenConfiguration = isOpen;
  }
}
