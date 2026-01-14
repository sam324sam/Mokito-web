import { Component, Input } from '@angular/core';
import { Room } from '../../models/room/room.model';
// servicios
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-room-button',
  imports: [],
  templateUrl: './room-button.html',
  styleUrl: './room-button.scss',
})
export class RoomButton {
  constructor(private readonly roomService: RoomService) {}
  @Input() room: Room = {} as Room;

  onRoomButtonClick(room: Room) {
    if (room) {
      this.roomService.executeRoomButton(room);
    }
  }
}
