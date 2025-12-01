import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

// Service
import { GameLoopService } from '../../services/game-loop.service';
import { SpriteService } from '../../services/sprites.service';
import { PetService } from '../../services/pet.service';
import { CursorService } from '../../services/cursor.service';
import { PetIaService } from '../../services/pet-ia.service';

@Component({
  selector: 'app-pet-view',
  imports: [],
  templateUrl: './pet-view.html',
  styleUrl: './pet-view.scss',
  standalone: true,
})
export class PetView implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  canvas!: HTMLCanvasElement;

  constructor(
    private readonly spriteService: SpriteService,
    private readonly petService: PetService,
    private readonly cursorService: CursorService,
    private readonly petIaService: PetIaService,
    private readonly gameLoopService: GameLoopService
  ) {}

  onCanvasClickDown(event: MouseEvent) {
    this.petService.handlePressDown(event);
    this.cursorService.setCanvasCursor('assets/cursor/cursor-grab.png');
  }

  onCanvasClickUp(event: MouseEvent) {
    this.petService.handlePressUp(event);
    this.cursorService.resetCanvasCursor();
  }

  onMouseMove(event: MouseEvent) {
    this.petService.handleMouseMove(event);
  }

  ngAfterViewInit() {
    this.canvas = document.getElementById('home-canvas') as HTMLCanvasElement;

    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    this.spriteService.init(this.canvas);
    this.petIaService.init(this.spriteService.getCanvas());

    // Esperar a que el Pet
    this.petService.initPetService(this.spriteService.getScale());
    // Centrar la mascota
    this.centerPet();

    // Añadir sprite al motor
    this.spriteService.addSprite(this.petService.pet.sprite);

    // iniciar loop al final
    this.gameLoopService.start();
  }

  private centerPet() {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const scale = this.spriteService.getScale();

    this.petService.pet.sprite.x =
      (canvasWidth - this.petService.pet.sprite.width * scale) / (2 * scale);
    this.petService.pet.sprite.y =
      (canvasHeight - this.petService.pet.sprite.height * scale) / (2 * scale);

    console.log(
      'Canvas:',
      canvasWidth,
      canvasHeight,
      'Pet:',
      this.petService.pet.sprite.x,
      this.petService.pet.sprite.y,
      'Scale:',
      scale
    );
  }
}
