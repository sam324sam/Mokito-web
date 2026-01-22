import { Sprite } from "../sprites/sprites.model";

export interface Entity {
  id: number;
  sprite: Sprite;
  active: boolean;
}
