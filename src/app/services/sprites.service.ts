import { Injectable } from '@angular/core';
// Modelos
import { Sprite } from '../models/sprites/sprites.model';
// Servicios
import { AnimationService } from './animation.service';
import { EntityStoreService } from './entity-store.service';
import { hasCollider } from '../guards/has-collider.guard';

@Injectable({ providedIn: 'root' })
export class SpriteService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  // Resolución lógica fija
  private readonly BASE_WIDTH = 200;
  private readonly BASE_HEIGHT = 200;
  spriteScale = 6;
  debugColliders: boolean = false;

  constructor(
    private readonly animationService: AnimationService,
    private readonly entityStoreService: EntityStoreService,
  ) {}

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    // Tamaño logico fijo
    this.canvas.width = this.BASE_WIDTH;
    this.canvas.height = this.BASE_HEIGHT;

    // Ajuste inicial
    this.resizeCanvas();

    // Ajustar automáticamente al cambiar tamaño del contenedor
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    if (!container) return;

    const w = container.offsetWidth;

    if (w <= 360) {
      this.spriteScale = 2;
    } else if (w <= 500) {
      this.spriteScale = 3;
    } else if (w <= 768) {
      this.spriteScale = 4;
    } else {
      this.spriteScale = 5;
    }

    this.ctx.imageSmoothingEnabled = false;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const entities = this.entityStoreService.getAllEntities();

    for (const e of entities) {
      const sprite: Sprite = e.sprite;
      sprite.scale = this.spriteScale;

      const frame = this.animationService.getFrame(sprite) ?? sprite.img;
      if (!frame) continue;

      this.ctx.save();
      this.limitToCanvas(sprite);
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.globalAlpha = sprite.alpha / 100;
      if (
        frame instanceof HTMLImageElement &&
        frame.complete &&
        frame.naturalWidth > 0 &&
        frame.naturalHeight > 0 &&
        Number.isFinite(sprite.x) &&
        Number.isFinite(sprite.y) &&
        Number.isFinite(sprite.width) &&
        Number.isFinite(sprite.height)
      ) {
        this.ctx.drawImage(
          frame,
          sprite.x,
          sprite.y,
          sprite.width * this.spriteScale,
          sprite.height * this.spriteScale,
        );
      }

      if (sprite.color) {
        this.ctx.globalCompositeOperation = 'source-atop';
        this.ctx.fillStyle = sprite.color.color;
        this.ctx.fillRect(
          sprite.x,
          sprite.y,
          sprite.width * this.spriteScale,
          sprite.height * this.spriteScale,
        );
      }

      this.ctx.restore();
    }
    // Dibujar colliders solo si esta activado
    if (this.debugColliders) {
      this.renderColliders();
    }
  }
  /**
   * Renderiza los colliders de todas las entidades para depuracion
   */
  private renderColliders() {
    if (!this.ctx) return;

    const entities = this.entityStoreService.getAllEntities();
    this.ctx.save();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 1;

    for (const e of entities) {
      if (!hasCollider(e)) continue;

      const c = e.collider;
      const s = e.sprite.scale ?? 1;
      const x = e.sprite.x + c.offsetX * s;
      const y = e.sprite.y + c.offsetY * s;
      const w = c.width * s;
      const h = c.height * s;

      this.ctx.strokeRect(x, y, w, h);
    }

    this.ctx.restore();
  }

  limitToCanvas(sprite: Sprite) {
    const realWidth = sprite.width * this.spriteScale;
    const realHeight = sprite.height * this.spriteScale;

    // Convertir limites reales a coordenadas internas del canvas
    const maxX = this.canvas.width - realWidth;
    const maxY = this.canvas.height - realHeight;

    // Limitar dentro del canvas interno
    if (sprite.x < 0) sprite.x = 0;
    if (sprite.y < 0) sprite.y = 0;

    if (sprite.x > maxX) sprite.x = maxX;
    if (sprite.y > maxY) sprite.y = maxY;
  }

  getCanvas() {
    return this.canvas;
  }

  getScale() {
    return this.spriteScale;
  }
}
