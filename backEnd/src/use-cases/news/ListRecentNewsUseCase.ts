import { INewsRepository } from '@domain/interfaces/INewsRepository';
import { NewsModel } from '@domain/models/News';

export class ListRecentNewsUseCase {
  constructor(private readonly repository: INewsRepository) {}

  async execute(limit: number): Promise<NewsModel[]> {
    return this.repository.findRecent(limit);
  }
}
