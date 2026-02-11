import { Component, computed } from '@angular/core';
import { Room } from '../../models/room/room.model';
// servicios
import { PetService } from '../../services/pet/pet.service';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-room-button',
  imports: [],
  templateUrl: './room-button.html',
  styleUrl: './room-button.scss',
})
export class RoomButton {
  constructor(
    private readonly petService: PetService,
    private readonly roomService: RoomService,
  ) {
    this.rooms = this.roomService.getRooms();
  }
  buttonLocked = false;

  rooms: Room[] = [];
  currentIndex = computed(() => this.roomService.getCurrentIndex());
  // Computed para obtener la room actual del array
  currentRoom = computed(() => this.rooms[this.currentIndex()]);

  onRoomButtonClick(room: Room): void {
    if (this.buttonLocked) return;

    this.buttonLocked = true;

    // logica del botón
    if (room) {
      this.petService.executeRoomButton(room);
    }

    // desbloqueo opcional
    setTimeout(() => {
      this.buttonLocked = false;
    }, 500);
  }

  roomChange(delta: number) {
    this.petService.toggleInventory();
    this.roomService.changeRoom(delta);
  }
}
