import { ISocialLinkRepository } from '@domain/interfaces/ISocialLinkRepository';
import { SocialLinkModel } from '@domain/models/SocialLink';

export class ListSocialLinkUseCase {
  constructor(private readonly repository: ISocialLinkRepository) {}

  async execute(): Promise<SocialLinkModel[]> {
    return this.repository.findByOrder();
  }
}
