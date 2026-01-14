import { ButtonRoom } from './buttom-room.model';

export interface Room {
  name: string;
  img: string | null;
  music: string | null;
  buttonRoom: ButtonRoom | null;
}
