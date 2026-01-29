import { Component, Input } from '@angular/core';
import { Room } from '../../models/room/room.model';
// servicios
import { PetService } from '../../services/pet/pet.service';

@Component({
  selector: 'app-room-button',
  imports: [],
  templateUrl: './room-button.html',
  styleUrl: './room-button.scss',
})
export class RoomButton {
  constructor(private readonly petService: PetService) {}
  @Input() room: Room = {} as Room;
  buttonLocked = false;

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
}
