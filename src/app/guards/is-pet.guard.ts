import { PetRuntime } from "../models/pet/pet-runtime.model";

export function isPet(e: any): e is PetRuntime {
  return 'state' in e && 'conditions' in e;
}