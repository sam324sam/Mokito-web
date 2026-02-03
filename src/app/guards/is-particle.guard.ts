import { Particle } from "../models/particle/particle.model";

export function isParticle(e: any): e is Particle {
  return 'maxTimeToLife' in e && 'timeToLife' in e;
}