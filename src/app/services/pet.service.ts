import { Injectable, signal } from '@angular/core';
import { Pet } from '../models/pet/pet.model';
import { AnimationSet } from '../models/sprites/animation-set.model';
import { Stats } from '../models/pet/stats.model';
import { Color } from '../models/sprites/color.model';

// servicios
import { SpriteService } from './sprites.service';
import { AnimationService } from './animation.service';
import { DataService } from './data.service';
import { PetIaService } from './pet-ia.service';
import { ParticleService } from './particle.service';

@Injectable({ providedIn: 'root' })
export class PetService {
  colors: Color[] = [];
  pet: Pet = {} as Pet;

  statsChanged = signal<Stats[]>([]);
  animations: AnimationSet[] = [];
  activeIa = true;

  // Control de presion prolongada
  private pressTimer: any = null;
  private readonly LONG_PRESS_DURATION = 250; // ms para activar el agarre

  // Desplazamiento del mouse respecto al sprite al agarrarlo
  private grabOffsetX = 0;
  private grabOffsetY = 0;

  // Limites del canvas logico
  private readonly BASE_WIDTH = 200;
  private readonly BASE_HEIGHT = 200;

  constructor(
    private readonly spriteService: SpriteService,
    private readonly animationService: AnimationService,
    private readonly dataService: DataService,
    private readonly petIaService: PetIaService,
    private readonly particleService: ParticleService
  ) {}

  /**
   * Inicializa el servicio del pet
   * Carga datos, colores y animaciones
   */
  initPetService() {
    this.pet = this.dataService.getPet();
    this.colors = this.dataService.getColors();

    this.animations = this.dataService.getAnimations(this.pet.id);
    this.animationService.loadAnimations(this.pet, this.animations);
    this.setIdleAnimation('default');
  }

  /**
   * Actualiza el estado del pet cada frame
   * Ejecuta la IA y actualiza las estadisticas
   */
  update(delta: number) {
    if (this.activeIa) {
      this.petIaService.update(
        this.pet,
        delta,
        (dir) => this.getAnimationDuration(dir),
        (dir) => this.setAnimation(dir),
        (dx, dy) => this.movePet(dx, dy),
        (dx, dy) => this.sumMinusStat(dx, dy),
        (dir) => this.getStatPet(dir),
        (dir) => this.setIdleAnimation(dir)
      );
    }
    this.updateStats(delta);
  }

  /**
   * Mueve el pet en el canvas
   * Respeta el cheat de no movimiento
   */
  movePet(dx: number, dy: number) {
    if (!this.pet.cheats.noMoreMove) {
      this.pet.sprite.x += dx;
      this.pet.sprite.y += dy;
    }
  }

