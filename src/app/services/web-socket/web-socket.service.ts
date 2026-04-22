import { Injectable } from '@angular/core';

import { UserManagerService } from './user-manager.service';

import { User } from '../../models/player/player-data.model';
import { Entity } from '../../models/entity/entity.model';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private ws!: WebSocket;
  private url: string = 'instead-consulting-might-vessels.trycloudflare.com';

  status: boolean = false;

  sendAccumulator: number = 0;
  NETWORK_TICK_MS: number = 10;

  private readonly user: User = {
    name: 'Mokito Friend',
    userId: null,
    cursor: null,
    pet: null,
    canvas: { width: 0, height: 0 },
  };

  dataUsers: User[] = [];

  constructor(private readonly userManagerService: UserManagerService) {
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
        console.log('mensaje', msg);
        switch (msg.type) {
          case 'init_state':
            this.userManagerService.setUsers(msg);
            break;

          case 'user_data':
            this.dataUsers.push(msg.user);
            break;

          case 'user_remove':
            this.userManagerService.removeUser(msg.userId);
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

  update(deltaTime: number) {
    // Vaciar la cola este frame
    while (this.dataUsers.length > 0) {
      const msg = this.dataUsers.shift();
      if (!msg) {
        return;
      }
      this.applyUserData(msg);
    }

    // Envio por network tick
    this.sendAccumulator += deltaTime;
    if (this.sendAccumulator >= this.NETWORK_TICK_MS) {
      this.sendUser(this.user);
      this.sendAccumulator = 0;
    }
  }

  applyUserData(msg: User) {
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
      // Usuario nuevo añadirlo
      this.userManagerService.addUser(msg);
    }
  }

  lerpEntity(entity: Entity, targetX: number, targetY: number, smoothing: number = 0.8): void {
    entity.sprite.x += (targetX - entity.sprite.x) * smoothing;
    entity.sprite.y += (targetY - entity.sprite.y) * smoothing;
  }

  /**
   * Regla de tres para que se pueda ver los mouses en el mismo sitio apesar de tener distintas resoluciones
   */
  ajustLocationCanvas(msg: User): { localX: number; localY: number } {
    let localX = 0;
    let localY = 0;
    if (msg.cursor && msg.canvas) {
      const localCanvas = this.userManagerService.getClientUser().canvas;
      const scaleX = localCanvas.width / msg.canvas.width;
      const scaleY = localCanvas.height / msg.canvas.height;

      localX = msg.cursor.x * scaleX;
      localY = msg.cursor.y * scaleY;
    }
    return { localX, localY };
  }
}
