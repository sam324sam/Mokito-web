import { Injectable } from '@angular/core';
import { Entity } from '../models/entity/entity.model';

@Injectable({ providedIn: 'root' })
export class EntityStoreService {
  private entities: Record<number, Entity> = {};
  private nextId = 1;

  addEntity(entity: Entity): Entity {
    if (entity.id == null || this.entities[entity.id]) {
      entity.id = this.nextId++;
    }

    this.entities[entity.id] = entity;
    return entity;
  }

  getEntity(id: number): Entity | undefined {
    return this.entities[id];
  }

  getAllEntities(): Entity[] {
    return Object.values(this.entities);
  }

  removeEntity(id: number) {
    delete this.entities[id];
  }
}
