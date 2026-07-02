import 'reflect-metadata';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Charger .env AVANT tout
dotenv.config({ path: resolve(__dirname, '../.env') });

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { envConfig } from './config/env.config';
import { initializeDatabase } from './infrastructure/database/config/data-source';
import { errorMiddleware } from '@infrastructure/middlewares/error.middleware';
import apiRoutes from '@infrastructure/routes';

// Initialiser l'application Express
const app: Application = express();

// ========================================
// MIDDLEWARES
// ========================================

// Sécurité HTTP headers
app.use(helmet());

// CORS - Autoriser les requêtes depuis le frontend
app.use(
  cors({
    origin: envConfig.frontendUrl,
    credentials: true,
  }),
);

// Rate limiting global : 200 req/15min par IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Trop de requêtes, réessayez dans 15 minutes.' },
  }),
);

// Rate limiting strict sur l'authentification : 10 req/15min par IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de tentatives de connexion, réessayez dans 15 minutes.' },
});
app.use(`${envConfig.apiPrefix}/auth`, authLimiter);

// Parser JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static('uploads'));

// ========================================
// ROUTES
// ========================================

// Route de test
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🚀 Portfolio API is running',
    version: '1.0.0',
    environment: envConfig.nodeEnv,
  });
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

app.use(envConfig.apiPrefix, apiRoutes);

// ========================================
// GESTION DES ERREURS
// ========================================

// Route 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.path,
  });
});

// Gestionnaire d'erreurs global
app.use(errorMiddleware);

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

const startServer = async () => {
  try {
    // 1. Connexion à la base de données
    await initializeDatabase();

    // 2. Démarrer le serveur
    app.listen(envConfig.port, () => {
      console.log('\n🚀 ================================');
      console.log(`✅ Serveur démarré avec succès`);
      console.log(`📡 Port: ${envConfig.port}`);
      console.log(`🌍 URL: http://localhost:${envConfig.port}`);
      console.log(`📝 Environment: ${envConfig.nodeEnv}`);
      console.log('🚀 ================================\n');
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
};

// Lancer le serveur
startServer();

export default app;
