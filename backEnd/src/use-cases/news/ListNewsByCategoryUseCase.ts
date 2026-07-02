import { INewsRepository } from '@domain/interfaces/INewsRepository';
import { NewsModel } from '@domain/models/News';

export class ListNewsByCategoryUseCase {
  constructor(private readonly repository: INewsRepository) {}

  async execute(category: string): Promise<NewsModel[]> {
    return this.repository.findByCategory(category);
  }
}
