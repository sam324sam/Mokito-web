import { Stats } from "../../../models/pet/pet.model";

export interface PetConditionContext {
    getStat(name: string): Stats | null;
    setAnimation(name:string) : void;
}
