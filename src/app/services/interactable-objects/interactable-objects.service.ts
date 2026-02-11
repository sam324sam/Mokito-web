import { Injectable } from '@angular/core';
import { InteractuableObject, ObjectType } from '../../models/object/interactuable-object.model';
import { InteractuableObjectRuntime } from '../../models/object/Interactuable-object-runtime.model';

// Servicio
import { DataService } from '../data.service';
import { EntityStoreService } from '../entity-store.service';
import { isInteractuableObject } from '../../guards/is-interactuable-object.guard';
import { ParticleService } from '../particle/particle.service';
import { hasGrab } from '../../guards/has-grab.guard';

type ObjectBehaviors = (p: InteractuableObject, delta: number) => void;
@Injectable({
  providedIn: 'root',
})
export class InteractableObjectsService {
  objects: InteractuableObject[] = [];
  activeObjects: InteractuableObjectRuntime[] = [];

  // Mapa de behaviors disponibles
  behaviorMap: Record<string, ObjectBehaviors> = {
    dropWater: this.dropWater.bind(this),
  };

  constructor(
    private readonly dataService: DataService,
    private readonly entityStoreService: EntityStoreService,
    private readonly particleService: ParticleService,
  ) {
    this.objects = this.dataService.getObjects();
    console.log(this.objects);
  }

  update(delta: number) {
    for (const obj of this.activeObjects) {
      // Aplicar behaviors (fade, slowdown, etc.)
      if (obj.behaviors) {
        for (const behavior of obj.behaviors) {
          behavior(obj, delta);
        }
      }
      if (obj.grab?.isGrabbed) continue;

      obj.timeToLife = Math.max(0, obj.timeToLife - delta);

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
      sprite: { ...obj.sprite },
      id: null, // Resetear ID para que se genere uno nuevo
    };

    const behaviors: ObjectBehaviors[] = [];
    for (const element of obj.nameBehaviors) {
      if (element) {
        behaviors.push(this.behaviorMap[element]);
      }
    }

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
      behaviors: behaviors,
      isTouchingPet: false,
    };

    this.spawnLocation(runtimeObj);

    this.entityStoreService.addEntity(runtimeObj);
    this.activeObjects.push(runtimeObj);
  }

  spawnLocation(runtimeObj: InteractuableObjectRuntime) {
    const entities = this.entityStoreService.getAllEntities();

    if (runtimeObj.type == ObjectType.Food) {
      const table = entities.filter(isInteractuableObject).find((e) => e.name === 'Mesa');
      if (!table) return;

      runtimeObj.sprite.x = table.sprite.x + table.sprite.width / 2 - runtimeObj.sprite.width / 2;

      runtimeObj.sprite.y = table.sprite.y - table.sprite.height;
    }
  }

  deleteInteractuableObject(obj: InteractuableObject) {
    this.entityStoreService.removeEntity(obj.id);
    if (obj.id == null) return;
    this.activeObjects = this.activeObjects.filter((activeObj) => activeObj.id !== obj.id);
  }

  deleteAllInteractuableObjects() {
    for (const element of this.activeObjects) {
      this.entityStoreService.removeEntity(element.id);
    }
    this.activeObjects = [];
  }

  private dropWater(obj: InteractuableObject, delta: number) {
    if (hasGrab(obj) && obj.grab.isGrabbed) {
      if (Math.random() < 0.3) {
        this.particleService.emitShowerWater(
          obj.sprite.x + obj.sprite.height,
          obj.sprite.y + obj.sprite.height * obj.sprite.scale,
          1,
          5,
          'drops',
        );
      }
    }
  }
}
