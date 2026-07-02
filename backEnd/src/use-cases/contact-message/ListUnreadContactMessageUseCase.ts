import { IContactMessageRepository } from '@domain/interfaces/IContactMessageRepository';
import { ContactMessageModel } from '@domain/models/ContactMessage';

export class ListUnreadContactMessageUseCase {
  constructor(private readonly repository: IContactMessageRepository) {}

  async execute(): Promise<ContactMessageModel[]> {
    return this.repository.findUnread();
  }
}
