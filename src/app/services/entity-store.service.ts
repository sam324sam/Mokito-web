import { Injectable } from '@angular/core';
import { Entity } from '../models/entity/entity.model';

@Injectable({ providedIn: 'root' })
export class EntityStoreService {
  private entities: Record<number, Entity> = {};
  private nextId: number = 1;
  private readonly zOrder: Entity[] = [];
  private needsSort = false;

  /**
   * Agrega una entidad al store y a la lista zOrder
   */
  addEntity(entity: Entity): Entity {
    if (entity.id == null || this.entities[entity.id]) {
      entity.id = this.nextId++;
    }

    this.entities[entity.id] = entity;

    this.zOrder.push(entity);
    this.needsSort = true;

    return entity;
  }

  /**
   *  Devuelve la lista de entidades ordenadas por zIndex (mayor primero)
   */
  getZOrder(): Entity[] {
    if (!this.needsSort) return this.zOrder;

    this.zOrder.sort((entityA, entityB) => {
      const zIndexA = entityA.sprite?.zIndex ?? 0;
      const zIndexB = entityB.sprite?.zIndex ?? 0;

      /*** Los sprites con zIndex mayor se dibujan encima y se procesan primero ***/
      return zIndexB - zIndexA;
    });

    this.needsSort = false;
    return this.zOrder;
  }

  /**
   * Obtiene una entidad por su id
   */
  getEntity(id: number): Entity | undefined {
    return this.entities[id];
  }

  /**
   * Devuelve todas las entidades como un record por id
   */
  getAllEntities(): Record<number, Entity> {
    return this.entities;
  }

  /**
   *  Elimina una entidad del store y de la lista zOrder si tiene sprite
   */
  removeEntity(id: number | null) {
    if (id == null) return;

    const entity = this.entities[id];

    if (entity?.sprite) {
      const index = this.zOrder.indexOf(entity);
      if (index !== -1) {
        const lastIndex = this.zOrder.length - 1;
        const lastEntity = this.zOrder[lastIndex];
        this.zOrder[index] = lastEntity;
        this.zOrder.pop();
      }
    }
    delete this.entities[id];
  }
}
