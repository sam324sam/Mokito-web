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
}

export interface Cursor {
  x: number;
  y: number;
}
