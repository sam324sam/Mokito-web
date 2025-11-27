// sprite.service.ts
import { Injectable } from '@angular/core';
// modelo
import { Sprite } from '../models/sprites/sprites.model';
// Servicios
import { CollisionService } from './collision.service';

@Injectable({ providedIn: 'root' })
export class SpriteService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private readonly sprites: Sprite[] = [];
  private animationId: number | null = null;
  private scaleSprite: number = 1;
  private readonly referenceWidth: number = 200;

  // sacado de la web para que esto no explote
  fps: number = 60;
  interval: number = 1000 / this.fps;
  lastTime: number = 0;

  constructor(private readonly collisionService: CollisionService) {}

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Desactivar suavizado para pixel art
    this.ctx.imageSmoothingEnabled = false;

    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.imageRendering = '-moz-crisp-edges';
    this.canvas.style.imageRendering = 'crisp-edges';

    // Ajustar tamaño inicial
    this.resizeCanvas();

    // Escuchar cambios de ventana para mantener responsive
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    if (!this.canvas) return;

    // Obtener tamaño del contenedor
    const rect = this.canvas.getBoundingClientRect();

    // enteros para evitar blur
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    // Establecer tamaño interno del canvas (sin DPR por ahora)
    this.canvas.width = width;
    this.canvas.height = height;

    // Aplicar estilos CSS para pixel-perfect se me acaban las ideas
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.canvas.style.imageRendering = 'pixelated';

    // Desactivar suavizado en el contexto
    this.ctx.imageSmoothingEnabled = false;

    // Calcular escala
    this.scaleSprite = width / this.referenceWidth;
  }

  addSprite(sprite: any) {
    this.sprites.push(sprite);
  }

  start() {
    // Calculos maquiavelos que se me escapan de mi comprension honestamente
    const loop = (time: number) => {
      const delta = time - this.lastTime;

      if (delta >= this.interval) {
        this.lastTime = time - (delta % this.interval);
        this.update();
      }

      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // para la ia de la pet

    for (const sprite of this.sprites) {
      this.updateAnimation(sprite);

      const frame = sprite.animationSprite[sprite.currentAnimation].frameImg[sprite.currentFrame];

      this.limitToCanvas(sprite);

      // Calcular coordenadas y tamaño escalado una sola vez
      const x = sprite.x * this.scaleSprite;
      const y = sprite.y * this.scaleSprite;
      const w = sprite.width * this.scaleSprite;
      const h = sprite.height * this.scaleSprite;

      // Dibujar sprite
      this.ctx.drawImage(frame, x, y, w, h);

      // Aplicar tinte si existe color
      if (sprite.color) {
        this.ctx.globalCompositeOperation = 'source-atop';
        this.ctx.fillStyle = sprite.color.color;
        this.ctx.fillRect(x, y, w, h); // <-- AHORA coincide con la imagen
        this.ctx.globalCompositeOperation = 'source-over';
      }
    }
  }

  private updateAnimation(sprite: Sprite) {
    sprite.frameCounter++;

    if (sprite.frameCounter >= sprite.frameSpeed) {
      sprite.frameCounter = 0;

      sprite.currentFrame++;

      const totalFrames = sprite.animationSprite[sprite.currentAnimation].frameImg.length;

      if (sprite.currentFrame >= totalFrames) {
        // loop
        sprite.currentFrame = 0;
      }
    }
  }

  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
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

  // Duracion de la animacion en segundos
  getAnimationDuration(sprite: Sprite): number {
    const totalFrames = sprite.animationSprite[sprite.currentAnimation].frameImg.length;
    const frameSpeed = sprite.frameSpeed;
    const fps = this.fps;
    // segundos (Luego paso a mili o alkgo)
    return (totalFrames * frameSpeed) / fps;
  }
  // Duracion de la animacion en frames
  getAnimationDurationFrames(sprite: Sprite, animationName: string): number {
    const anim = sprite.animationSprite[animationName];
    if (!anim) return 0;

    const totalFrames = anim.frameImg.length;
    const frameSpeed = sprite.frameSpeed;
    // frames
    return totalFrames * frameSpeed;
  }

  // para los click dentro del canva
  changesAnimationClick(event: MouseEvent, animationId: string, endAnimationId: string = 'idle') {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();

    // Convertir click a coordenadas internas del canvas (Escalar me quita años de vida)
    const x = (event.clientX - rect.left) / this.scaleSprite;
    const y = (event.clientY - rect.top) / this.scaleSprite;

    for (const sprite of this.sprites) {
      // Para que no se sobreponga la misma animacion
      if (animationId === sprite.currentAnimation) return;

      // collisionService debe trabajar en coordenadas internas
      if (this.collisionService.isPointInsideSprite(sprite, x, y)) {
        // Cambiar a la animacion clickeada
        sprite.currentAnimation = animationId;
        sprite.currentFrame = 0;

        // Calcular cuánto durará
        const duration = this.getAnimationDuration(sprite);

        // Volver automaticamente a otra animacion (idle por defecto)
        if (sprite.animationSprite[animationId].animationType == 'once') {
          sprite.timeoutId = setTimeout(() => {
            sprite.currentAnimation = endAnimationId;
            sprite.currentFrame = 0;
            sprite.timeoutId = null;
          }, duration * 1000);
        }
      }
    }
  }
}
