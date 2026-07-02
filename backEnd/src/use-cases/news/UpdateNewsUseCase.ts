import { NewsModel } from '@domain/models/News';
import { UpdateNewsDto } from '@infrastructure/dto/news/UpdateNewsDto';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface INewsUpdater {
  update(id: string, data: Partial<NewsModel>): Promise<NewsModel | null>;
}

export class UpdateNewsUseCase {
  constructor(private readonly repository: INewsUpdater) {}

  async execute(id: string, data: UpdateNewsDto): Promise<NewsModel> {
    const updated = await this.repository.update(id, data as unknown as Partial<NewsModel>);

    if (!updated) {
      throw new NotFoundException('News not found');
    }

    return updated;
  }
}
