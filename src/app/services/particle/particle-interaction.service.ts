import { Injectable } from '@angular/core';
import { Entity } from '../../models/entity/entity.model';
import { isParticle } from '../../guards/is-particle.guard';

// Servicios
import { PetService } from '../pet/pet.service';

@Injectable({ providedIn: 'root' })
export class ParticleInteractionService {

  constructor(private readonly petService: PetService){}

  resolve(a: Entity, b: Entity) {
    if (!isParticle(a) || !isParticle(b)) return;
    const aTags = a.tags;
    const bTags = b.tags;

    if (
      (aTags.includes('bubbles') && bTags.includes('water')) ||
      (bTags.includes('bubbles') && aTags.includes('water'))
    ) {
      // Decide cual desaparece, por ejemplo siempre la de tipo 'bubles'
      if (aTags.includes('bubbles')){
        a.timeToLife = 0;
      } 
      if (bTags.includes('bubbles')) {
        b.timeToLife = 0
      }
      this.petService.sumMinusStat('hygiene',5)
    }
  }
}
