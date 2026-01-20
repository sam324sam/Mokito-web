import { Injectable } from '@angular/core';
import {
  InteractuableObject,
  InteractuableObjectRuntime,
} from '../../models/object/interactuable-object.model';
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
  ) {
    this.objects = this.dataService.getObjects();
    console.log(this.objects);
  }

  update(delta: number){
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
      isTouchingPet: false,
    };

    this.spriteService.addSprite(runtimeObj.sprite);
    this.activeObjects.push(runtimeObj);
    console.log('Nuevo objeto runtime agregado', runtimeObj);
  }

  deleteInteractuableObject(obj: InteractuableObject) {
    this.spriteService.deleteSprite(obj.sprite.id);
    if (obj.sprite.id == null) return;
    this.activeObjects = this.activeObjects.filter(
      (activeObj) => activeObj.sprite.id !== obj.sprite.id,
    );
    console.log('Eliminado el objeto', obj);
  }
}
