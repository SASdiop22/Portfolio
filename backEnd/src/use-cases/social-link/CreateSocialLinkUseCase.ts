import { SocialLinkModel } from '@domain/models/SocialLink';
import { CreateSocialLinkDto } from '@infrastructure/dto/social-link/CreateSocialLinkDto';

export interface ISocialLinkCreator {
  create(data: Partial<SocialLinkModel>): Promise<SocialLinkModel>;
}

export class CreateSocialLinkUseCase {
  constructor(private readonly repository: ISocialLinkCreator) {}

  async execute(data: CreateSocialLinkDto): Promise<SocialLinkModel> {
    return this.repository.create(data);
  }
}
