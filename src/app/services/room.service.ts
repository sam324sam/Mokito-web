import { Injectable, signal, computed } from '@angular/core';
// model
import { Room } from '../models/room/room.model';
import { InteractuableObject } from '../models/object/interactuable-object.model';
// Service
import { DataService } from './data.service';
import { EntityStoreService } from './entity-store.service';
import { InteractuableObjectRuntime } from '../models/object/Interactuable-object-runtime.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly rooms: Room[] = [];
  private readonly roomIndex = signal(0);
  private activeObjectsRoom: InteractuableObject[] = [];

  constructor(
    private readonly dataService: DataService,
    private readonly entityStoreService: EntityStoreService,
  ) {
    this.rooms = this.dataService.getRooms();
    console.log('Rooms', this.rooms);
    this.generateObjectsRoom();
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
    this.deleteObjectsRoom();
    if (total === 0) return;

    let newIndex = this.roomIndex() + delta;

    if (newIndex < 0) {
      newIndex = total - 1;
    } else if (newIndex >= total) {
      newIndex = 0;
    }

    this.roomIndex.set(newIndex);
    this.generateObjectsRoom();
  }

  generateObjectsRoom() {
    const actualRoom = this.rooms[this.roomIndex()];

    if (!actualRoom.objects) return;

    const objects = Object.values(actualRoom.objects);

    for (const object of objects) {
      const runtimeObj: InteractuableObjectRuntime = {
        ...object,
        active: true,
        physics: {
          vx: 0,
          vy: 0,
          gravity: 980,
          enabled: true,
        },
        collider: {
          offsetX: 0,
          offsetY: 0,
          width: object.sprite.width,
          height: object.sprite.height,
          tags: [object.type]
        },
        grab: {
          isGrabbed: false,
          grabOffsetX: 0,
          grabOffsetY: 0,
        },

        isTouchingPet: false,
      };

      this.entityStoreService.addEntity(runtimeObj);
      this.activeObjectsRoom.push(runtimeObj);
    }
  }

  deleteObjectsRoom() {
    const room = this.rooms[this.roomIndex()];

    if (!room.objects) return;

    for (const runtimeObj of this.activeObjectsRoom) {
      const baseObj = room.objects[runtimeObj.name];

      if (baseObj) {
        baseObj.sprite.x = runtimeObj.sprite.x;
        baseObj.sprite.y = runtimeObj.sprite.y;
        baseObj.active = runtimeObj.active;
        baseObj.timeToLife = runtimeObj.timeToLife;
      }

      this.entityStoreService.removeEntity(runtimeObj.id);
    }

    this.activeObjectsRoom = [];
  }
}
