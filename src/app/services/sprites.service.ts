import { Injectable } from '@angular/core';
// Modelos
import { Sprite } from '../models/sprites/sprites.model';
// Servicios
import { AnimationService } from './animation.service';
import { EntityStoreService } from './entity-store.service';
import { Entity } from '../models/entity/entity.model';
import { isMessage } from '../guards/is-mesage.guard';

@Injectable({ providedIn: 'root' })
export class SpriteService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  // Resolución lógica fija
  private readonly BASE_WIDTH = 200;
  private readonly BASE_HEIGHT = 200;
  spriteScale = 6;
  debugColliders: boolean = true;

  constructor(
    private readonly animationService: AnimationService,
    private readonly entityStoreService: EntityStoreService,
  ) {}

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    // se puede ejecutar lo que sea para setear el canva a dibujar luego cambiar nombre a set o algo

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

  resizeCanvas(): void {
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

  render(): void {
    try {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (const e of this.entityStoreService.getZOrder()) {
        this.limitToCanvas(e.sprite);
        if (isMessage(e)) {
          this.renderText(e);
          continue;
        }

        if (e.sprite.rotation == null) {
          this.renderEntity(e);
        } else {
          this.renderRotateSprite(e.sprite);
        }
      }

      if (this.debugColliders) {
        this.renderColliders();
      }
    } catch (error) {
      console.log('Error al renderizar en sprite service', error);
    }
  }

  /**
   * Renderiza las entidades no especiales
   * @param entity
   */
  private renderEntity(entity: Entity): void {
    const sprite: Sprite = entity.sprite;

    sprite.scale = this.spriteScale;

    const animation = this.animationService.getAnimation(sprite);

    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.globalAlpha = sprite.alpha / 100;
    if (animation?.image.complete) {
      const frameIndex = sprite.currentFrame;
      // mueve la casilla en la se encuentra el fotograma a ver
      const sx = frameIndex * animation.frameWidth;
      const sy = 0;

      this.ctx.drawImage(
        animation.image,
        sx,
        sy,
        animation.frameWidth,
        animation.frameHeight,
        sprite.x,
        sprite.y,
        animation.frameWidth * this.spriteScale,
        animation.frameHeight * this.spriteScale,
      );
    } else if (sprite.img) {
      this.ctx.drawImage(
        sprite.img,
        sprite.x,
        sprite.y,
        sprite.width * this.spriteScale,
        sprite.height * this.spriteScale,
      );
    }
    this.applyColorOverlay(sprite);
    this.ctx.restore();
  }

  /**
   * Aplica un color solido encima del sprite si tiene color definido
   */
  private applyColorOverlay(sprite: Sprite) {
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
  }

  /**
   * Renderiza los objetos que se estan rotando. ( aun no va si el sprite contiene un animation set)
   */
  private renderRotateSprite(sprite: Sprite): void {
    if (sprite.rotation == null) return;
    const frame = sprite.img;
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.globalAlpha = sprite.alpha / 100;
    const width = sprite.width * this.spriteScale;
    const height = sprite.height * this.spriteScale;
    // Mover el origen al centro del sprite
    this.ctx.translate(sprite.x + width / 2, sprite.y + height / 2);
    this.ctx.rotate(sprite.rotation);

    if (
      frame instanceof HTMLImageElement &&
      frame.complete &&
      frame.naturalWidth > 0 &&
      frame.naturalHeight > 0 &&
      Number.isFinite(sprite.width) &&
      Number.isFinite(sprite.height)
    ) {
      // Dibujar centrado
      this.ctx.drawImage(frame, -width / 2, -height / 2, width, height);
    }
    this.ctx.restore();
  }

  /**
   * Renderiza los colliders de todas las entidades para depuracion
   */
  private renderColliders(): void {
    if (!this.ctx) return;

    const entities = this.entityStoreService.getZOrder();
    this.ctx.save();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 1;

    for (const e of entities) {
      if (!e.collider) continue;

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

  /**
   * Renderizar si la entidad es tipo mensaje
   */
  private renderText(message: Entity): void {
    if (!isMessage(message)) return;
    this.ctx.save();
    const scale = this.spriteScale;
    const padding = 4 * scale;

    this.ctx.globalAlpha = message.sprite.alpha / 100;

    this.ctx.font = `${10 * scale}px EmojiFont`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const text = message.body;
    const metrics = this.ctx.measureText(text);

    const textWidth = metrics.width;
    const textHeight = 10 * scale;

    const boxWidth = textWidth + padding * 2;
    const boxHeight = textHeight + padding * 2;

    const x = message.sprite.x;
    const y = message.sprite.y;

    // sprite y si no tiene lo carga con fondo blanco pitero
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight);

    // Dibujar texto negro encima
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(text, x, y);

    this.ctx.restore();
  }

  limitToCanvas(sprite: Sprite): void {
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
