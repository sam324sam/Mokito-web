import { Injectable } from '@angular/core';
import { InteractuableObject } from '../../models/object/interactuable-object.model';
import { InteractuableObjectRuntime } from '../../models/object/Interactuable-object-runtime.model';
import { EntityStoreService } from '../entity-store.service';

// Servicio
import { SpriteService } from '../sprites.service';
import { DataService } from '../data.service';
@Injectable({
  providedIn: 'root',
})
export class InteractableObjectsService {
  objects: InteractuableObject[] = [];
  activeObjects: InteractuableObject[] = [];

  constructor(
    private readonly dataService: DataService,
    private readonly spriteService: SpriteService,
    private readonly entityStoreService: EntityStoreService,
  ) {
    this.objects = this.dataService.getObjects();
    console.log(this.objects);
  }

  update(delta: number) {
    for (const obj of this.activeObjects) {
      obj.timeToLife -= delta;
      if (obj.timeToLife <= 0) {
        this.deleteInteractuableObject(obj);
      }
    }
  }

  getInteractuableObjects(): InteractuableObject[] {
    return this.objects;
  }

  getInteractuableObject(name: string): InteractuableObject | undefined {
    return this.objects.find((obj) => obj.name === name);
  }

  addInteractuableObject(obj: InteractuableObject) {
    // clonar objeto base
    const objCopy: InteractuableObject = {
      ...obj,
      sprite: { ...obj.sprite }, // clonar sprite también
    };

    // crear runtime
    const runtimeObj: InteractuableObjectRuntime = {
      ...objCopy,
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
        width: objCopy.sprite.width * objCopy.sprite.scale,
        height: objCopy.sprite.height * objCopy.sprite.scale,
      },
      grab: {
        isGrabbed: false,
        grabOffsetX: 0,
        grabOffsetY: 0,
      },

      isTouchingPet: false,
    };

    this.entityStoreService.addEntity(runtimeObj);
    this.activeObjects.push(runtimeObj);
  }

  deleteInteractuableObject(obj: InteractuableObject) {
    this.entityStoreService.removeEntity(obj.id);
    if (obj.id == null) return;
    this.activeObjects = this.activeObjects.filter((activeObj) => activeObj.id !== obj.id);
  }
}
