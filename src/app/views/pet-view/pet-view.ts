import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';

// Service
import { GameLoopService } from '../../services/game-loop.service';
import { SpriteService } from '../../services/sprites.service';
import { PetService } from '../../services/pet.service';
import { CursorService } from '../../services/cursor.service';
import { PetIaService } from '../../services/pet-ia.service';
import { StatsBar } from "../../component/stats-bar/stats-bar";

@Component({
  selector: 'app-pet-view',
  imports: [StatsBar],
  templateUrl: './pet-view.html',
  styleUrl: './pet-view.scss',
  standalone: true,
})
export class PetView implements AfterViewInit, OnDestroy{
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

  @HostListener('window:resize')
  onResize() {
    // Algun dia esto funcionara
    this.spriteService.resizeScaleCanvas(this.canvas);
  }

  onMouseMove(event: MouseEvent) {
    this.petService.handleMouseMove(event);
  }

  ngOnDestroy() {
    this.gameLoopService.stop();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  // Para al cambiar de pestaña detener el juego
  private readonly onVisibilityChange = () => {
    if (document.hidden) {
      // pestaña oculta en teoria parar loop
      this.gameLoopService.stop(); 
      console.log("Juego en pausa")
    } else {
      // pestaña visible reanudar loop
      this.gameLoopService.start();
      console.log("Juego iniciado")
    }
  };

  // Despues de cargar los componentes
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
    document.addEventListener('visibilitychange', this.onVisibilityChange);
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
