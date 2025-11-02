// Vercel Serverless Function - Entry point for Express backend
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../dist/server/routers.js';
import { createContext } from '../dist/server/_core/context.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let app;

function createApp() {
  const app = express();

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // tRPC API
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Serve static files from the public directory
  const staticDir = path.join(__dirname, '../dist/public');
  app.use(express.static(staticDir));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });

  return app;
}

// Export the Express app as a Vercel serverless function
export default function handler(req, res) {
  if (!app) {
    app = createApp();
  }
  return app(req, res);
}

