import { Component, computed } from '@angular/core';
import { Room } from '../../models/room/room.model';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-room-pet',
  imports: [],
  templateUrl: './room-pet.html',
  styleUrl: './room-pet.css',
})
export class RoomPet {
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
