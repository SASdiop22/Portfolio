import { SocialLinkModel } from '@domain/models/SocialLink';

export interface ISocialLinkRepository {
  findByOrder(): Promise<SocialLinkModel[]>;
}
