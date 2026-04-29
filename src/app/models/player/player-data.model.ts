
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

export interface PetClient {
  x: number;
  y: number;
  userId: string;
}
