import { GetSocialLinkUseCase } from './GetSocialLinkUseCase';
import { SocialLinkModel } from '@domain/models/SocialLink';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface ISocialLinkFinder {
  findById(id: string): Promise<SocialLinkModel | null>;
}

describe('GetSocialLinkUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new SocialLinkModel();
    const repository: ISocialLinkFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetSocialLinkUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ISocialLinkFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetSocialLinkUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
