import { CreateNewsUseCase } from './CreateNewsUseCase';
import { NewsModel } from '@domain/models/News';

interface INewsCreator {
  create(data: Partial<NewsModel>): Promise<NewsModel>;
}

describe('CreateNewsUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new NewsModel();
    const repository: INewsCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateNewsUseCase(repository);
    const input = { title: 'New milestone', content: 'content', summary: 'summary', category: 'career' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
