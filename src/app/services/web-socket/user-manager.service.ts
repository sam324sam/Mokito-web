import { Injectable } from '@angular/core';

import { Cursor, User } from '../../models/player/player-data.model';
import { Entity } from '../../models/entity/entity.model';
import { SpriteService } from '../sprites.service';
import { CursorManagerService } from './cursor-manager.service';

@Injectable({
  providedIn: 'root',
})
export class UserManagerService {
  private status = false;

  private user: User = {
    name: 'Mokito Friend',
    userId: null,
    cursor: null,
    canvas: { width: 0, height: 0 },
  };

  private users: Map<string, User> = new Map();

  constructor(
    private readonly spriteService: SpriteService,
    private readonly cursorManagerService: CursorManagerService,
  ) {
    setTimeout(() => {
      const canvas = this.spriteService.getCanvas();
      this.user.canvas.width = canvas.width;
      this.user.canvas.height = canvas.height;
    });
  }

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

  addUser(user: User): Entity | null {
    if (!user.cursor || !user.userId) {
      console.warn('addUser: usuario sin cursor o userId', user);
      return null;
    }
    this.users.set(user.userId, user);
    return this.cursorManagerService.createCursorEntity(user);
  }

  removeUser(userId: string) {
    this.users.delete(userId);
    this.cursorManagerService.removeCursorEntity(userId);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getCursorEntityByUserId(userId: string): Entity {
    return this.cursorManagerService.getCursorEntityByUserId(userId);
  }
}
