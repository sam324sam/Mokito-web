import { Injectable } from '@angular/core';
import { User } from '../../models/player/player-data.model';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private ws!: WebSocket;
  private url: string = 'gallery-flashers-unlike-mime.trycloudflare.com';

  status: boolean = false;

  private readonly user: User = {
    name: 'Mokito Friend',
    userId: null,
    cursor: null,
  };

  setUrl(url: string) {
    this.url = url;
  }

  setUserName(name: string) {
    this.user.name = name;
  }

  getUser(): User {
    return this.user;
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
      // Pide un id
      const res = await fetch(`https://${this.url}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.user.name }),
      });

      const data = await res.json();
      this.user.userId = data.userId;

      // se conecta con el websocket
      this.ws = new WebSocket(`wss://${this.url}/`);

      this.ws.onopen = () => {
        this.ws.send(
          JSON.stringify({
            type: 'init',
            userId: this.user.userId,
            name: this.user.name,
          }),
        );
      };

      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        this.onMessage?.(msg);
      };
      this.status = true;
    } catch (e) {
      console.error('Error de conexión', e);
    }
  }

  sendCursor(x: number, y: number) {
    if (this.ws?.readyState !== 1) return;

    const payload = {
      type: 'cursor_move',
      payload: { x, y },
    };

    this.ws.send(JSON.stringify(payload));
  }

  onMessage?: (data: any) => void;
}
