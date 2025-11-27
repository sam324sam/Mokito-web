import { Injectable } from '@angular/core';
//servicio

import { SpriteService } from './sprites.service';

@Injectable({ providedIn: 'root' })
export class CursorService {
  constructor(private readonly spriteService: SpriteService) {}
  init() {
    this.setDefaultCursor();
  }

  setDefaultCursor() {
    document.body.style.cursor = `url("assets/cursor/cursor.png") 32 32, auto`;
  }

  setPointerCursor(){
    document.body.style.cursor = `url("assets/cursor/cursor-pointer.png") 32 32, auto`;
  }

  setCursor(url: string) {
    document.body.style.cursor = `url("${url}") 32 32, auto`;
  }

  setCanvasCursor(url: string) {
    const canvas = this.spriteService.getCanvas();
    if (!canvas) return;
    canvas.style.cursor = `url("${url}") 16 16, auto`;
  }

  resetCanvasCursor() {
    const canvas = this.spriteService.getCanvas();
    if (!canvas) return;
    canvas.style.cursor = 'default';
  }
}
