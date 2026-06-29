import { DeleteSocialLinkUseCase } from './DeleteSocialLinkUseCase';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface ISocialLinkDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteSocialLinkUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: ISocialLinkDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteSocialLinkUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ISocialLinkDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteSocialLinkUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
