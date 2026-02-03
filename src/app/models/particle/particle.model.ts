import { Collider } from "../entity/collider.model";
import { Entity } from "../entity/entity.model";
import { Physics } from "../entity/physics.model";

// Setear el tipo de comportamientos
type ParticleBehavior = (p: Particle, delta: number) => void;

export interface Particle extends Entity, Partial<Physics>, Partial<Collider> {
  timeToLife: number;
  maxTimeToLife: number;
  // Comportamiento
  behaviors?: ParticleBehavior[];
}
