import { Injectable } from '@angular/core';
import { SpriteService } from './sprites.service';

@Injectable({ providedIn: 'root' })
export class CursorService {
  constructor(private readonly spriteService: SpriteService) {}

  setCanvasCursor(url: string) {
    const canvas = this.spriteService.getCanvas();
    if (!canvas) return;
    canvas.style.cursor = `url("${url}") 16 16, auto`;
  }

  resetCanvasCursor() {
    const canvas = this.spriteService.getCanvas();
    if (!canvas) return;
    canvas.style.cursor = `url("assets/cursor/cursor.png") 16 16, auto`;
  }
}