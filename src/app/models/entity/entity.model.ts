import { Sprite } from "../sprites/sprites.model";

export interface Entity {
  id: number | null;
  sprite: Sprite;
  active: boolean;
  tags: string[];
}
