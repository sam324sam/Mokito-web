import { Injectable, signal, computed } from '@angular/core';
import { Room } from '../models/room/room.model';
// Service
import { DataService } from './data.service';
import { PetService } from './pet/pet.service';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly rooms: Room[] = [];

  private readonly roomIndex = signal(0);

  constructor(
    private readonly dataService: DataService,
    private readonly petService: PetService,
  ) {
    this.rooms = this.dataService.getRooms();
  }
  currentRoom = computed(() => {
    if (this.rooms.length === 0) {
      return { name: '', img: null, music: null };
    }
    return this.rooms[this.roomIndex()];
  });

  getRooms(): Room[] {
    return this.rooms;
  }

  getCurrentIndex(): number {
    return this.roomIndex();
  }

  changeRoom(delta: number): void {
    const total = this.rooms.length;
    if (total === 0) return;

    let newIndex = this.roomIndex() + delta;

    if (newIndex < 0) {
      newIndex = total - 1;
    } else if (newIndex >= total) {
      newIndex = 0;
    }

    this.roomIndex.set(newIndex);
  }
}
