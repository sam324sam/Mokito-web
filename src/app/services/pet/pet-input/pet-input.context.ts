import { InteractuableObject } from "../../../models/object/interactuable-object.model";
import { PetState } from "../../../models/pet/pet-state.model";

export interface PetInputContext {
  setState(state: PetState): void;
  setAnimation(name: string): void;
  sumMinusStat(name: string, n: number): void;

  getInteractuableObject(name:string): InteractuableObject | undefined;
}