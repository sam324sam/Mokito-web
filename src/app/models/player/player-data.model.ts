import { Pet } from '../pet/pet.model';

export interface PlayerData {
  frameConsoleColor: string;
  framePetColor: string;

  musicVolume: number;
  sfxVolume: number;

  user: User;
}

export interface User {
  name: string;
  userId: string | null;
  cursor: Cursor | null;
  pet: Pet | null;
  canvas: Canvas;
}

export interface Cursor {
  x: number;
  y: number;
  src: string;
}

export interface Canvas {
  width: number;
  height: number;
}
