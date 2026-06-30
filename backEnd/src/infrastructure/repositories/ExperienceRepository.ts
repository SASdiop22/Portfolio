import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { ExperienceModel } from '@domain/models/Experience';
import { ExperienceEntity } from '@infrastructure/entities/ExperienceEntity';
import { IExperienceRepository } from '@domain/interfaces/IExperienceRepository';

export class ExperienceRepository
  extends BaseRepository<ExperienceModel, ExperienceEntity>
  implements IExperienceRepository
{
  constructor(repository: Repository<ExperienceEntity>) {
    super(repository);
  }

  protected toModel(entity: ExperienceEntity): ExperienceModel {
    const model = new ExperienceModel();
    model.id = entity.id;
    model.company = entity.company;
    model.position = entity.position;
    model.city = entity.city;
    model.title = entity.title;
    model.description = entity.description;
    model.startDate = entity.startDate;
    model.endDate = entity.endDate ?? (null as unknown as Date);
    model.current = entity.current;
    model.link = entity.link ?? '';
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<ExperienceModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findCurrent(): Promise<ExperienceModel[]> {
    const entities = await this.repository.find({
      where: { current: true },
      order: { order: 'ASC' },
    });
    return entities.map((entity) => this.toModel(entity));
  }
}