  /**
   * Convierte coordenadas del mouse (CSS) a coordenadas del canvas logico (200x200)
   * Compensa la diferencia entre el tamano visual (CSS) y el buffer interno
   */
  private getMousePos(evt: PointerEvent): { x: number; y: number } {
    const canvas = this.spriteService.getCanvas();
    const rect = canvas.getBoundingClientRect();

    // Escala para convertir de CSS a canvas logico
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY,
    };
  }

  /**
   * Verifica si el click esta dentro del area del sprite escalado
   * Usa coordenadas del canvas logico para la comparacion
   */
  private isPetClicked(event: PointerEvent): boolean {
    const mouse = this.getMousePos(event);
    const sprite = this.pet.sprite;

    // El sprite se dibuja escalado en el canvas
    const scaledWidth = sprite.width * this.spriteService.spriteScale;
    const scaledHeight = sprite.height * this.spriteService.spriteScale;

    const isInside =
      mouse.x >= sprite.x &&
      mouse.x <= sprite.x + scaledWidth &&
      mouse.y >= sprite.y &&
      mouse.y <= sprite.y + scaledHeight;

    return isInside;
  }

  /**
   * Maneja el evento de presionar el mouse sobre el pet
   * Inicia un timer para detectar presion prolongada (agarre)
   */
  handlePressDown(event: PointerEvent) {
    event.preventDefault();
    if (!this.isPetClicked(event)) return;

    this.clearPressTimer();

    this.pressTimer = setTimeout(() => {
      this.startGrabbing(event);
    }, this.LONG_PRESS_DURATION);
  }

  /**
   * Inicia el modo de agarre del pet
   * Calcula el offset entre el mouse y la posicion del sprite
   */
  private startGrabbing(event: PointerEvent) {
    this.pet.isGrab = true;

    const mouse = this.getMousePos(event);

    // Calcular offset para mantener la posicion relativa al agarrar
    this.grabOffsetX = mouse.x - this.pet.sprite.x;
    this.grabOffsetY = mouse.y - this.pet.sprite.y;

    console.log('grabOffsetX', this.grabOffsetX, 'grabOffsetY', this.grabOffsetY);

    // Cambiar a animacion de agarre
    this.setAnimation('grab');
  }

  /**
   * Maneja el evento de soltar el mouse
   * Cancela el agarre y ejecuta animacion de respuesta si fue un click corto
   */
  handlePressUp(event: PointerEvent) {
    event.preventDefault();

    this.clearPressTimer();
    this.pet.isGrab = false;

    // Si no era agarre y clickeo sobre el pet, hacer animacion de respuesta
    if (this.isPetClicked(event)) {
      this.triggerPetResponse();
    }
  }

  /**
   * Ejecuta la animacion de respuesta al click (tutsitutsi)
   * Bloquea movimiento durante la animacion y suma felicidad
   */
  private triggerPetResponse() {
    if (this.pet.blockMove) return;

    this.setAnimation('tutsitutsi');
    this.pet.blockMove = true;
    this.sumMinusStat('happiness', 5);

    // Desbloquear cuando termine la animacion
    const duration = this.animationService.getAnimationDuration(this.pet.sprite);
    // Poner el sistema particulas
    this.emitHappyParticles();
    setTimeout(() => {
      this.pet.blockMove = false;
    }, duration);
  }

  /**
   * Maneja el movimiento del mouse mientras se agarra el pet
   * Actualiza la posicion del sprite siguiendo el cursor
   */
  handleMouseMove(event: PointerEvent) {
    if (!this.pet.isGrab) return;

    const mouse = this.getMousePos(event);

    // Calcular nueva posicion manteniendo el offset donde se clickeo
    let newX = mouse.x - this.grabOffsetX;
    let newY = mouse.y - this.grabOffsetY;

    // Aplicar limites para que no se salga del canvas
    this.pet.sprite.x = Math.max(0, newX);
    this.pet.sprite.y = Math.max(0, newY);
  }

  /**
   * Limpia el timer de presion prolongada
   * Previene que se active el agarre despues de soltar
   */
  private clearPressTimer() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  /**
   * Cambia la animacion actual del sprite
   * Solo cambia si la animacion existe y es diferente a la actual
   */
  setAnimation(name: string) {
    if (!this.pet.sprite.animationSprite[name]) return;
    if (this.pet.sprite.currentAnimation === name) return;

    this.pet.sprite.currentAnimation = name;
    this.pet.sprite.currentFrame = 0;
    this.pet.sprite.frameCounter = 0;
  }

  /**
   * Setear la animacion del idle para los estados
   */
  setIdleAnimation(animationName: string) {
    let animation = this.pet.sprite.animationSprite[animationName];
    if (!animation) {
      console.log(
        'Animacion idle no encotrada con nombre',
        animationName,
        'Array de animaciones',
        this.animations,
        'Colocando animacion idle default'
      );
      this.pet.sprite.animationSprite['idle'] = this.pet.sprite.animationSprite['default'];
      return;
    }
    this.pet.sprite.animationSprite['idle'] = animation;
    if (!this.pet.sprite.animationSprite['idle']) {
      this.setAnimation('idle');
    }
  }

  /**
   * Obtiene la duracion en ms de una animacion especifica
   */
  getAnimationDuration(animationName: string): number {
    return this.animationService.getAnimationDurationFrames(this.pet.sprite, animationName);
  }

  /**
   * Actualiza las estadisticas del pet cada frame
   * Aplica el decay (reduccion) de cada stat activa
   */
  private updateStats(delta: number) {
    if (this.pet.cheats.godMode) return;

    const dt = delta / 1000; // Convertir a segundos

    for (const stat of this.pet.stats) {
      if (stat.active) {
        stat.porcent = Math.max(0, stat.porcent - stat.decay * dt);
      }
    }

    this.statsChanged.set([...this.pet.stats]);
  }

  /**
   * Modifica una estadistica del pet
   * Puede sumar o restar valor (usar valores negativos para restar)
   */
  sumMinusStat(statName: string, value: number) {
    if (this.pet.cheats.godMode) return;

    const stat: Stats | null = this.getStatPet(statName);
    if (stat) {
      stat.porcent = Math.min(100, Math.max(0, stat.porcent + value));
    }
  }

  getStatPet(statName: string): Stats | null {
    return this.pet.stats.find((s) => s.name === statName) || null;
  }

  private emitHappyParticles() {
    const sprite = this.pet.sprite;
    const scale = this.spriteService.spriteScale;

    const centerX = sprite.x + (sprite.width * scale) / 2;
    const centerY = sprite.y + (sprite.height * scale) / 2;

    this.particleService.emitExplosion(centerX, centerY, 10, 150, null);
  }
}
