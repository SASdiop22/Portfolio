import { NewsModel } from '@domain/models/News';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface INewsFinder {
  findById(id: string): Promise<NewsModel | null>;
}

export class GetNewsUseCase {
  constructor(private readonly repository: INewsFinder) {}

  async execute(id: string): Promise<NewsModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('News not found');
    }

    return entry;
  }
}
