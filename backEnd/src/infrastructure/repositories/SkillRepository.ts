import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { SkillModel } from '@domain/models/Skill';
import { SkillEntity } from '@infrastructure/entities/SkillEntity';
import { ISkillRepository } from '@domain/interfaces/ISkillRepository';

export class SkillRepository extends BaseRepository<SkillModel, SkillEntity> implements ISkillRepository {
  constructor(repository: Repository<SkillEntity>) {
    super(repository);
  }

  protected toModel(entity: SkillEntity): SkillModel {
    const model = new SkillModel();
    model.id = entity.id;
    model.title = entity.title;
    model.category = entity.category;
    model.level = entity.level ?? 0;
    model.icon = entity.icon ?? '';
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<SkillModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findByCategory(category: string): Promise<SkillModel[]> {
    const entities = await this.repository.find({ where: { category }, order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findAllCategories(): Promise<string[]> {
    const rows = await this.repository
      .createQueryBuilder('skill')
      .select('DISTINCT skill.category', 'category')
      .getRawMany<{ category: string }>();
    return rows.map((row) => row.category);
  }
}
