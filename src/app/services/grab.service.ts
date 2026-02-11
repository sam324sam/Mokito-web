import { Injectable } from '@angular/core';
import { Entity } from '../models/entity/entity.model';
import { EntityStoreService } from './entity-store.service';
import { hasGrab } from '../guards/has-grab.guard';
import { Grab } from '../models/entity/grab.model';

@Injectable({ providedIn: 'root' })
export class GrabService {
  private pressTimer: any = null;
  private readonly LONG_PRESS_DURATION = 300; // ms para considerar "agarre"
  private grabOffsetX = 0;
  private grabOffsetY = 0;

  constructor(private readonly entityStore: EntityStoreService) {}

  handlePressDown(event: PointerEvent): void {
    event.preventDefault();

    const entity = this.getEntityUnderCursor(event);
    if (!entity) {
      return;
    }

    this.clearPressTimer();

    const mouse = this.getMousePos(event);
    this.grabOffsetX = mouse.x - entity.sprite.x;
    this.grabOffsetY = mouse.y - entity.sprite.y;

    this.pressTimer = setTimeout(() => {
      this.startGrabbing(entity);
    }, this.LONG_PRESS_DURATION);
  }

  handlePressUp(event: PointerEvent): void {
    event.preventDefault();

    this.clearPressTimer();

    const grabbed = this.getGrabbedEntity();
    if (grabbed) {
      grabbed.grab.isGrabbed = false;
    }
  }

  handleMouseMove(event: PointerEvent): void {
    const grabbed = this.getGrabbedEntity();
    if (!grabbed) return;

    const mouse = this.getMousePos(event);
    grabbed.sprite.x = mouse.x - this.grabOffsetX;
    grabbed.sprite.y = mouse.y - this.grabOffsetY;

  }

  private startGrabbing(entity: Entity): void {
    if (!hasGrab(entity)) {
      return;
    }

    entity.grab.isGrabbed = true;
  }

  private getGrabbedEntity(): (Entity & Grab) | null {
    const entities = this.entityStore.getAllEntities();
    const grabbed = entities.find((e) => hasGrab(e) && e.grab.isGrabbed) as
      | (Entity & Grab)
      | undefined;

    if (grabbed) {
      return grabbed;
    }

    return null;
  }

  private getEntityUnderCursor(
    event: PointerEvent,
  ): (Entity & { grab: { isGrabbed: boolean; grabOffsetX: number; grabOffsetY: number } }) | null {
    const mouse = this.getMousePos(event);
    const entities = this.entityStore.getAllEntities();

    for (let i = entities.length - 1; i >= 0; i--) {
      const e = entities[i];
      if (!hasGrab(e)) continue;
      // scale puede estar en el sprite
      const { x, y, width, height, scale = 1 } = e.sprite;
      const realWidth = width * scale;
      const realHeight = height * scale;

      if (mouse.x >= x && mouse.x <= x + realWidth && mouse.y >= y && mouse.y <= y + realHeight) {
        return e;
      }
    }
    return null;
  }

  private clearPressTimer() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  private getMousePos(event: PointerEvent) {
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const scaleX = (event.target as HTMLCanvasElement).width / rect.width;
    const scaleY = (event.target as HTMLCanvasElement).height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }
}
