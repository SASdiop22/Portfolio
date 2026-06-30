import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { InterestModel } from '@domain/models/Interest';
import { InterestEntity } from '@infrastructure/entities/InterestEntity';
import { IInterestRepository } from '@domain/interfaces/IInterestRepository';

export class InterestRepository
  extends BaseRepository<InterestModel, InterestEntity>
  implements IInterestRepository
{
  constructor(repository: Repository<InterestEntity>) {
    super(repository);
  }

  protected toModel(entity: InterestEntity): InterestModel {
    const model = new InterestModel();
    model.id = entity.id;
    model.title = entity.title;
    model.description = entity.description;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<InterestModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
