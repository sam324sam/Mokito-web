import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

// Service
import { SpriteService } from '../../services/sprites.service';
import { PetService } from '../../services/pet.service';

@Component({
  selector: 'app-pet-view',
  imports: [],
  templateUrl: './pet-view.html',
  styleUrl: './pet-view.scss',
})
export class PetView implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  canvas!: HTMLCanvasElement;

  constructor(
    private readonly spriteService: SpriteService,
    private readonly petService: PetService
  ) {
    petService.initPetService('assets/pet/pet.png');
  }

  // Para los eventos del boton
  pressTimer: number | null = null;
  isLongPress = false;
  LONG_PRESS = 500;

  onCanvasClickUp(event: MouseEvent) {
    if (this.pressTimer) clearTimeout(this.pressTimer);
    // volver al tutsitutsi
    this.petService.pet.isGrab = false;
    this.spriteService.changesAnimationClick(event, 'tutsitutsi');
    
  }

  // iniciar timer para ver si se pasa x tiempo para agarrar
  onCanvasClickDown(event: MouseEvent) {
    this.isLongPress = false;

    this.pressTimer = globalThis.setTimeout(() => {
      this.isLongPress = true;
      this.spriteService.changesAnimationClick(event, 'grab');
      this.petService.pet.isGrab = true;
    }, this.LONG_PRESS);
  }

  // Al mover el mouse
  onMouseMove(event: MouseEvent) {
    if (this.petService.pet.isGrab) {
      this.petService.movePet(this.spriteService.getScale(), event);
    }
  }

  ngAfterViewInit(): void {
    this.canvas = document.getElementById('home-canvas') as HTMLCanvasElement;
    // Asegurar que el canvas tenga el tamaño visual real del DOM
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.spriteService.init(this.canvas);
    // Ahora centrar sí funciona porque width/height son correctos
    // Ahora que init ha terminado, ya puedes centrar correctamente
    this.centerPet();

    this.spriteService.addSprite(this.petService.sprite);
    this.spriteService.start();
  }

  private centerPet() {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const scale = this.spriteService.getScale();

    this.petService.sprite.x = (canvasWidth - this.petService.sprite.width * scale) / (2 * scale);
    this.petService.sprite.y = (canvasHeight - this.petService.sprite.height * scale) / (2 * scale);

    console.log(
      'Canvas:',
      canvasWidth,
      canvasHeight,
      'Pet:',
      this.petService.sprite.x,
      this.petService.sprite.y,
      'Scale:',
      scale
    );
  }
}
