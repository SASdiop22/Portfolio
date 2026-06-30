import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { NewsModel } from '@domain/models/News';
import { NewsEntity } from '@infrastructure/entities/NewsEntity';
import { INewsRepository } from '@domain/interfaces/INewsRepository';

export class NewsRepository extends BaseRepository<NewsModel, NewsEntity> implements INewsRepository {
  constructor(repository: Repository<NewsEntity>) {
    super(repository);
  }

  protected toModel(entity: NewsEntity): NewsModel {
    const model = new NewsModel();
    model.id = entity.id;
    model.title = entity.title;
    model.content = entity.content;
    model.summary = entity.summary;
    model.category = entity.category;
    model.imageUrl = entity.imageUrl ?? '';
    model.publishedAt = entity.publishedAt;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<NewsModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findByCategory(category: string): Promise<NewsModel[]> {
    const entities = await this.repository.find({ where: { category }, order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findRecent(limit: number): Promise<NewsModel[]> {
    const entities = await this.repository.find({ order: { publishedAt: 'DESC' }, take: limit });
    return entities.map((entity) => this.toModel(entity));
  }
}
