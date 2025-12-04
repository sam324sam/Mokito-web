import { Component } from '@angular/core';
import { ConfigurationModal } from '../configuration-modal/configuration-modal';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-header',
  imports: [ConfigurationModal, NgClass],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header {
  isOpenHeader: boolean = false;
  toggleHeader(event: Event) {
    event.preventDefault(); // Evita que el # cambie la URL
    this.isOpenHeader = !this.isOpenHeader;
  }
  isOpenConfiguration: boolean = false;
  toggleConfiguration(event: Event) {
    event.preventDefault(); // Evita que el # cambie la URL
    this.isOpenConfiguration = !this.isOpenConfiguration;
  }

  handleModalToggle(isOpen: boolean) {
    this.isOpenConfiguration = isOpen;
  }
}
