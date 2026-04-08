import { InteractuableObject } from '../object/interactuable-object.model';

export interface Room {
  name: string;
  img: string | null;
  music: string | null;
  buttonRoom: ButtonRoom | null;
  objects: Record<string, InteractuableObject> | null;
}

export interface ButtonRoom {
  name: string;
  buttonBehavior: string;
  img: string;
}
