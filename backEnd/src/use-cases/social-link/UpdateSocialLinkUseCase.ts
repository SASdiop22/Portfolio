import { SocialLinkModel } from '@domain/models/SocialLink';
import { UpdateSocialLinkDto } from '@infrastructure/dto/social-link/UpdateSocialLinkDto';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

export interface ISocialLinkUpdater {
  update(id: string, data: Partial<SocialLinkModel>): Promise<SocialLinkModel | null>;
}

export class UpdateSocialLinkUseCase {
  constructor(private readonly repository: ISocialLinkUpdater) {}

  async execute(id: string, data: UpdateSocialLinkDto): Promise<SocialLinkModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Social link not found');
    }

    return updated;
  }
}
