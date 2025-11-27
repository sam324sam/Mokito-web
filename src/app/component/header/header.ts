import { Component } from '@angular/core';
import { ConfigurationModal } from '../configuration-modal/configuration-modal';
@Component({
  selector: 'app-header',
  imports: [ConfigurationModal],
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
