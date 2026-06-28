import { NewsModel } from '@domain/models';

export interface INewsRepository {
  findByCategory(category: string): Promise<NewsModel[]>;
  findByOrder(): Promise<NewsModel[]>;
  findRecent(limit: number): Promise<NewsModel[]>;
}
