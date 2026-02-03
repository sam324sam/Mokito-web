import { Injectable } from '@angular/core';
// Servicios que usen los loops
import { PetService } from './pet/pet.service';
import { SpriteService } from './sprites.service';
import { AnimationService } from './animation.service';
import { ParticleService } from './particle.service';
import { PhysicsService } from './physics.service';
import { InteractableObjectsService } from './interactable-objects/interactable-objects.service';

@Injectable({
  providedIn: 'root',
})
export class GameLoopService {
  private lastTime = 0;
  private running = false;
  // Para el loop
  private frameId: number | null = null;

  constructor(
    private readonly petService: PetService,
    private readonly spriteService: SpriteService,
    private readonly animationService: AnimationService,
    private readonly particleService: ParticleService,
    private readonly interactableObjectsService: InteractableObjectsService,
    private readonly physicsService: PhysicsService,
  ) {}

  start() {
    // Evitar el doble loop
    if (this.running) stop();
    this.running = true;
    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
    // Cancelar lo que se este ejecutando en ese momento
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    // resetear para el delta al restablecer el servicio
    this.lastTime = 0;
  }

  private loop(time: number) {
    if (!this.running) return;

    let delta = time - this.lastTime;
    this.lastTime = time;
    // capar el delta para que no se pase de 100ms
    delta = Math.min(delta, 100);

    this.update(delta);
    this.render();

    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }

  private update(delta: number) {
    this.animationService.update(delta);
    this.petService.update(delta);
    this.interactableObjectsService.update(delta);
    this.particleService.update(delta);
    this.physicsService.update(delta);
  }

  private render() {
    this.spriteService.render();
  }
}
