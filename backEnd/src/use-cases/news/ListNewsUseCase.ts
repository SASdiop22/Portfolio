import { INewsRepository } from '@domain/interfaces/INewsRepository';
import { NewsModel } from '@domain/models/News';

export class ListNewsUseCase {
  constructor(private readonly repository: INewsRepository) {}

  async execute(): Promise<NewsModel[]> {
    return this.repository.findByOrder();
  }
}
