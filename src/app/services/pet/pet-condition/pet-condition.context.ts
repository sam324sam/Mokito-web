import { Stats } from "../../../models/pet/stats.model";

export interface PetConditionContext {
    getStat(name: string): Stats | null;
}
