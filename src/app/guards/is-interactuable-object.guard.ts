import { InteractuableObjectRuntime } from "../models/object/Interactuable-object-runtime.model";

export function isInteractuableObject(e: any): e is InteractuableObjectRuntime {
  return 'type' in e && 'timeToLife' in e;
}