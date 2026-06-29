import { UpdateSocialLinkUseCase } from './UpdateSocialLinkUseCase';
import { SocialLinkModel } from '@domain/models/SocialLink';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface ISocialLinkUpdater {
  update(id: string, data: Partial<SocialLinkModel>): Promise<SocialLinkModel | null>;
}

describe('UpdateSocialLinkUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new SocialLinkModel();
    const repository: ISocialLinkUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateSocialLinkUseCase(repository);

    const result = await sut.execute('1', { url: 'https://new-url.com' });

    expect(repository.update).toHaveBeenCalledWith('1', { url: 'https://new-url.com' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ISocialLinkUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateSocialLinkUseCase(repository);

    await expect(sut.execute('missing', { url: 'https://x.com' })).rejects.toThrow(NotFoundException);
  });
});
