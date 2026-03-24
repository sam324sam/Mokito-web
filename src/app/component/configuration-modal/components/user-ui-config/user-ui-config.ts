import { Component, Input } from '@angular/core';
import { PlayerData } from '../../../../models/player/player-data.model';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-user-ui-config',
  templateUrl: './user-ui-config.html',
  styleUrl: './user-ui-config.css',
})
export class UserUiConfig {
  @Input() isUserUiSectionOpen: boolean = false;

  /** Colores disponibles para la consola */
  aviableColors: string[] = ['purple', 'blue', 'red', 'green', 'white', 'yellow'];

  playerData: PlayerData = {} as PlayerData;

/**
   * Inicializa los colores seleccionados despues de que la vista se haya cargado
   * Esto permite sincronizar con las variables CSS globales si es necesario
   */
  constructor(private readonly dataService: DataService) {
    this.playerData = this.dataService.getPlayerData();
  }

  

  /**
   * Cambia el color del cuerpo de la consola
   * @param color Color seleccionado
   * Actualiza la variable CSS global --console-frame
   */
  setConsoleBodyColor(color: string): void {
    this.playerData.frameConsoleColor = color;
    document.documentElement.style.setProperty(
      '--console-frame',
      `url('assets/img/icon/UI/console/${color}/frame-console.png')`,
    );
  }

  /**
   * Cambia el color de la pantalla de la consola
   * @param color Color seleccionado
   * Actualiza la variable CSS global --screen-frame
   */
  setConsoleScreenColor(color: string): void {
    this.playerData.framePetColor = color;
    document.documentElement.style.setProperty(
      '--screen-frame',
      `url('assets/img/icon/UI/console/${color}/frame-pet.png')`,
    );
  }
}
