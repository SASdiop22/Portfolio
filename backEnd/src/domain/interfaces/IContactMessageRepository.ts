import { ContactMessage } from '../models/ContactMessage';
import { IBaseRepository } from './IBaseRepository';

export interface IContactMessageRepository extends IBaseRepository<ContactMessage> {
  findUnread(): Promise<ContactMessage[]>;
  markAsRead(id: string): Promise<ContactMessage | null>;
}
