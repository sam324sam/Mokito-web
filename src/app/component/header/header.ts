import { Component, computed } from '@angular/core';
// Componente
import { ConfigurationModal } from '../configuration-modal/configuration-modal';
import { RoomButton } from '../room-button/room-button';
//servicio
import { RoomService } from '../../services/room.service';
// Modal
import { Room } from '../../models/room/room.model';

@Component({
  selector: 'app-header',
  imports: [ConfigurationModal,RoomButton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header {
  rooms: Room[] = [];
  currentIndex = computed(() => this.roomService.getCurrentIndex());

  // Computed para obtener la room actual del array
  currentRoom = computed(() => this.rooms[this.currentIndex()]);

  constructor(private readonly roomService: RoomService) {
    this.rooms = this.roomService.getRooms();
  }

  isOpenConfiguration: boolean = false;
  toggleConfiguration(event: Event) {
    event.preventDefault(); // Evita que el # cambie la URL
    this.isOpenConfiguration = !this.isOpenConfiguration;
  }

  handleModalToggle(isOpen: boolean) {
    this.isOpenConfiguration = isOpen;
  }

  roomChange(delta: number) {
    this.roomService.changeRoom(delta);
  }
}
