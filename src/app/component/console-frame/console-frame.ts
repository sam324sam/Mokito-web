import { Component, computed } from '@angular/core';
import { PetComponent } from '../pet-component/pet-component';
import { Room } from '../../models/room/room.model';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-console-frame',
  imports: [PetComponent],
  templateUrl: './console-frame.html',
  styleUrl: './console-frame.css',
})
export class ConsoleFrame {
  // para room
  rooms: Room[] = [];
  currentIndex = computed(() => this.roomService.getCurrentIndex());

  // Computed para obtener la room actual del array
  currentRoom = computed(() => this.rooms[this.currentIndex()]);

  constructor(private readonly roomService: RoomService) {
    this.rooms = this.roomService.getRooms();
  }

  activeRoom(room: Room): boolean {
    return room == this.currentRoom();
  }
}
