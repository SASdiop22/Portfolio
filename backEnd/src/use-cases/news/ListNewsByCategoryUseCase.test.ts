import { ListNewsByCategoryUseCase } from './ListNewsByCategoryUseCase';
import { INewsRepository } from '@domain/interfaces/INewsRepository';
import { NewsModel } from '@domain/models/News';

describe('ListNewsByCategoryUseCase', () => {
  it('returns news filtered by category', async () => {
    const entries = [new NewsModel()];
    const repository: INewsRepository = {
      findByOrder: jest.fn(),
      findByCategory: jest.fn().mockResolvedValue(entries),
      findRecent: jest.fn(),
    };
    const sut = new ListNewsByCategoryUseCase(repository);

    const result = await sut.execute('career');

    expect(repository.findByCategory).toHaveBeenCalledWith('career');
    expect(result).toBe(entries);
  });
});
