import { Injectable } from '@angular/core';
import { Particle } from '../../models/particle/particle.model';

@Injectable({ providedIn: 'root' })
export class ParticleInteractionService {
  resolve(a: Particle, b: Particle) {
    const aTags = a.collider?.tags ?? [];
    const bTags = b.collider?.tags ?? [];

    if (
      (aTags.includes('bubles') && bTags.includes('water')) ||
      (bTags.includes('bubles') && aTags.includes('water'))
    ) {
      // Decide cuál desaparece, por ejemplo siempre la de tipo 'bubles'
      if (aTags.includes('bubles')) a.timeToLife = 0;
      if (bTags.includes('bubles')) b.timeToLife = 0;
    }
  }
}
