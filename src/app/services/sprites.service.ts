import { Injectable } from '@angular/core';
// Modelos
import { Sprite } from '../models/sprites/sprites.model';
// Servicios
import { AnimationService } from './animation.service';
import { EntityStoreService } from './entity-store.service';  

@Injectable({ providedIn: 'root' })
export class SpriteService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  // Resolución lógica fija
  private readonly BASE_WIDTH = 200;
  private readonly BASE_HEIGHT = 200;
  spriteScale = 4;

  constructor(private readonly animationService: AnimationService, private readonly entityStoreService:EntityStoreService) {}

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    // Tamaño lógico fijo
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

    console.log('resolucion', container.offsetWidth);
    if (container.offsetWidth <= 500) {
      this.spriteScale = 2;
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

      this.ctx.drawImage(
        frame,
        sprite.x,
        sprite.y,
        sprite.width * this.spriteScale,
        sprite.height * this.spriteScale
      );

      if (sprite.color) {
        this.ctx.globalCompositeOperation = 'source-atop';
        this.ctx.fillStyle = sprite.color.color;
        this.ctx.fillRect(
          sprite.x,
          sprite.y,
          sprite.width * this.spriteScale,
          sprite.height * this.spriteScale
        );
      }

      this.ctx.restore();
    }
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
}
