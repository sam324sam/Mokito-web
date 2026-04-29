import { Injectable } from '@angular/core';

import { UserManagerService } from './user-manager.service';
import { PetService } from '../pet/pet.service';

import { User } from '../../models/player/player-data.model';
import { Entity } from '../../models/entity/entity.model';
import { PetManagerService } from './pet-manager.service';
import { Pet } from '../../models/pet/pet.model';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private ws!: WebSocket;
  private url: string = 'hire-exhibitions-begin-mounting.trycloudflare.com';

  status: boolean = false;

  sendAccumulator: number = 0;
  NETWORK_TICK_MS: number = 10;

  private imagePetSent = false;

  private readonly user: User = {
    name: 'Mokito Friend',
    userId: null,
    cursor: null,
    canvas: { width: 0, height: 0 },
  };

  private readonly petUser: Pet = {} as Pet;

  private readonly pendingUsers: Map<string, User> = new Map();

  constructor(
    private readonly userManagerService: UserManagerService,
    private readonly petManagerService: PetManagerService,
    private readonly petService: PetService,
  ) {
    this.user = this.userManagerService.getClientUser();
    this.petUser = this.petService.getPet();
  }

  /**
  Conecta al servidor WebSocket y establece los manejadores de eventos
  */
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
            type: 'init_full',
            user: this.user,
            pet: {
              x: 0,
              y: 0,
              userId: this.user.userId,
            },
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
            if (msg.pet_move && msg.pet_move.userId !== this.user.userId) {
              this.petManagerService.updatePet(msg.pet_move);
              console.log('pet', msg);
            }
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
  getUrl(): string {
    return this.url;
  }

  /**
   *  Establece una nueva URL para el servidor
   */
  setUrl(url: string) {
    this.url = url;
  }

  /**
   * Obtiene todos los usuarios de la sala mediante HTTP
   */
  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`https://${this.url}/user/all`);

    if (!res.ok) throw new Error(`Error ${res.status}`);

    return res.json() as Promise<User[]>;
  }

  /**
   * Mide el ping al servidor y devuelve el tiempo en ms
   */
  async ping(): Promise<number> {
    const start = Date.now();
    const res = await fetch(`https://${this.url}/user/ping`);
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
   * Envía el movimiento de la mascota del usuario al servidor
   */
  sendPetMove(user: User) {
    if (this.ws?.readyState !== 1) return;
    if (!this.petUser?.sprite) return;

    const payload = {
      type: 'move_pet',
      payload: {
        pet_move: { x: this.petUser.sprite.x, y: this.petUser.sprite.y, userId: user.userId },
      },
    };
    this.ws.send(JSON.stringify(payload));
  }

  /**
   * Envía una notificacion de que se ha enviado la imagen de la mascota
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

  /* Actualiza el estado cada frame: procesa datos recibidos y envía actualizaciones por tick*/
  update(deltaTime: number) {
    // Vaciar la cola este frame y actualizar los datos
    for (const [, user] of this.pendingUsers) {
      this.applyUserData(user, deltaTime);
    }
    this.pendingUsers.clear();

    // Envio por network tick
    this.sendAccumulator += deltaTime;
    if (this.sendAccumulator >= this.NETWORK_TICK_MS) {
      this.sendUser(this.user);
      this.sendPetMove(this.user);
      this.sendAccumulator = 0;
    }
  }

  /* Aplica los datos de un usuario recibidos al estado local*/
  applyUserData(msg: User, deltaTime: number) {
    if (!msg?.userId) return;

    if (msg.userId === this.user.userId) return;

    const existing = this.userManagerService.getUserById(msg.userId);

    if (existing) {
      existing.cursor = msg.cursor;

      const entity = this.userManagerService.getCursorEntityByUserId(msg.userId);
      if (entity && msg.cursor) {
        const { localX, localY } = this.ajustLocationCanvas(msg);

        this.lerpEntity(entity, localX, localY, deltaTime);

        if (entity.sprite.img.src !== msg.cursor.src) {
          entity.sprite.img = new Image();
          entity.sprite.img.src = msg.cursor.src;
        }
      }
    } else {
      this.userManagerService.addUser(msg);
    }
  }

  /**
   * Interpola la posicion de una entidad hacia un objetivo con suavizado va ligado ahora con el framrate
   */
  private lerpEntity(entity: Entity, targetX: number, targetY: number, deltaTime: number): void {
    const t = 1 - Math.pow(0.01, deltaTime / 100);
    entity.sprite.x += (targetX - entity.sprite.x) * t;
    entity.sprite.y += (targetY - entity.sprite.y) * t;
  }

  /**
   * Ajusta las coordenadas del cursor segun las resoluciones de canvas local y remoto
   */
  private ajustLocationCanvas(msg: User): { localX: number; localY: number } {
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
}
