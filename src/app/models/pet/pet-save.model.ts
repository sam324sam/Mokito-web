import { PlayerData } from "../player/player-data.model";
import { Color } from "../sprites/color.model";

export interface PetSave {
  version: number;
  stats: any[];
  color: Color | null;
  cheats: any;
  playerData: PlayerData;
}
