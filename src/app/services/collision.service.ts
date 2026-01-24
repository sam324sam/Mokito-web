import { Injectable } from '@angular/core';
// model
import { Sprite } from '../models/sprites/sprites.model';
// Guards
import { isPet } from '../guards/is-pet.guard';
import { isInteractuableObject } from '../guards/is-interactuable-object.guard';
import { Entity } from '../models/entity/entity.model';
import { hasCollider } from '../guards/has-collider.guard';
import { hasPhysics } from '../guards/has-physics.guard';
@Injectable({ providedIn: 'root' })
export class CollisionService {
  // Ahora considera la escala del sprite
  isPointInsideSprite(sprite: Sprite, x: number, y: number): boolean {
    const sx = sprite.x;
    const sy = sprite.y;

    const sw = sprite.width;
    const sh = sprite.height;

    const isInside = x >= sx && x <= sx + sw && y >= sy && y <= sy + sh;

    console.log('Click detection:', {
      mouseX: x.toFixed(2),
      mouseY: y.toFixed(2),
      spriteX: sx.toFixed(2),
      spriteY: sy.toFixed(2),
      spriteW: sw,
      spriteH: sh,
      isInside,
    });

    return isInside;
  }

  checkCollision(
    x: number,
    y: number,
    width: number,
    height: number,
    canvas: HTMLCanvasElement,
  ): boolean {
    if (x < 0) return true; // izquierda
    if (y < 0) return true; // arriba
    if (x + width > canvas.width) return true; // derecha
    if (y + height > canvas.height) return true; // abajo
    return false; // no hay colision
  }

  areColliding(a: Entity, b: Entity): boolean {
    if (!('sprite' in a) || !('sprite' in b)) return false;
    if (!('collider' in a) || !('collider' in b)) return false;

    const A = a.sprite;
    const B = b.sprite;
    const cA = (a as any).collider;
    const cB = (b as any).collider;

    const sA = A.scale ?? 1;
    const sB = B.scale ?? 1;

    const Ax = A.x + cA.offsetX * sA;
    const Ay = A.y + cA.offsetY * sA;
    const Aw = cA.width * sA;
    const Ah = cA.height * sA;

    const Bx = B.x + cB.offsetX * sB;
    const By = B.y + cB.offsetY * sB;
    const Bw = cB.width * sB;
    const Bh = cB.height * sB;

    return !(Ax + Aw < Bx || Ax > Bx + Bw || Ay + Ah < By || Ay > By + Bh);
  }

  resolve(a: Entity, b: Entity) {
    if (isPet(a) && isInteractuableObject(b)) {
      console.log('pet con objeto');
      return;
    }

    if (isPet(b) && isInteractuableObject(a)) {
      console.log('Objeto con pet');
      return;
    }

    if (isInteractuableObject(a) && isInteractuableObject(b)) {
      this.resolveObjectObject(a, b);
    }
  }

  resolveObjectObject(a: Entity, b: Entity) {
    const A = a.sprite;
    const B = b.sprite;
    if (!hasCollider(a) || !hasCollider(b) || !hasPhysics(a) || !hasPhysics(b)) return;
    const cA = a.collider;
    const cB = b.collider;

    // Escala
    const sA = A.scale ?? 1;
    const sB = B.scale ?? 1;

    // Tamaño y poscion del colider de a yb
    const Ax = A.x + cA.offsetX * sA;
    const Ay = A.y + cA.offsetY * sA;
    const Aw = cA.width * sA;
    const Ah = cA.height * sA;

    const Bx = B.x + cB.offsetX * sB;
    const By = B.y + cB.offsetY * sB;
    const Bw = cB.width * sB;
    const Bh = cB.height * sB;

    // ver si coliciona de arrba o abajo
    const overlapX = Math.min(Ax + Aw - Bx, Bx + Bw - Ax);
    const overlapY = Math.min(Ay + Ah - By, By + Bh - Ay);

    // empujar mediante el eje menor
    if (overlapY < overlapX) {
      // a cae sobre b
      if (Ay < By) {
        A.y -= overlapY;
        a.physics.vy = 0;
      }
      // b cae sobre a
      else {
        B.y -= overlapY;
        b.physics.vy = 0;
      }
    } else if (Ax < Bx) {
      // empuje lateral izquierda
      A.x -= overlapX / 2;
      B.x += overlapX / 2;
    } else {
      // Empuje lateral derecha
      A.x += overlapX / 2;
      B.x -= overlapX / 2;
    }
  }
}
