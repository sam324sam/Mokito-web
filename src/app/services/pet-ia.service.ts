import { Injectable } from '@angular/core';
import { Pet } from '../models/pet/pet.model';
import { Stats } from '../models/pet/stats.model';
// Servicios
import { CollisionService } from './collision.service';
import { ParticleService } from './particle.service';

type Direction = 'left' | 'right' | 'up' | 'down';

@Injectable({ providedIn: 'root' })
export class PetIaService {
  private canvas!: HTMLCanvasElement;

  private moving = false;
  private direction: Direction | 'idle' = 'idle';
  private lastDirection: Direction | null = null;

  // pixeles por frame
  private readonly speed = 1;
  // Para el movimiento
  private targetDistance = 0;
  private movedDistance = 0;
  private lastDecisionTime = 0;
  private readonly decisionCooldown = 2500;

  // para los estados del idle
  private actualIdle: string = '';

  //gotas de stamina
  private energyCooldown: number = 0;

  constructor(
    private readonly collisionService: CollisionService,
    private readonly particleService: ParticleService
  ) {}

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  update(
    pet: Pet,
    delta: number,
    getAnimationDuration: (dir: string) => number,
    setAnimation: (dir: string) => void,
    movePet: (dx: number, dy: number) => void,
    sumMinusStat: (dx: any, dy: any) => void,
    getStatPet: (dir: any) => Stats | null,
    setIdleAnimation: (dir: string) => void
  ) {
    this.moveProcess(pet, getAnimationDuration, setAnimation, movePet, sumMinusStat, getStatPet);
    this.statsProcess(pet, delta, setIdleAnimation, getStatPet);
  }

  /**
   * Para la organizacion y uso de los comportamientos segun el estado de la pet
   */
  private statsProcess(
    pet: Pet,
    delta: number,
    setIdleAnimation: (dir: string) => void,
    getStatPet: (dir: string) => Stats | null
  ) {
    const happiness: Stats | null = getStatPet('happiness');
    const energy: Stats | null = getStatPet('energy');
    // seccion para la felicidad
    if (happiness) {
      this.happinessProcess(happiness, setIdleAnimation);
    }
    // seccion para la energia
    if (energy) {
      this.energyProcess(energy, pet, delta);
    }
  }
  /**
   * Eventos y comportamientos vinculados a la felicidad
   */
  happinessProcess(happiness: Stats, setIdleAnimation: (dir: string) => void) {
    if (happiness.porcent > 65) {
      if (this.actualIdle === 'happiness100') return;
      setIdleAnimation('happiness100');
      this.actualIdle = 'happiness100';
    } else if (happiness.porcent <= 65 && happiness.porcent >= 15) {
      if (this.actualIdle === 'happiness65') return;
      setIdleAnimation('happiness65');
      this.actualIdle = 'happiness65';
    } else {
      if (this.actualIdle === 'happiness15') return;
      setIdleAnimation('happiness15');
      this.actualIdle = 'happiness15';
    }
  }

  /**
   * Eventos y comportamientos para la energia
   */
  energyProcess(energy: Stats, pet: Pet, delta: number) {
  this.energyCooldown -= delta;

  if (this.energyCooldown > 0) {
    return;
  }

  // pasar energia a (0 - 0.5)
  const energyFactor = Math.min(energy.porcent / 100, 0.5);

  // Probabilidad base + bonus por energia
  const probability = 0.5 + energyFactor;

  if (Math.random() > probability) {
    const width = pet.sprite.width * pet.sprite.scale;
    const height = pet.sprite.height * pet.sprite.scale;

    const x = pet.sprite.x + Math.random() * width;
    const y = pet.sprite.y + Math.random() * height;

    this.particleService.emitDroplets(x, y, 1, 120, null);

    this.energyCooldown = 1000;
  }
}


  /**
   * Procesa toda la logica de IA de la mascota
   */
  private moveProcess(
    pet: Pet,
    getAnimationDuration: (dir: string) => number,
    setAnimation: (dir: string) => void,
    movePet: (dx: number, dy: number) => void,
    sumMinusStat: (dx: any, dy: any) => void,
    getStatPet: (dir: any) => Stats | null
  ) {
    // No realizar el movimiento si esto se cumple
    if (!pet.sprite || pet.cheats.noMoreMove) return;

    const now = performance.now();

    // Solo tomar decisiones si no esta agarrada ni bloqueada
    if (now - this.lastDecisionTime > this.decisionCooldown && !pet.isGrab && !pet.blockMove) {
      this.lastDecisionTime = now;
      this.startMovementFromAnimationDuration(pet, getAnimationDuration, setAnimation, getStatPet);
    }

    // Si esta agarrada o bloqueada, detener el movimiento actual
    if (pet.isGrab || pet.blockMove) {
      if (this.moving) {
        this.stop();
      }
      return;
    }

    // Si no se esta moviendo, no hacer nada
    if (!this.moving) return;

    // Ejecutar el movimiento actual
    this.executeMovement(pet, movePet, sumMinusStat);
  }

