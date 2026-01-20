import { Injectable, signal } from '@angular/core';

// Models
import { Pet } from '../../models/pet/pet.model';
import { AnimationSet } from '../../models/sprites/animation-set.model';
import { Stats } from '../../models/pet/stats.model';
import { Color } from '../../models/sprites/color.model';
import { Room } from '../../models/room/room.model';
import { PetState } from '../../models/pet/pet-state.model';
import { ObjectType } from '../../models/object/interactuable-object.model';

// Services
import { AnimationService } from '../animation.service';
import { DataService } from '../data.service';
import { ParticleService } from '../particle.service';
import { InteractableObjectsService } from '../interactable-objects/interactable-objects.service';

// Pet Services
import { PetStateService } from './pet-state/pet-state.service';
import { PetStatService } from './pet-stat.service.ts/pet-stats.service';
import { PetIaService } from './pet-ia/pet-ia.service';
import { PetInputService } from './pet-input/pet-input.service';
import { PetConditionService } from './pet-condition/pet-condition.service';

// Contexts
import { PetStatContext } from './pet-stat.service.ts/pet-stat.context';
import { PetIaContext } from './pet-ia/pet-ia.context';
import { PetStateContext } from './pet-state/pet-state.context';
import { PetInputContext } from './pet-input/pet-input.context';
import { PetConditionContext } from './pet-condition/pet-condition.context';

@Injectable({ providedIn: 'root' })
export class PetService {
  // Datos de la mascota y entorno
  pet: Pet = {} as Pet;
  colors: Color[] = [];
  rooms: Room[] = {} as Room[];
  animations: AnimationSet[] = [];

  // Control de IA
  activeIa = true;

  // Signal para notificar cambios en stats
  statsChanged = signal<Stats[]>([]);

  constructor(
    private readonly petStatService: PetStatService,
    private readonly animationService: AnimationService,
    private readonly dataService: DataService,
    private readonly interactableObjectsService: InteractableObjectsService,

    private readonly petIaService: PetIaService,
    private readonly particleService: ParticleService,
    private readonly petStateService: PetStateService,
    private readonly petInputService: PetInputService,
    private readonly petConditionService: PetConditionService,
  ) {}

  // ==================== Metodos publicos del servicio nucleo ====================

  /**
   * Inicializa el servicio de la mascota
   * Carga datos, colores, animaciones e inicializa servicios dependientes
   */
  initPetService(canvas: HTMLCanvasElement): void {
    this.pet = this.dataService.getPet();
    this.colors = this.dataService.getColors();

    this.animations = this.dataService.getAnimations(this.pet.id);
    this.animationService.loadAnimations(this.pet, this.animations);

    this.setIdleAnimation('happiness100');

    // Inicializar servicios que necesitan canvas
    this.petIaService.init(canvas);
    this.petInputService.init(canvas);
  }

  /**
   * Actualiza el estado de la mascota cada frame
   * Procesa estados y stats si el sprite existe
   */
  update(delta: number): void {
    if (!this.pet.sprite) return;

    this.petStateService.update(this.pet, delta, this.petStateContext);
    this.petStatService.updateStats(this.pet, delta, this.petStatContext);
    this.petConditionService.update(this.pet, delta, this.petConditionContext);
  }

  // ==================== Metodos publicos para el manejo de estados ====================

  /**
   * Cambia el estado de la mascota
   * Detiene la IA si la mascota es agarrada
   */
  setState(state: PetState): void {
    if (this.pet.state === state) return;

    this.pet.state = state;

    //console.log('Estado cambiado a ', state);
  }

  /**
   * Actualiza el signal de stats para notificar cambios a la UI
   */
  setStats(stats: Stats[]): void {
    this.statsChanged.set(stats);
  }

  setStatPorcent(name: string, value: number): void {
    if (Number.isNaN(value)) return;

    const stat = this.pet.stats.find((s) => s.name === name);
    if (!stat) return;

    stat.porcent = Math.max(0, Math.min(100, value));
  }

  /**
   * Para setear solo un stado en activo
   * @param name
   * @param active
   * @returns
   */
  setStatActive(name: string, active: boolean): void {
    const stat = this.pet.stats.find((s) => s.name === name);
    if (!stat) return;

    stat.active = active;
  }

  // ==================== Metodos publicos para las animaciones ====================

