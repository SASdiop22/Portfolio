import { DataSource, DataSourceOptions } from 'typeorm';
import { envConfig } from '../../../config/env.config';
import * as entities from '../../entities';

const isProduction = envConfig.nodeEnv === 'production';
const databaseUrl = process.env.DATABASE_URL;

const baseOptions: Partial<DataSourceOptions> = {
  type: 'postgres',
  synchronize: !isProduction,
  logging: !isProduction,
  entities: Object.values(entities),
  migrations: ['src/infrastructure/database/migrations/**/*.ts'],
  subscribers: [],
};

const connectionOptions: DataSourceOptions = databaseUrl
  ? {
      ...baseOptions,
      type: 'postgres',
      url: databaseUrl,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      ...baseOptions,
      type: 'postgres',
      host: envConfig.database.host,
      port: envConfig.database.port,
      username: envConfig.database.username,
      password: envConfig.database.password,
      database: envConfig.database.database,
    };

export const AppDataSource = new DataSource(connectionOptions);

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de données connectée avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    throw error;
  }
};