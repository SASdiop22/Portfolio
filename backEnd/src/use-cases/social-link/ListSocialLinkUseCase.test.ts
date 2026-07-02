import { ListSocialLinkUseCase } from './ListSocialLinkUseCase';
import { ISocialLinkRepository } from '@domain/interfaces/ISocialLinkRepository';
import { SocialLinkModel } from '@domain/models/SocialLink';

describe('ListSocialLinkUseCase', () => {
  it('returns every social link ordered by the repository', async () => {
    const entries = [new SocialLinkModel(), new SocialLinkModel()];
    const repository: ISocialLinkRepository = { findByOrder: jest.fn().mockResolvedValue(entries) };
    const sut = new ListSocialLinkUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
