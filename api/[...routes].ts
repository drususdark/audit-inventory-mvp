import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { serveStatic } from "../server/_core/vite";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let app: express.Express | null = null;

function createApp(): express.Express {
  const app = express();

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Add error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[Express Error]", err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    });
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error, type, path, input, ctx, req }) => {
        console.error("[TRPC Error]", {
          type,
          path,
          error: error.message,
          code: error.code,
        });
      },
    })
  );

  // Serve static files
  serveStatic(app);

  return app;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!app) {
    app = createApp();
  }
  return app(req, res);
}
