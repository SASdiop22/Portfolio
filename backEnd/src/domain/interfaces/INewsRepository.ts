import { NewsModel } from '../models/News';

export interface INewsRepository {
  findByCategory(category: string): Promise<NewsModel[]>;
  findByOrder(): Promise<NewsModel[]>;
  findRecent(limit: number): Promise<NewsModel[]>;
}
