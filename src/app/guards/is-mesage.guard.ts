import { Message } from '../models/message/message.model';

export function isMessage(e: any): e is Message {
  return 'body' in e && 'timeToLife' in e;
}
