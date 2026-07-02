import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { UserModel } from '@domain/models/User';
import { UserEntity } from '@infrastructure/entities/UserEntity';
import { IUserRepository } from '@domain/interfaces/IUserRepository';

export class UserRepository
  extends BaseRepository<UserModel, UserEntity>
  implements IUserRepository
{
  constructor(repository: Repository<UserEntity>) {
    super(repository);
  }

  protected toModel(entity: UserEntity): UserModel {
    const model = new UserModel();
    model.id = entity.id;
    model.firstName = entity.firstName;
    model.lastName = entity.lastName;
    model.email = entity.email;
    model.password = entity.password;
    model.birthDate = entity.birthDate;
    model.desiredPosition = entity.desiredPosition;
    model.tagline = entity.tagline;
    model.photo = entity.photo ?? '';
    model.city = entity.city ?? '';
    model.mobility = entity.mobility ?? '';
    model.phone = entity.phone ?? '';
    model.ctaTitle = entity.ctaTitle ?? '';
    model.ctaText = entity.ctaText ?? '';
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toModel(entity) : null;
  }
}
