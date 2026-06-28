import { SocialLinkModel } from '@domain/models';

export interface ISocialLinkRepository {
  findByOrder(): Promise<SocialLinkModel[]>;
}
