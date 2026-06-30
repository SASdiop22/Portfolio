import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { LanguageModel } from '@domain/models/Language';
import { LanguageEntity } from '@infrastructure/entities/LanguageEntity';
import { ILanguageRepository } from '@domain/interfaces/ILanguageRepository';

export class LanguageRepository
  extends BaseRepository<LanguageModel, LanguageEntity>
  implements ILanguageRepository
{
  constructor(repository: Repository<LanguageEntity>) {
    super(repository);
  }

  protected toModel(entity: LanguageEntity): LanguageModel {
    const model = new LanguageModel();
    model.id = entity.id;
    model.title = entity.title;
    model.level = entity.level;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<LanguageModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
