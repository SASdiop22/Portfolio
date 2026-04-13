import { SocialLink } from '../models/SocialLink';
import { IBaseRepository } from './IBaseRepository';

export interface ISocialLinkRepository extends IBaseRepository<SocialLink> {
  findByOrder(): Promise<SocialLink[]>;
}
