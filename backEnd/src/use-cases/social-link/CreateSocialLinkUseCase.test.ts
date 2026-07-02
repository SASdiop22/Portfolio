import { CreateSocialLinkUseCase } from './CreateSocialLinkUseCase';
import { SocialLinkModel } from '@domain/models/SocialLink';

interface ISocialLinkCreator {
  create(data: Partial<SocialLinkModel>): Promise<SocialLinkModel>;
}

describe('CreateSocialLinkUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new SocialLinkModel();
    const repository: ISocialLinkCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateSocialLinkUseCase(repository);
    const input = { platform: 'GitHub', url: 'https://github.com/example' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
