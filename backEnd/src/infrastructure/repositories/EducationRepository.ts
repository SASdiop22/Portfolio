import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { EducationModel } from '@domain/models/Education';
import { EducationEntity } from '@infrastructure/entities/EducationEntity';
import { IEducationRepository } from '@domain/interfaces/IEducationRepository';

export class EducationRepository
  extends BaseRepository<EducationModel, EducationEntity>
  implements IEducationRepository
{
  constructor(repository: Repository<EducationEntity>) {
    super(repository);
  }

  protected toModel(entity: EducationEntity): EducationModel {
    const model = new EducationModel();
    model.id = entity.id;
    model.institution = entity.institution;
    model.city = entity.city;
    model.title = entity.title;
    model.specialization = entity.specialization;
    model.description = entity.description;
    model.startDate = entity.startDate;
    model.endDate = entity.endDate ?? null as unknown as Date;
    model.current = entity.current;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<EducationModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findCurrent(): Promise<EducationModel[]> {
    const entities = await this.repository.find({ where: { current: true }, order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
