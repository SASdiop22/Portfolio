import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { ProjectModel } from '@domain/models/Project';
import { ProjectEntity } from '@infrastructure/entities/ProjectEntity';
import { IProjectRepository } from '@domain/interfaces/IProjectRepository';

export class ProjectRepository
  extends BaseRepository<ProjectModel, ProjectEntity>
  implements IProjectRepository
{
  constructor(repository: Repository<ProjectEntity>) {
    super(repository);
  }

  protected toModel(entity: ProjectEntity): ProjectModel {
    const model = new ProjectModel();
    model.id = entity.id;
    model.title = entity.title;
    model.description = entity.description;
    model.longDescription = entity.longDescription ?? '';
    model.technologies = entity.technologies;
    model.imageUrl = entity.imageUrl ?? '';
    model.demoUrl = entity.demoUrl ?? '';
    model.githubUrl = entity.githubUrl ?? '';
    model.featured = entity.featured;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<ProjectModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findFeatured(): Promise<ProjectModel[]> {
    const entities = await this.repository.find({
      where: { featured: true },
      order: { order: 'ASC' },
    });
    return entities.map((entity) => this.toModel(entity));
  }
}
