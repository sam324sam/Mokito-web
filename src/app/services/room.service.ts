import { Injectable, signal, computed } from '@angular/core';
import { Room } from '../models/room/room.model';
// Service
import { DataService } from './data.service';
import { PetService } from './pet/pet.service';

@Injectable({ providedIn: 'root' })
export class RoomService {

  /**
   * Comportamientos para cada habitacion
   */
  private readonly buttonBehaviors: Record<string, () => void> = {
    openInventory: () => { console.log('Abrir inventario'); },
    sleep: () => {  },
    brushTeeth: () => { console.log('Cepillando dientes'); },
    waterPlants: () => { console.log('Regando plantas'); },
  };

  private readonly rooms: Room[] = [];
  
  private readonly roomIndex = signal(0);

  currentRoom = computed(() => {
    if (this.rooms.length === 0) {
      return { name: '', img: null, music: null };
    }
    return this.rooms[this.roomIndex()];
  });

  constructor(private readonly dataService: DataService, private readonly petService: PetService) {
    this.rooms = this.dataService.getRooms();
  }

  getRooms(): Room[] {
    return this.rooms;
  }

  getCurrentIndex(): number {
    return this.roomIndex();
  }

  changeRoom(delta: number): void {
    const newIndex = this.roomIndex() + delta;

    if (newIndex < 0 || newIndex >= this.rooms.length) {
      return;
    }

    // Actualizar el signal
    this.roomIndex.set(newIndex);
  }

  /**
   * Ejecutar la accion de cada habitacion
   * @param room 
   * @returns 
   */
  executeRoomButton(room: Room) {
    if (!room.buttonRoom || !this.petService.pet) return;
    const behavior = this.buttonBehaviors[room.buttonRoom.buttonBehavior];
    behavior?.();
  }
}