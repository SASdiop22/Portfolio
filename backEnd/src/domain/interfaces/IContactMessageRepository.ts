import { ContactMessageModel } from '@domain/models/ContactMessage';

export interface IContactMessageRepository {
  findUnread(): Promise<ContactMessageModel[]>;
  markAsRead(id: string): Promise<ContactMessageModel | null>;
}
