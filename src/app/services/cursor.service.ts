import { HostListener, Injectable } from '@angular/core';
import { SpriteService } from './sprites.service';
import { Cursor, User } from '../models/player/player-data.model';
import { UserManagerService } from './web-socket/user-manager.service';

@Injectable({ providedIn: 'root' })
export class CursorService {
  cursor: Cursor = { x: 0, y: 0, src: 'assets/img/cursor/cursor.png' };

  private readonly user: User = {
    name: '',
    userId: null,
    cursor: null,
    pet: null,
    canvas: { width: 0, height: 0 },
  };
  private canvas!: HTMLCanvasElement;
  constructor(
    private readonly spriteService: SpriteService,
    private readonly userManagerService: UserManagerService,
  ) {
    this.user = this.userManagerService.getClientUser();
    setTimeout(() => {
      this.canvas = this.spriteService.getCanvas();
    });
  }

  setCanvasCursor(url: string) {
    if (!this.canvas) return;
    this.canvas.style.cursor = `url("${url}") 16 16, auto`;
    this.cursor.src = url;
  }

  handleMouseMove(event: PointerEvent): void {
    if (!this.userManagerService.getStatus()) return;

    const canvas = this.canvas;
    if (!canvas) return;

    const { x, y } = this.getMousePos(event);

    this.cursor.x = x;
    this.cursor.y = y;

    this.userManagerService.setCursor(this.cursor);
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
    this.cursor.src = 'assets/img/cursor/cursor.png';
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
