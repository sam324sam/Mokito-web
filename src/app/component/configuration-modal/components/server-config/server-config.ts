import { Component, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../../../../services/multi/web-socket.service';
import { User } from '../../../../models/player/player-data.model';

@Component({
  selector: 'app-server-config',
  imports: [FormsModule],
  templateUrl: './server-config.html',
  styleUrl: './server-config.css',
})
export class ServerConfig implements OnDestroy {
  @Input() isServerConfigSectionOpen: boolean = false;

  user: User;
  url: string;
  users: User[] = [];
  isLoading = false;
  isRefreshing = false;
  errorMsg = '';
  ping: number | null = null;

  private pingInterval: ReturnType<typeof setInterval> | null = null;

  get status(): boolean {
    return this.webSocketService.status;
  }

  get pingColor(): string {
    if (this.ping === null) return 'text-slate-400';
    if (this.ping < 100) return 'text-green-400';
    if (this.ping < 300) return 'text-yellow-400';
    return 'text-red-400';
  }

  constructor(private readonly webSocketService: WebSocketService) {
    this.user = this.webSocketService.getUser();
    this.url = this.webSocketService.getUrl();
  }

  setNameUser(name: string) {
    this.user.name = name;
    this.webSocketService.setUserName(name);
  }

  setUrl(url: string) {
    this.url = url;
    this.webSocketService.setUrl(url);
  }

  async connect() {
    this.isLoading = true;
    this.errorMsg = '';
    try {
      await this.webSocketService.connect();
      await this.measurePing();
      await this.refresh();
      // Actualiza el ping cada 5 segundos
      this.pingInterval = setInterval(() => this.measurePing(), 5000);
    } catch (e) {
      this.errorMsg = 'Error al conectar. Revisa la URL.';
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  }

  async refresh() {
    this.isRefreshing = true;
    try {
      this.users = await this.webSocketService.getAllUsers();
    } catch (e) {
      this.errorMsg = 'Error al obtener usuarios.';
      console.error(e);
    } finally {
      this.isRefreshing = false;
    }
  }

  async measurePing() {
    try {
      this.ping = await this.webSocketService.ping();
    } catch {
      this.ping = null;
    }
  }

  // limpio lo del ping 
  ngOnDestroy() {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }
}
