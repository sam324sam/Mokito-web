import { Injectable } from '@angular/core';

import { Cursor, User } from '../../models/player/player-data.model';
import { Entity } from '../../models/entity/entity.model';
import { EntityStoreService } from '../entity-store.service';
@Injectable({
  providedIn: 'root',
})
export class UserManagerService {
  private status = false;

  private readonly cursorEntitys: Record<string, Entity> = {};

  private user: User = {
    name: 'Mokito Friend',
    userId: null,
    cursor: null,
    pet: null,
  };

  private users: Map<string, User> = new Map();

  constructor(private readonly entityStoreService: EntityStoreService) {}

  setUser(user: User) {
    this.user = user;
  }

  setUserName(name: string) {
    this.user.name = name;
  }

  getClientUser(): User {
    return this.user;
  }
  setStatus(status: boolean) {
    this.status = status;
  }

  getStatus(): boolean {
    return this.status;
  }

  getUserById(userId: string): User | undefined {
    return this.users.get(userId);
  }

  setCursor(cursor: Cursor) {
    this.user.cursor = cursor;
  }

  setUsers(users: Map<string, User>) {
    this.users = users;
  }

  getUsers(): Map<string, User> {
    return this.users;
  }

  addUser(user: User): Entity {
    let entity: Entity = {} as Entity;
    try {
      console.log('Añadir usuario', user);
      if (user.cursor && user.userId) {
        this.users.set(user.userId, user);
        const newImage = new Image();
        newImage.src = user.cursor.src || 'assets/img/cursor/cursor.png';
        const entity: Entity = {
          id: null,
          name: `cursor_${user.userId}`,
          active: true,
          tags: ['cursor', 'remote'],
          sprite: {
            img: newImage,
            x: user.cursor.x,
            y: user.cursor.y,
            width: 32,
            height: 32,
            scale: 0,
            color: null,
            alpha: 100,
            currentAnimation: '',
            currentFrame: 0,
            frameSpeed: 0,
            frameCounter: 0,
            timeoutId: null,
            rotation: null,
            animationSprite: {},
            zIndex: 1000,
          },
        };
        this.entityStoreService.addEntity(entity);
        this.cursorEntitys[user.userId] = entity;
      }
    } catch (error) {
      console.log(error);
    }
    return entity;
  }
  removeUser(userId: string) {
    this.users.delete(userId);
  }
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getCursorEntityByUserId(userId: string): Entity {
    return this.cursorEntitys[userId];
  }
}
