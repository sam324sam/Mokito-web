import { PetState } from "../../../models/pet/pet-state.model";

export interface PetInputContext {
  setState(dir: PetState): void;
  setAnimation(name: string):void;
  sumMinusStat(name:string, n:number): void;
}
