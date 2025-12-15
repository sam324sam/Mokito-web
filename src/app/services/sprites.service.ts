// sprite.service.ts
import { Injectable } from '@angular/core';
// modelo
import { Sprite } from '../models/sprites/sprites.model';
// Servicios
import { AnimationService } from './animation.service';

@Injectable({ providedIn: 'root' })
export class SpriteService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private readonly sprites: Sprite[] = [];
  private scaleSprite: number = 1;
  private referenceWidth: number = 300;

  constructor(
    private readonly animationService: AnimationService
  ) {}

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Desactivar suavizado para pixel art
    this.ctx.imageSmoothingEnabled = false;

    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.imageRendering = '-moz-crisp-edges';
    this.canvas.style.imageRendering = 'crisp-edges';
    // Desactivar suavizado en el contexto
    this.ctx.imageSmoothingEnabled = false;
    // Ajustar tamaño inicial
    this.resizeScaleCanvas(canvas);
  }

  resizeScaleCanvas(canvas: HTMLCanvasElement) {
    if (!this.canvas) return;

    // Obtener tamaño del contenedor
    const rect = this.canvas.getBoundingClientRect();

    // enteros para evitar blurthis.canvas.style.imageRendering = 'pixelated';
    const width = Math.floor(rect.width);
    if (width <= 500) {
      this.referenceWidth = 100;
    }

    // Calcular escala
    this.scaleSprite = width / this.referenceWidth;
  }

  addSprite(sprite: any) {
    this.sprites.push(sprite);
    this.animationService.addSprite(sprite);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const sprite of this.sprites) {
      const frame = this.animationService.getFrame(sprite);
      if (!frame) return;

      this.limitToCanvas(sprite);

      const x = sprite.x * this.scaleSprite;
      const y = sprite.y * this.scaleSprite;
      const w = sprite.width * this.scaleSprite;
      const h = sprite.height * this.scaleSprite;

      this.ctx.drawImage(frame, x, y, w, h);

      if (sprite.color) {
        this.ctx.globalCompositeOperation = 'source-atop';
        this.ctx.fillStyle = sprite.color.color;
        this.ctx.fillRect(x, y, w, h);
        this.ctx.globalCompositeOperation = 'source-over';
      }
    }
  }

  limitToCanvas(sprite: Sprite) {
    const realWidth = sprite.width * this.scaleSprite;
    const realHeight = sprite.height * this.scaleSprite;

    // Convertir limites reales a coordenadas internas del canvas
    const maxX = (this.canvas.width - realWidth) / this.scaleSprite;
    const maxY = (this.canvas.height - realHeight) / this.scaleSprite;

    // Limitar dentro del canvas interno
    if (sprite.x < 0) sprite.x = 0;
    if (sprite.y < 0) sprite.y = 0;

    if (sprite.x > maxX) sprite.x = maxX;
    if (sprite.y > maxY) sprite.y = maxY;
  }

  getScale() {
    return this.scaleSprite;
  }

  getCanvas() {
    return this.canvas;
  }
}
