import { Injectable } from '@angular/core';
import { User } from '../../models/player/player-data.model';
import { UserManagerService } from './user-manager.service';
import { EntityStoreService } from '../entity-store.service';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private ws!: WebSocket;
  private url: string = 'eagle-uni-apartment-which.trycloudflare.com';

  status: boolean = false;

  private readonly user: User = {
    name: 'Mokito Friend',
    userId: null,
    cursor: null,
    pet: null,
  };

  dataUsers: User[] = [];

  constructor(
    private readonly userManagerService: UserManagerService,
    private readonly entityStoreService: EntityStoreService,
  ) {
    this.user = this.userManagerService.getClientUser();
  }

  setUrl(url: string) {
    this.url = url;
  }

  getUrl(): string {
    return this.url;
  }

  // obetener los usuarios de la sala
  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`https://${this.url}/user/all`);

    if (!res.ok) throw new Error(`Error ${res.status}`);

    return res.json() as Promise<User[]>;
  }

  async connect() {
    try {
      const res = await fetch(`https://${this.url}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.user.name }),
      });

      const data = await res.json();
      this.user.userId = data.userId;

      this.userManagerService.setStatus(true);
      this.userManagerService.setUser(this.user);

      this.ws = new WebSocket(`wss://${this.url}/`);

      this.ws.onopen = () => {
        this.status = true;
        this.ws.send(
          JSON.stringify({
            type: 'init',
            user: this.user,
          }),
        );
      };

      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'init_state':
            this.userManagerService.setUsers(msg);
            break;

          case 'user_data':
            console.log(msg);
            this.dataUsers.push(msg.user);
            break;
        }
      };

      this.ws.onclose = () => {
        this.userManagerService.setStatus(false);
        this.status = false;
      };
    } catch (e) {
      console.error('Error de conexión', e);
    }
  }

  // Mide el ping al servidor
  async ping(): Promise<number> {
    const start = Date.now();
    const res = await fetch(`https://${this.url}/user/ping`);
    if (!res.ok) throw new Error(`Ping failed: ${res.status}`);
    return Date.now() - start;
  }

  sendUser(user: User) {
    if (this.ws?.readyState !== 1) return;

    const payload = {
      type: 'user_data',
      userId: this.user.userId,
      payload: { user },
    };
    this.ws.send(JSON.stringify(payload));
  }

  sendAccumulator: number = 0;
  NETWORK_TICK_MS: number = 50;

  update(deltaTime: number) {
    // Vaciar la cola este frame
    while (this.dataUsers.length > 0) {
      const msg = this.dataUsers.shift();
      if (!msg) {
        return;
      }
      this.applyUserData(msg);
    }

    // Envío por network tick
    this.sendAccumulator += deltaTime;
    if (this.sendAccumulator >= this.NETWORK_TICK_MS) {
      this.sendUser(this.user);
      this.sendAccumulator = 0;
    }
  }

  applyUserData(msg: User) {
    console.log(msg);
    if (!msg?.userId) return;

    // No aplicar datos propios
    if (msg.userId === this.user.userId) return;

    const existing = this.userManagerService.getUserById(msg.userId);

    if (existing) {
      existing.cursor = msg.cursor;

      const entity = this.userManagerService.getCursorEntityByUserId(msg.userId);
      if (entity && msg.cursor) {
        entity.sprite.x = msg.cursor.x;
        entity.sprite.y = msg.cursor.y;

        if (entity.sprite.img.src !== msg.cursor.src) {
          entity.sprite.img = new Image();
          entity.sprite.img.src = msg.cursor.src;
        }
      }
    } else {
      // Usuario nuevo, añadirlo
      this.userManagerService.addUser(msg);
    }
  }
}
