import { Component, Input, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-user-ui-config',
  templateUrl: './user-ui-config.html',
  styleUrl: './user-ui-config.scss',
})
export class UserUiConfig implements AfterViewInit {
  @Input() isUserUiSectionOpen: boolean = false;

  /** Colores disponibles para la consola */
  aviableColors: string[] = ['purple', 'blue', 'red', 'green', 'white', 'yellow'];

  /** Color seleccionado para la pantalla de la consola */
  colorScreenSelected: string = 'purple';

  /** Color seleccionado para el cuerpo de la consola */
  colorBodySelected: string = 'purple';

  /** 
   * Inicializa los colores seleccionados despues de que la vista se haya cargado
   * Esto permite sincronizar con las variables CSS globales si es necesario
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      const rootStyles = getComputedStyle(document.documentElement);

      const screenUrl = rootStyles
        .getPropertyValue('--screen-frame')
        .trim();
      const bodyUrl = rootStyles
        .getPropertyValue('--console-frame')
        .trim();

      // Extrae el color de la URL y asigna valor por defecto si no se encuentra
      this.colorScreenSelected = /console\/(\w+)\//.exec(screenUrl)?.[1] ?? 'purple';
      this.colorBodySelected = /console\/(\w+)\//.exec(bodyUrl)?.[1] ?? 'purple';
    });
  }

  /** 
   * Cambia el color del cuerpo de la consola
   * @param color Color seleccionado
   * Actualiza la variable CSS global --console-frame
   */
  setConsoleBodyColor(color: string): void {
    this.colorBodySelected = color;

    document.documentElement.style.setProperty(
      '--console-frame',
      `url('/Mokito-web/assets/icon/UI/console/${color}/frame-console.png')`
    );
  }

  /** 
   * Cambia el color de la pantalla de la consola
   * @param color Color seleccionado
   * Actualiza la variable CSS global --screen-frame
   */
  setConsoleScreenColor(color: string): void {
    this.colorScreenSelected = color;

    document.documentElement.style.setProperty(
      '--screen-frame',
      `url('/Mokito-web/assets/icon/UI/console/${color}/frame-pet.png')`
    );
  }
}
