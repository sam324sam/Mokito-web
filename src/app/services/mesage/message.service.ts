import { Injectable } from '@angular/core';
// Model
import { Message } from '../../models/message/message.model';
import { EntityStoreService } from '../entity-store.service';
import { Sprite } from '../../models/sprites/sprites.model';
@Injectable({ providedIn: 'root' })
export class MessageService {
  defaultMesage: Message = {
    id: 0,
    sprite: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      scale: 1,
      img: new Image(),
      color: null,
      alpha: 100,
      animationSprite: {},
      currentAnimation: '',
      currentFrame: 0,
      frameSpeed: 0,
      frameCounter: 0,
      timeoutId: null,
    },
    active: true,
    tags: ['message'],
    body: '',
    type: '',
    timeToLife: 4000,
    maxTimeToLife: 4000,
  };

  messages: Message[] = [];

  private messageCooldown: number = 0;
  private readonly cooldownTime: number = 10000;

  constructor(private readonly entityStoreService: EntityStoreService) {}

  addMessage(body: string, type: string, spriteTarget: Sprite, x: number, y: number): boolean {
    if (this.messageCooldown > 0) return false;
    this.messageCooldown = this.cooldownTime;

    const newMessage: Message = {
      ...this.defaultMesage,
      body,
      type,
      stickyTarget: {
        spriteTarget,
        offsetX: x,
        offsetY: y,
      },
      sprite: { ...this.defaultMesage.sprite, x, y },
    };

    this.messages.push(newMessage);
    this.entityStoreService.addEntity(newMessage);
    return true;
  }

  update(delta: number) {
    // Reducir cooldown
    if (this.messageCooldown > 0) {
      this.messageCooldown -= delta;
    }

    for (const m of this.messages) {
      if (!m.active) continue;
      m.timeToLife -= delta;
      if (m.timeToLife <= 0) {
        m.active = false;
        this.deleteMesage(m);
      }

      if (m.stickyTarget) {
        const target = m.stickyTarget.spriteTarget;
        m.sprite.x = target.x + target.width / 2;
        m.sprite.y = target.y - 10;
      }

      if (m.timeToLife <= m.maxTimeToLife / 2) {
        m.sprite.alpha = (m.timeToLife / (m.maxTimeToLife / 2)) * 100;
      }
    }
  }

  deleteMesage(message: Message) {
    if (message.id == null) return;
    this.entityStoreService.removeEntity(message.id);
    this.messages = this.messages.filter((activeObj) => activeObj.id !== message.id);
  }
}
