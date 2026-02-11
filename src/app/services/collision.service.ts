import { Injectable } from '@angular/core';
// model
import { Sprite } from '../models/sprites/sprites.model';
import { Entity } from '../models/entity/entity.model';
// Guards
import { hasCollider } from '../guards/has-collider.guard';
import { hasPhysics } from '../guards/has-physics.guard';
// servicios
import { PetObjectInteractionService } from './interactable-objects/pet-object-interaction.service';
import { ParticleInteractionService } from './particle/particle-interaction.service';

@Injectable({ providedIn: 'root' })
export class CollisionService {
  constructor(
    private readonly petObjectInteractionService: PetObjectInteractionService,
    private readonly particleInteractionService: ParticleInteractionService,
  ) {}

  /**
   * Detecta si un punto esta dentro de un sprite
   */
  isPointInsideSprite(sprite: Sprite, x: number, y: number): boolean {
    const sx = sprite.x;
    const sy = sprite.y;
    const sw = sprite.width;
    const sh = sprite.height;

    const isInside = x >= sx && x <= sx + sw && y >= sy && y <= sy + sh;

    return isInside;
  }

  /**
   * Detecta si dos entidades estan colisionando
   */
  areColliding(a: Entity, b: Entity): boolean {
    if (!hasCollider(a) || !hasCollider(b)) return false;

    const colliderA = this.getColliderBounds(a) || null;
    const colliderB = this.getColliderBounds(b) || null;

    if (!colliderA || !colliderB) return false;

    return !(
      colliderA.x + colliderA.width < colliderB.x ||
      colliderA.x > colliderB.x + colliderB.width ||
      colliderA.y + colliderA.height < colliderB.y ||
      colliderA.y > colliderB.y + colliderB.height
    );
  }

  /**
   * Resuelve la colision entre dos entidades segun sus tags
   */
  resolve(a: Entity, b: Entity): void {
    // Pet y Object
    if (this.hasTag(a, 'pet') && this.hasTag(b, 'object')) {
      this.petObjectInteractionService.onPetTouchObject(a, b);
      return;
    }

    if (this.hasTag(b, 'pet') && this.hasTag(a, 'object')) {
      this.petObjectInteractionService.onPetTouchObject(b, a);
      return;
    }

    // Particle y Pet 
    if (
      (this.hasTag(a, 'particle') && this.hasTag(b, 'pet')) ||
      (this.hasTag(b, 'particle') && this.hasTag(a, 'pet'))
    ) {
      return; // No hacer nadota
    }

    // Particle y Object
    if (this.hasTag(a, 'particle') && this.hasTag(b, 'object')) {
      this.resolveParticleObjectCollision(a, b);
      return;
    }

    if (this.hasTag(b, 'particle') && this.hasTag(a, 'object')) {
      this.resolveParticleObjectCollision(b, a);
      return;
    }

    // Particle y Particle
    if (this.hasTag(a, 'particle') && this.hasTag(b, 'particle')) {
      this.particleInteractionService.resolve(a, b);
      return;
    }

    // Colision fisica por defecto
    this.resolvePhysicsCollision(a, b);
  }

  /**
   * Verifica si una entidad tiene un tag especifico
   */
  private hasTag(entity: Entity, tag: string): boolean {
    return entity.tags.includes(tag);
  }

  /**
   * Obtiene los limites del collider de una entidad
   */
  private getColliderBounds(entity: Entity) {
    if (!hasCollider(entity)) {
      return;
    }

    const sprite = entity.sprite;
    const collider = (entity as any).collider;
    const scale = sprite.scale ?? 1;

    return {
      x: sprite.x + collider.offsetX * scale,
      y: sprite.y + collider.offsetY * scale,
      width: collider.width * scale,
      height: collider.height * scale,
    };
  }

  /**
   * Calcula el overlap entre dos colliders
   */
  private calculateOverlap(
    a: { x: number; y: number; width: number; height: number } | null | undefined,
    b: { x: number; y: number; width: number; height: number } | null | undefined,
  ): { overlapX: number; overlapY: number } | null {
    if (!a || !b) return null;

    const overlapX = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
    const overlapY = Math.min(a.y + a.height - b.y, b.y + b.height - a.y);

    return { overlapX, overlapY };
  }

  /**
   * Resuelve la colision entre una particula y un objeto
   */
  private resolveParticleObjectCollision(particle: Entity, object: Entity): void {
    if (!hasCollider(particle) || !hasCollider(object) || !hasPhysics(particle)) {
      return;
    }

    const particleBounds = this.getColliderBounds(particle);
    const objectBounds = this.getColliderBounds(object);
    if (!particleBounds || !objectBounds) return;

    const overlap = this.calculateOverlap(particleBounds, objectBounds);

    if (!overlap) return;

    const { overlapX, overlapY } = overlap;
    if (overlapX <= 0 || overlapY <= 0) return;

    const restitution = 0.5;
    const sprite = particle.sprite;
    const physics = (particle as any).physics;

    // Resolver por el eje con menor penetracion
    if (overlapY < overlapX) {
      // Colision vertical
      if (particleBounds.y < objectBounds.y) {
        sprite.y -= overlapY;
      } else {
        sprite.y += overlapY;
      }
      physics.vy = -physics.vy * restitution;
    } else {
      // Colision horizontal
      if (particleBounds.x < objectBounds.x) {
        sprite.x -= overlapX;
      } else {
        sprite.x += overlapX;
      }
      physics.vx = -physics.vx * restitution;
    }
  }

  /**
   * Resuelve la colision fisica entre dos entidades con fisica
   */
  private resolvePhysicsCollision(a: Entity, b: Entity): void {
    if (!hasCollider(a) || !hasCollider(b) || !hasPhysics(a) || !hasPhysics(b)) {
      return;
    }

    const boundsA = this.getColliderBounds(a);
    const boundsB = this.getColliderBounds(b);
    if (!boundsA || !boundsB) return;

    const overlap = this.calculateOverlap(boundsA, boundsB);
    if (!overlap) return;

    const { overlapX, overlapY } = overlap;

    const restitution = 0.5;
    const physicsA = (a as any).physics;
    const physicsB = (b as any).physics;

    // Resolver por el eje con menor penetracion
    if (overlapY < overlapX) {
      // Colision vertical
      if (boundsA.y < boundsB.y) {
        a.sprite.y -= overlapY;
        physicsA.vy = -physicsA.vy * restitution;
      } else {
        b.sprite.y -= overlapY;
        physicsB.vy = -physicsB.vy * restitution;
      }
    } else {
      // Colision horizontal
      if (boundsA.x < boundsB.x) {
        a.sprite.x -= overlapX / 2;
        b.sprite.x += overlapX / 2;
      } else {
        a.sprite.x += overlapX / 2;
        b.sprite.x -= overlapX / 2;
      }
      physicsA.vx = -physicsA.vx * restitution;
      physicsB.vx = -physicsB.vx * restitution;
    }
  }
}
