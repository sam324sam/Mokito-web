import { Component, Input } from '@angular/core';
import { WebSocketService } from '../../../../services/multi/web-socket.service';
import { User } from '../../../../models/player/player-data.model';

@Component({
  selector: 'app-server-config',
  imports: [],
  templateUrl: './server-config.html',
  styleUrl: './server-config.css',
})
export class ServerConfig {
  user: User;
  url: string;

  users: User[] = []

  get status(): boolean {
    return this.webSocketService.status;
  }

  constructor(private readonly webSocketService: WebSocketService) {
    this.user = this.webSocketService.getUser();
    this.url = this.webSocketService.getUrl();
  }

  @Input() isServerConfigSectionOpen: boolean = false;

  setNameUser(name: string) {
    this.user.name = name;
    this.webSocketService.setUserName(name);
  }

  setUrl(url: string) {
    this.url = url;
    this.webSocketService.setUrl(url);
  }

  async connect() {
    await this.webSocketService.connect();
    this.users = await this.webSocketService.getAllUsers();
  }
}
