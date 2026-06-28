import { ContactMessageModel } from '../models/ContactMessage';

export interface IContactMessageRepository {
  findUnread(): Promise<ContactMessageModel[]>;
  markAsRead(id: string): Promise<ContactMessageModel | null>;
}
