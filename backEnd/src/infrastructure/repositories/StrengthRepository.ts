import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { StrengthModel } from '@domain/models/Strength';
import { StrengthEntity } from '@infrastructure/entities/StrengthEntity';
import { IStrengthRepository } from '@domain/interfaces/IStrengthRepository';

export class StrengthRepository
  extends BaseRepository<StrengthModel, StrengthEntity>
  implements IStrengthRepository
{
  constructor(repository: Repository<StrengthEntity>) {
    super(repository);
  }

  protected toModel(entity: StrengthEntity): StrengthModel {
    const model = new StrengthModel();
    model.id = entity.id;
    model.title = entity.title;
    model.description = entity.description;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<StrengthModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
