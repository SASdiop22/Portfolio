import { SocialLinkModel } from '@domain/models/SocialLink';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface ISocialLinkFinder {
  findById(id: string): Promise<SocialLinkModel | null>;
}

export class GetSocialLinkUseCase {
  constructor(private readonly repository: ISocialLinkFinder) {}

  async execute(id: string): Promise<SocialLinkModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Social link not found');
    }

    return entry;
  }
}
