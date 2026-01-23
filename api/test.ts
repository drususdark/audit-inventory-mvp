import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log("[Test API] Request received", { method: req.method, path: req.url });
    
    if (req.method === "GET") {
      res.status(200).json({
        message: "Test API is working",
        timestamp: new Date().toISOString(),
      });
    } else if (req.method === "POST") {
      const body = req.body;
      res.status(200).json({
        message: "Test API POST is working",
        received: body,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("[Test API] Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
