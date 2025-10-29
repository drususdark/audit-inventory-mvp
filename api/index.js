// Vercel Serverless Function - Entry point for Express backend
import { createApp } from '../server/app.js';

let app;

// Export the Express app as a Vercel serverless function
export default function handler(req, res) {
  if (!app) {
    app = createApp();
  }
  return app(req, res);
}

