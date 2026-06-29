import 'reflect-metadata';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Charger .env AVANT tout
dotenv.config({ path: resolve(__dirname, '../.env') });

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { envConfig } from './config/env.config';
import { initializeDatabase } from './infrastructure/database/config/data-source';
import { errorMiddleware } from '@infrastructure/middlewares/error.middleware';

// Initialiser l'application Express
const app: Application = express();

// ========================================
// MIDDLEWARES
// ========================================

// CORS - Autoriser les requêtes depuis le frontend
app.use(
  cors({
    origin: envConfig.frontendUrl,
    credentials: true,
  }),
);

// Parser JSON et URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static('uploads'));

// ========================================
// ROUTES
// ========================================

// Route de test
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🚀 Portfolio API is running',
    version: '1.0.0',
    environment: envConfig.nodeEnv,
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Ajouter les routes API ici
// app.use(`${envConfig.apiPrefix}/projects`, projectRoutes);
// app.use(`${envConfig.apiPrefix}/skills`, skillRoutes);
// etc...

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
