import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log("[Health Check] Request received");
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? "configured" : "not configured",
    };
    console.log("[Health Check] Response:", health);
    res.status(200).json(health);
  } catch (error) {
    console.error("[Health Check] Error:", error);
    res.status(500).json({ error: "Health check failed" });
  }
}
