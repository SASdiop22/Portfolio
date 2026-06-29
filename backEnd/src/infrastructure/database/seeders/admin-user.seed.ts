import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { UserEntity } from '@infrastructure/entities/UserEntity';
import { envConfig } from '@config/env.config';

async function seedAdminUser(): Promise<void> {
  await AppDataSource.initialize();
  const repository = AppDataSource.getRepository(UserEntity);

  const existing = await repository.findOne({ where: { email: envConfig.admin.email } });

  if (existing) {
    console.log(`Admin user ${envConfig.admin.email} already exists — nothing to do.`);
    await AppDataSource.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash(envConfig.admin.password, 10);

  const admin = repository.create({
    firstName: 'Admin',
    lastName: 'User',
    email: envConfig.admin.email,
    password: hashedPassword,
    birthDate: new Date('1990-01-01'),
    desiredPosition: 'N/A',
    tagline: 'N/A',
  });

  await repository.save(admin);
  console.log(`Admin user ${envConfig.admin.email} created.`);
  await AppDataSource.destroy();
}

seedAdminUser().catch((error) => {
  console.error('Failed to seed admin user:', error);
  process.exit(1);
});
