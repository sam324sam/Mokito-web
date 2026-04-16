import { HostListener, Injectable } from '@angular/core';
import { SpriteService } from './sprites.service';
import { WebSocketService } from './multi/web-socket.service';
import { User } from '../models/player/player-data.model';
import { Entity } from '../models/entity/entity.model';
import { EntityStoreService } from './entity-store.service';

@Injectable({ providedIn: 'root' })
export class CursorService {
  cursors: Entity[] = [];
  private user: User = {} as User;
  constructor(
    private readonly spriteService: SpriteService,
    private readonly webSocketService: WebSocketService,
    private readonly entityStoreService: EntityStoreService,
  ) {
    this.user = this.webSocketService.getUser();
  }

  setCanvasCursor(url: string) {
    const canvas = this.spriteService.getCanvas();
    if (!canvas) return;
    canvas.style.cursor = `url("${url}") 16 16, auto`;
  }

  handleMouseMove(event: PointerEvent): void {
    if (this.webSocketService.status) {
      let { x, y } = this.getMousePos(event);
      if (!this.user.cursor) return;
      this.user.cursor.x = x;
      this.user.cursor.y = y;
      this.webSocketService.sendCursor(this.user.cursor);
    }
  }

  resetCanvasCursor() {
    const canvas = this.spriteService.getCanvas();
    if (!canvas) return;
    canvas.style.cursor = `url("assets/img/cursor/cursor.png") 16 16, auto`;
    if (!this.user.cursor) return;
    this.user.cursor.src = 'assets/img/cursor/cursor.png';
  }

  @HostListener('document:mousedown')
  onMouseDown() {
    document.body.style.cursor = `url("/assets/img/cursor/cursor-grab.png"), pointer`;
    if (!this.user.cursor) return;
    this.user.cursor.src = 'assets/img/cursor/cursor-grab.png';
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    document.body.style.cursor = `url("/assets/img/cursor/cursor.png"), pointer`;
    if (!this.user.cursor) return;
    this.user.cursor.src = 'assets/img/cursor/cursor.png';
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
