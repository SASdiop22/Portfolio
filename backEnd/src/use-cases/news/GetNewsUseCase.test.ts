import { GetNewsUseCase } from './GetNewsUseCase';
import { NewsModel } from '@domain/models/News';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface INewsFinder {
  findById(id: string): Promise<NewsModel | null>;
}

describe('GetNewsUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new NewsModel();
    const repository: INewsFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetNewsUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: INewsFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetNewsUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
