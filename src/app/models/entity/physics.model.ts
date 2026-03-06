export interface Physics {
  vx: number;
  vy: number;
  gravity: number;
  enabled: boolean;
  restitution: number | null;
  friction: number | null;
}
