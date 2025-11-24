// sprite.service.ts
import { Injectable } from '@angular/core';
// modelo
import { Sprite } from '../models/sprites/sprites.model';

@Injectable({ providedIn: 'root' })
export class SpriteService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private readonly sprites: Sprite[] = [];
  private animationId: number | null = null;
  private scaleSprite: number = 2;
  private readonly referenceWidth: number = 120;

  // sacado de la web para que esto no explote
  fps: number = 60;
  interval: number = 1000 / this.fps;
  lastTime: number = 0;

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

    for (const sprite of this.sprites) {
      // avanzar animacion
      this.updateAnimation(sprite);

      // obtener el frame actual
      const frame = sprite.animationSprite[sprite.currentAnimation].frameImg[sprite.currentFrame];

      // dibujar frame actual
      this.ctx.drawImage(
        frame,
        sprite.x * this.scaleSprite,
        sprite.y * this.scaleSprite,
        sprite.width * this.scaleSprite,
        sprite.height * this.scaleSprite
      );
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

  getScale() {
    return this.scaleSprite;
  }

  getAnimationDuration(sprite: Sprite): number {
    const totalFrames = sprite.animationSprite[sprite.currentAnimation].frameImg.length;
    const frameSpeed = sprite.frameSpeed;
    const fps = this.fps;
    // segundos (Luego paso a mili o alkgo)
    return (totalFrames * frameSpeed) / fps;
  }

  // para los click dentro del canva
  changesAnimationClick(event: MouseEvent, animationId: string, endAnimationId: string = 'idle') {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const sprite of this.sprites) {
      const sx = sprite.x * this.scaleSprite;
      const sy = sprite.y * this.scaleSprite;
      const sw = sprite.width * this.scaleSprite;
      const sh = sprite.height * this.scaleSprite;

      // Para que no se sobreponga la misma animacion
      if (animationId == sprite.currentAnimation) return;

      if (x >= sx && x <= sx + sw && y >= sy && y <= sy + sh) {
        console.log('Sprite clickeado:', sprite);

        // Cambiar a la animacion clickeada
        sprite.currentAnimation = animationId;
        sprite.currentFrame = 0;

        // Calcular cuánto durará
        const duration = this.getAnimationDuration(sprite);

        // Volver automaticamente a otra animacion (idle por defecto) y ve el tipo para ejecutar mas o menos de una vez
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
