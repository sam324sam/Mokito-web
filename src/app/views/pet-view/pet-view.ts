import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
// Modelos
import { Room } from '../../models/room/room.model';
// Service
import { GameLoopService } from '../../services/game-loop.service';
import { SpriteService } from '../../services/sprites.service';
import { PetService } from '../../services/pet/pet.service';
import { CursorService } from '../../services/cursor.service';

import { ParticleService } from '../../services/particle.service';
import { RoomService } from '../../services/room.service';
// Componentes
import { StatsBar } from '../../component/stats-bar/stats-bar';
import { InventoryModal } from '../../component/inventory-modal/inventory-modal';
@Component({
  selector: 'app-pet-view',
  imports: [StatsBar,InventoryModal],
  templateUrl: './pet-view.html',
  styleUrl: './pet-view.scss',
  standalone: true,
})
export class PetView implements AfterViewInit, OnDestroy {
  @ViewChild('petCanvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;
  canvas!: HTMLCanvasElement;

  // Para las stats
  isOpenStats: boolean = false;

  // para room
  rooms: Room[] = [];
  currentIndex = computed(() => this.roomService.getCurrentIndex());

  // Computed para obtener la room actual del array
  currentRoom = computed(() => this.rooms[this.currentIndex()]);

  constructor(
    private readonly spriteService: SpriteService,
    private readonly petService: PetService,
    private readonly cursorService: CursorService,
    //private readonly petIaService: PetIaService,
    private readonly gameLoopService: GameLoopService,
    private readonly particleService: ParticleService,
    private readonly roomService: RoomService
  ) {
    this.rooms = this.roomService.getRooms();
  }

  onCanvasClickDown(event: PointerEvent) {
    this.petService.handlePressDown(event);
    this.cursorService.setCanvasCursor('assets/cursor/cursor-grab.png');
  }

  onCanvasClickUp(event: PointerEvent) {
    this.petService.handlePressUp(event);
    this.cursorService.resetCanvasCursor();
  }

  @HostListener('window:resize')
  onResize() {
    // Algun dia esto funcionara
    this.spriteService.resizeCanvas();
    this.centerPet();
  }

  onMouseMove(event: PointerEvent) {
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
      console.log('Juego en pausa');
    } else {
      // pestaña visible reanudar loop
      this.gameLoopService.start();
      console.log('Juego iniciado');
    }
  };

  // Despues de cargar los componentes
  ngAfterViewInit() {
    this.canvas = document.getElementById('pet-canvas') as HTMLCanvasElement;

    this.spriteService.init(this.canvas);
    this.particleService.init(this.canvas, this.spriteService.spriteScale);
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    // Esperar a que el Pet
    this.petService.initPetService(this.canvas);
    // Centrar la mascota
    this.centerPet();

    // iniciar loop al final
    this.gameLoopService.start();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private centerPet() {
    const scale = this.spriteService.spriteScale;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    this.petService.pet.sprite.x = Math.floor(
      (canvasWidth - this.petService.pet.sprite.width * scale) / 2
    );
    this.petService.pet.sprite.y = Math.floor(
      (canvasHeight - this.petService.pet.sprite.height * scale) / 2
    );

    console.log(
      'Canvas:',
      canvasWidth,
      canvasHeight,
      'Pet:',
      this.petService.pet.sprite.x,
      this.petService.pet.sprite.y
    );
  }

  toggleStats() {
    this.isOpenStats = !this.isOpenStats;
  }
}