  /**
   * Ejecuta el movimiento frame a frame
   */
  private executeMovement(
    pet: Pet,
    movePet: (dx: number, dy: number) => void,
    sumMinusStat: (dx: any, dy: any) => void
  ) {
    let dx = 0,
      dy = 0;
    switch (this.direction) {
      case 'left':
        dx = -this.speed;
        break;
      case 'right':
        dx = this.speed;
        break;
      case 'up':
        dy = -this.speed;
        break;
      case 'down':
        dy = this.speed;
        break;
    }

    // Verificar colision antes de mover
    if (
      this.collisionService.checkCollision(
        pet.sprite.x + dx,
        pet.sprite.y + dy,
        pet.sprite.width,
        pet.sprite.height,
        this.canvas
      )
    ) {
      this.stop();
      return;
    }

    // se mueve le llama al metod de pet
    movePet(dx, dy);
    this.movedDistance += Math.abs(dx) + Math.abs(dy);

    if (this.movedDistance >= this.targetDistance) {
      this.stop();
      sumMinusStat('energy', -3);
    }
  }

  // Detener el movimiento
  private stop() {
    this.moving = false;
    this.direction = 'idle';
  }

  /**Verifica si se puede realizar el recorrido completo */
  private canMoveFullAnimation(pet: Pet, direction: Direction): boolean {
    const sprite = pet.sprite;
    if (!sprite) return false;

    let dx = 0;
    let dy = 0;

    switch (direction) {
      case 'left':
        dx = -this.speed;
        break;
      case 'right':
        dx = this.speed;
        break;
      case 'up':
        dy = -this.speed;
        break;
      case 'down':
        dy = this.speed;
        break;
    }

    let testX = sprite.x;
    let testY = sprite.y;

    // Simulamos el recorrido pixel a pixel
    for (let i = 0; i < this.targetDistance; i++) {
      testX += dx;
      testY += dy;

      if (
        this.collisionService.checkCollision(testX, testY, sprite.width, sprite.height, this.canvas)
      ) {
        return false;
      }
    }

    return true;
  }

  private shuffleArray<T>(array: T[]): T[] {
    // Creamos una copia del array original para no modificarlo
    const shuffled = [...array];

    // Recorremos el array de atras hacia adelante
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Elegimos un indice aleatorio entre 0 e i
      const j = Math.floor(Math.random() * (i + 1));

      // se cambian los elementos en las posiciones i y j
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // array mezclado
    return shuffled;
  }

  private startMovementFromAnimationDuration(
    pet: Pet,
    getAnimationDuration: (dir: string) => number,
    setAnimation: (dir: string) => void,
    getStatPet: (dir: any) => Stats | null
  ) {
    // para ver si toma la decicion de moverse
    if (Math.random() > this.decisionMove(getStatPet)) {
      return;
    }

    const directions: Direction[] = ['left', 'right', 'up', 'down'];
    // Para que no pueda tomar la misma direccion dos veces seguidas
    const filteredDirections = this.lastDirection
      ? directions.filter((d) => d !== this.lastDirection)
      : directions;

    const shuffledDirections = this.shuffleArray(filteredDirections);

    for (const dir of shuffledDirections) {
      const animDurationMs = getAnimationDuration(dir);

      const framesInAnimation = animDurationMs / 16.67;
      this.targetDistance = Math.floor(framesInAnimation * this.speed);
      this.movedDistance = 0;

      // ver a veces falla
      if (this.canMoveFullAnimation(pet, dir)) {
        this.direction = dir;
        this.lastDirection = dir;
        this.moving = true;
        setAnimation(dir);
        return;
      }
    }
    //No se encontro ninguna direccion valida
  }

  /**
   * Calcula la probabilidad de moverse segun la energia y felicidad de la mascota
   * Devuelve un numero entre 0 y 1 que indica la probabilidad de moverse (nunca es 1 perobueno)
   */
  private decisionMove(getStatPet: (dir: any) => Stats | null): number {
    const energy: Stats | null = getStatPet('energy');
    const happiness: Stats | null = getStatPet('happiness');

    // valores por defecto si no existen stats
    let energyFactor = 0.6;
    let happinessFactor = 0.6;

    if (energy) {
      const p = energy.porcent;
      if (p > 65) energyFactor = 0.8; // mucha energia
      else if (p >= 15) energyFactor = 0.5; // energia media
      else energyFactor = 0.1; // poca energia
    }

    if (happiness) {
      const p = happiness.porcent;
      if (p > 65) happinessFactor = 0.8; // muy feliz
      else if (p >= 15) happinessFactor = 0.5; // felicidad media
      else happinessFactor = 0.2; // triste
    }

    // se revisa la energia y felicidad y se divide en dos para tomar a amabas en cuenta
    const probability = (energyFactor + happinessFactor) / 2;

    return probability;
  }
}
