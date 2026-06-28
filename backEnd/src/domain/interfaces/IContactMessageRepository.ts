import { ContactMessageModel } from '@domain/models';

export interface IContactMessageRepository {
  findUnread(): Promise<ContactMessageModel[]>;
  markAsRead(id: string): Promise<ContactMessageModel | null>;
}
