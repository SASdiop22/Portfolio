import { IContactMessageRepository } from '@domain/interfaces/IContactMessageRepository';
import { ContactMessageModel } from '@domain/models/ContactMessage';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export class MarkContactMessageAsReadUseCase {
  constructor(private readonly repository: IContactMessageRepository) {}

  async execute(id: string): Promise<ContactMessageModel> {
    const updated = await this.repository.markAsRead(id);

    if (!updated) {
      throw new NotFoundException('Contact message not found');
    }

    return updated;
  }
}
