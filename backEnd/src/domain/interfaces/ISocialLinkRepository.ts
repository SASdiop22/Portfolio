import { SocialLinkModel } from '../models/SocialLink';

export interface ISocialLinkRepository {
  findByOrder(): Promise<SocialLinkModel[]>;
}
