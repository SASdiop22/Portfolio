import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { SocialLinkModel } from '@domain/models/SocialLink';
import { SocialLinkEntity } from '@infrastructure/entities/SocialLinkEntity';
import { ISocialLinkRepository } from '@domain/interfaces/ISocialLinkRepository';

export class SocialLinkRepository
  extends BaseRepository<SocialLinkModel, SocialLinkEntity>
  implements ISocialLinkRepository
{
  constructor(repository: Repository<SocialLinkEntity>) {
    super(repository);
  }

  protected toModel(entity: SocialLinkEntity): SocialLinkModel {
    const model = new SocialLinkModel();
    model.id = entity.id;
    model.platform = entity.platform;
    model.url = entity.url;
    model.logo = entity.logo ?? '';
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<SocialLinkModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
