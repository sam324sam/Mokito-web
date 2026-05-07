import { Injectable } from '@angular/core';

import { UserManagerService } from './user-manager.service';
import { PetService } from '../pet/pet.service';

import { PetClient, User } from '../../models/player/player-data.model';
import { PetManagerService } from './pet-manager.service';
import { Pet } from '../../models/pet/pet.model';

import { ajustLocationCanvas } from './helpers/ajust-location-canva.helper';
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private ws!: WebSocket;
  private baseUrl: string = '';

  status: boolean = false;

  sendAccumulator: number = 0;
  NETWORK_TICK_MS: number = 10;

  runInLocalServer: boolean = false;

  private imagePetSent = false;

  private readonly user: User = {
    name: 'Mokito Friend',
    userId: null,
    cursor: null,
    canvas: { width: 0, height: 0 },
  };

  private petUser: Pet = {} as Pet;

  private readonly pendingUsers: Map<string, User> = new Map();

  private readonly candidates = ['http://localhost:8080', 'http://127.0.0.1:8080'];

  constructor(
    private readonly userManagerService: UserManagerService,
    private readonly petManagerService: PetManagerService,
    private readonly petService: PetService,
  ) {
    this.user = this.userManagerService.getClientUser();
    setTimeout(() => {
      this.petUser = this.petService.getPet();
    });
  }

  /**
  Conecta al servidor WebSocket y establece los manejadores de eventos
  */
  async connect() {
    try {
      const res = await fetch(`${this.httpUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.user.name }),
      });

      const data = await res.json();
      this.user.userId = data.userId;

      this.userManagerService.setStatus(true);
      this.userManagerService.setUser(this.user);

      if (this.candidates.includes(this.baseUrl)) {
        this.runInLocalServer = true;
      }

      this.ws = new WebSocket(`${this.wsUrl}/`);

      this.ws.onopen = () => {
        this.status = true;

        this.ws.send(
          JSON.stringify({
            type: 'init_full',
            user: this.user,
            pet: { x: 0, y: 0, userId: this.user.userId },
          }),
        );
      };

      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (!this.user.userId) return;

        switch (msg.type) {
          case 'user_data':
            this.pendingUsers.set(msg.user.userId, msg.user);
            break;

          case 'user_remove':
            this.userManagerService.removeUser(msg.userId);
            break;

          case 'move_pet':
            this.resolMovePet(msg.move_pet);
            break;

          case 'init_pet':
            if (msg.pet && msg.pet.userId !== this.user.userId) {
              this.petManagerService.createPetEntity(msg.pet, this.user.userId);
            }
            break;
        }
      };

      this.ws.onclose = () => {
        this.userManagerService.setStatus(false);
        this.status = false;
      };
    } catch (e) {
      console.error('Error de conexion', e);
    }
  }

  /**
   *  Devuelve la URL actual del servidor
   */
  get httpUrl(): string {
    return this.baseUrl;
  }

  get wsUrl(): string {
    if (this.runInLocalServer) {
      return this.baseUrl.replace(/^http/, 'ws');
    }
    return this.baseUrl.replace(/^http/, 'wss');
  }

  SetUrl(url: string) {
    if (url.startsWith('http')) {
      this.baseUrl = url;
    } else {
      this.baseUrl = `http://${url}`;
    }
  }

  /**
   * Obtiene todos los usuarios de la sala mediante HTTP
   */
  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`${this.httpUrl}/user/all`);

    if (!res.ok) throw new Error(`Error ${res.status}`);

    return res.json();
  }

  /**
   * Mide el ping al servidor y devuelve el tiempo en ms
   */
  async ping(): Promise<number> {
    const start = Date.now();

    const res = await fetch(`${this.httpUrl}/user/ping`);

    if (!res.ok) throw new Error(`Ping failed: ${res.status}`);

    return Date.now() - start;
  }

  /**
   * Envía los datos del usuario al servidor
   */
  sendUser(user: User) {
    if (this.ws?.readyState !== 1) return;

    const payload = {
      type: 'user_data',
      userId: this.user.userId,
      payload: { user },
    };
    this.ws.send(JSON.stringify(payload));
  }

  /**
   * Envia el movimiento de la mascota del usuario al servidor
   */
  sendPetMove(user: User) {
    if (this.ws?.readyState !== 1) return;
    const payload = {
      type: 'move_pet',
      payload: {
        move_pet: { x: this.petUser.sprite.x, y: this.petUser.sprite.y, userId: user.userId },
      },
    };
    this.ws.send(JSON.stringify(payload));
  }

  /**
   * Envia una notificacion de que se ha enviado la imagen de la mascota
   */
  sendUserImagePet() {
    if (this.imagePetSent) return;

    this.ws.send(
      JSON.stringify({
        type: 'user_pet_image',
        payload: {},
      }),
    );

    this.imagePetSent = true;
  }

  /**
   * Actualiza el estado cada frame: procesa datos recibidos y envía actualizaciones por tick
   */
  update(deltaTime: number) {
    for (const [, user] of this.pendingUsers) {
      this.applyUserData(user);
    }
    this.pendingUsers.clear();

    this.userManagerService.update(deltaTime);
    this.petManagerService.update(deltaTime);

    this.sendAccumulator += deltaTime;
    if (this.sendAccumulator >= this.NETWORK_TICK_MS) {
      this.sendUser(this.user);
      this.sendPetMove(this.user);
      this.sendAccumulator = 0;
    }
  }

  /**
   * Aplica los datos de un usuario recibidos al estado local
   */
  applyUserData(msg: User) {
    if (!msg?.userId || msg.userId === this.user.userId) return;

    const existing = this.userManagerService.getUserById(msg.userId);

    if (existing && msg.cursor) {
      let location: { x: number; y: number } = {
        x: msg.cursor.x,
        y: msg.cursor.y,
      };
      const { localX, localY } = ajustLocationCanvas(location, this.user.canvas, msg.canvas);
      this.userManagerService.updateUser(msg, localX, localY);
    } else {
      this.userManagerService.addUser(msg);
    }
  }

  /**
   * Convierte un Blob en una Promise de HTMLImageElement
   */
  private blobToImage(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };

      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Convierte un HTMLImageElement en una Promise de Blob (PNG)
   */
  private imageToBlob(img: HTMLImageElement): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
  }

  async detectServer(): Promise<boolean> {
    for (const base of this.candidates) {
      try {
        const res = await fetch(`${base}/user/ping`, {
          method: 'GET',
        });

        if (res.ok) {
          this.baseUrl = base;
          return true;
        }
      } catch (err) {
        console.log(`No se a encotrado servidor probando el siguiente ${err}`);
        return false;
      }
    }

    throw new Error('No local server found');
  }

  resolMovePet(petClient: PetClient) {
    let location: { x: number; y: number } = {
      x: petClient.x,
      y: petClient.y,
    };
    let canvasMsg = this.userManagerService.getCanvasUser(petClient.userId);
    if (!canvasMsg) {
      return;
    }
    if (!this.user.userId) {
      return;
    }
    const { localX, localY } = ajustLocationCanvas(location, this.user.canvas, canvasMsg);
    petClient.x = localX;
    petClient.y = localY;

    this.petManagerService.enqueuePetMove(petClient, this.user.userId);
  }
}