  /**
   * Establece la animacion idle para los diferentes estados
   * Fallback a 'default' si no encuentra la animacion solicitada
   */
  setIdleAnimation(animationName: string): void {
    let animation = this.pet.sprite.animationSprite[animationName];

    if (!animation) {
      console.log(
        'Animacion idle no encontrada con nombre',
        animationName,
        'Array de animaciones',
        this.animations,
        'Colocando animacion idle default',
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
   * Cambia la animacion actual del sprite
   * Solo cambia si la animacion existe y es diferente a la actual
   */
  setAnimation(name: string): void {
    if (!this.pet.sprite.animationSprite[name]) {
      console.log('La animacion de ' + name + ' no se a encotrado');
    }
    if (this.pet.sprite.currentAnimation === name) return;

    this.pet.sprite.currentAnimation = name;
    this.pet.sprite.currentFrame = 0;
    this.pet.sprite.frameCounter = 0;
  }

  // ==================== Metodos publicos para el movimiento ====================

  /**
   * Mueve la mascota en el canvas
   * Respeta el cheat de no movimiento
   */
  move(dx: number, dy: number): void {
    if (!this.pet.cheats.noMoreMove) {
      this.pet.sprite.x += dx;
      this.pet.sprite.y += dy;
    }
  }

  // ==================== Metodos publicos para el inptu service ====================

  /**
   * Maneja el evento de presionar sobre la mascota
   */
  handlePressDown(event: PointerEvent): void {
    this.petInputService.handlePressDown(this.pet, event, this.petInputContext);
  }

  /**
   * Maneja el evento de soltar la presion sobre la mascota
   */
  handlePressUp(event: PointerEvent): void {
    this.petInputService.handlePressUp(this.pet, event, this.petInputContext);
  }

  /**
   * Maneja el movimiento del mouse sobre la mascota
   */
  handleMouseMove(event: PointerEvent): void {
    this.petInputService.handleMouseMove(this.pet, event);
  }

  // ==================== Stats ====================

  /**
   * Suma o resta valor a una stat especifica
   * Clampea el valor entre 0 y 100
   */
  private sumMinusStat(name: string, value: number): void {
    const stat = this.getStatPet(name);
    if (!stat) return;

    stat.porcent = Math.min(100, Math.max(0, stat.porcent + value));
  }

  /**
   * Obtiene una stat por nombre
   * Retorna null si no existe
   */
  private getStatPet(name: string): Stats | null {
    return this.pet.stats.find((s) => s.name === name) ?? null;
  }

  // ==================== Contexto para los servicios ====================

  /**
   * Contexto para PetStateService
   * Provee metodos para manejar estados de la mascota
   */
  private readonly petStateContext: PetStateContext = {
    runIaIdle: (pet, delta) => this.petIaService.runIaIdle(pet, this.petIaContext),
    runIaWalk: (pet, delta) => this.petIaService.runIaWalk(pet, this.petIaContext),
    setState: (state) => this.setState(state),
    getStat: (name) => this.getStatPet(name),
    setAnimation: (name) => this.setAnimation(name),
    getDirection: () => this.petIaService.getDirection(),
    clearDirection: () => this.petIaService.clearDirection(),
    sumMinusStat: (name, value) => this.sumMinusStat(name, value),
    setStatActive: (name, active) => this,
  };

  /**
   * Contexto para PetConditionService
   * Provee metodos para manejar condicion de la mascota y ejecutar funciones
   */
  private readonly petConditionContext: PetConditionContext = {
    getStat: (name) => this.getStatPet(name),
    setAnimation: (name) => this.setAnimation(name),
  };

  /**
   * Contexto para PetStatService
   * Provee metodos para gestionar stats y animaciones idle
   */
  private readonly petStatContext: PetStatContext = {
    getStat: (name) => this.getStatPet(name),
    setIdleAnimation: (name) => {
      this.pet.sprite.animationSprite['idle'] = this.pet.sprite.animationSprite[name];
    },
    setStats: (stat) => this.setStats(stat),
  };

  /**
   * Contexto para PetIaService
   * Provee metodos para movimiento, animaciones y stats de la IA
   */
  private readonly petIaContext: PetIaContext = {
    getAnimationDuration: (dir) =>
      this.animationService.getAnimationDurationFrames(this.pet.sprite, dir),
    move: (dx, dy) => {
      if (!this.pet.cheats.noMoreMove) {
        this.pet.sprite.x += dx;
        this.pet.sprite.y += dy;
      }
    },
    modifyStat: (name, amount) => this.sumMinusStat(name, amount),
    getStat: (name) => this.getStatPet(name),
    setIdleAnimation: (name) => {
      this.pet.sprite.animationSprite['idle'] = this.pet.sprite.animationSprite[name];
    },
    setState: (state: PetState) => this.setState(state),
    emitParticle: (x, y) => this.particleService.emitDroplets(x, y, 1, 120, null),
    sumMinusStat: (name, value) => this.sumMinusStat(name, value),
  };

  /**
   * Contexto para PetInputService
   * Provee metodos para manejar interacciones del usuario
   */
  private readonly petInputContext: PetInputContext = {
    setAnimation: (dir) => {
      this.pet.sprite.currentAnimation = dir;
      this.pet.sprite.currentFrame = 0;
      this.pet.sprite.frameCounter = 0;
    },

    sumMinusStat: (name, value) => this.sumMinusStat(name, value),
    setState: (state: PetState) => this.setState(state),

    getInteractuableObject: (name) => this.interactableObjectsService.getInteractuableObject(name),
  };

  // ====================== Metodos para el input service e inventario
  private readonly buttonBehaviors: Record<string, () => void> = {
    openInventory: () => {
      this.toggleInventory(ObjectType.Food);
    },
    sleep: () => {
      this.petInputService.sleep(this.pet, this.petInputContext);
    },
    brushTeeth: () => {
      console.log('Cepillando dientes');
    },
    waterPlants: () => {
      console.log('Regando plantas');
    },
  };

  // Estado del modal
  isOpenInventory = signal(false);
  selectedTypeInventory = signal<ObjectType | null>(null);

  toggleInventory(type?: ObjectType) {
    const isOpen = this.isOpenInventory();

    if (isOpen) {
      this.isOpenInventory.set(false);
      this.selectedTypeInventory.set(null);
    } else if (type) {
      this.selectedTypeInventory.set(type);
      this.isOpenInventory.set(true);
    }
  }

  /**
   * Ejecutar la accion de cada habitacion
   * @param room
   * @returns
   */
  executeRoomButton(room: Room) {
    if (!room.buttonRoom) return;
    const behavior = this.buttonBehaviors[room.buttonRoom.buttonBehavior];
    behavior?.();
  }
}
