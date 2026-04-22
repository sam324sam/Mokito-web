import { AnimationSprite } from './animation-sprite.model';
import { Color } from './color.model';

export interface Sprite {
  x: number;
  y: number;
  width: number;
  height: number;
  // luego lo pongo con su interface
  spriteScale: number;
  canvasScale: number;
  totalScale: number;
  // imagen base
  img: HTMLImageElement;
  color: Color | null;
  alpha: number;
  animationSprite: Record<string, AnimationSprite>;

  // índice de animación
  currentAnimation: string;
  // frame actual
  currentFrame: number;
  // velocidad
  frameSpeed: number;
  // contador interno
  frameCounter: number;

  // para el temporizador de cambiar a animacion idle
  timeoutId: number | null;
  // Para diferenciar que objetos van encima de otros
  zIndex: number;
  // Si lo imagen rota
  rotation: number | null;
}
