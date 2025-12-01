import { Injectable } from '@angular/core';
// model
import { Sprite } from '../models/sprites/sprites.model';
// servicios
@Injectable({ providedIn: 'root' })
export class CollisionService {
// Modificar la condicion no va bien
  isPointInsideSprite(sprite: Sprite, x: number, y: number): boolean {
    const sx = sprite.x;
    const sy = sprite.y;

    const sw = sprite.width;
    const sh = sprite.height;

    return x >= sx && x <= sx + sw && y >= sy && y <= sy + sh;
  }

  checkCollision(x: number, y: number, width: number, height: number, canvas: HTMLCanvasElement): boolean {
    if (x < 0) return true; // izquierda
    if (y < 0) return true; // arriba

    if (x + width > canvas.width) return true; // derecha
    if (y + height > canvas.height) return true; // abajo
    return false; // no hay colision
  }
}
