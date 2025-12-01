import { Injectable } from '@angular/core';
// Servicios que usen los loops
import { CollisionService } from './collision.service';
import { PetService } from './pet.service';
import { SpriteService } from './sprites.service';
import { AnimationService } from './animation.service';
@Injectable({
  providedIn: 'root',
})
export class GameLoopService {
  private lastTime = 0;
  private running = false;

  constructor(
    private readonly petService: PetService,
    private readonly collisionService: CollisionService,
    private readonly spriteService: SpriteService,
    private readonly animationService: AnimationService
  ) {}

  start() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(this.loop.bind(this));
  }

  private loop(time: number) {
    if (!this.running) return;

    const delta = time - this.lastTime;
    this.lastTime = time;

    this.update(delta);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  private update(delta: number) {
    this.animationService.update(delta);
    this.petService.update();
  }

  private render() {
    this.spriteService.render();
  }
}
