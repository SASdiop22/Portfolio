import { DataSource } from 'typeorm';
import { envConfig } from '../../../config/env.config';
import * as entities from '../../entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: envConfig.database.host,
  port: envConfig.database.port,
  username: envConfig.database.username,
  password: envConfig.database.password,
  database: envConfig.database.database,
  synchronize: envConfig.nodeEnv === 'development', // ⚠️ Seulement en dev
  logging: envConfig.nodeEnv === 'development',
  entities: Object.values(entities),
  migrations: ['src/infrastructure/database/migrations/**/*.ts'],
  subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de données connectée avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    throw error;
  }
};
