import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { ContactMessageModel } from '@domain/models/ContactMessage';
import { ContactMessageEntity } from '@infrastructure/entities/ContactMessageEntity';
import { IContactMessageRepository } from '@domain/interfaces/IContactMessageRepository';

export class ContactMessageRepository
  extends BaseRepository<ContactMessageModel, ContactMessageEntity>
  implements IContactMessageRepository
{
  constructor(repository: Repository<ContactMessageEntity>) {
    super(repository);
  }

  protected toModel(entity: ContactMessageEntity): ContactMessageModel {
    const model = new ContactMessageModel();
    model.id = entity.id;
    model.name = entity.name;
    model.email = entity.email;
    model.subject = entity.subject;
    model.message = entity.message;
    model.read = entity.read;
    model.createdAt = entity.createdAt;
    return model;
  }

  async findUnread(): Promise<ContactMessageModel[]> {
    const entities = await this.repository.find({ where: { read: false }, order: { createdAt: 'DESC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async markAsRead(id: string): Promise<ContactMessageModel | null> {
    return this.update(id, { read: true });
  }
}
