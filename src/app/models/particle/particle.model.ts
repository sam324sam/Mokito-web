import { Color } from '../sprites/color.model';

// Setear el tipo
type ParticleBehavior = (p: Particle, delta: number) => void;

export interface Particle {
  x: number;
  y: number;
  timeToLife: number;
  maxTimeToLife: number;
  // Para ver a donde se mueve.
  vx: number;
  vy: number;
  size: number;
  // textura
  img: HTMLImageElement;
  // Comportamiento
  behaviors?: ParticleBehavior[];
}
