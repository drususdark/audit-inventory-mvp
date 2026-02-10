import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log("[Debug TRPC] Request received", { method: req.method, path: req.url, body: req.body });
    
    // Try to import and test the TRPC router
    const { appRouter } = await import("../server/routers");
    const { createContext } = await import("../server/_core/context");
    
    console.log("[Debug TRPC] Router imported successfully");
    
    // Create a mock context
    const mockContext = await createContext({
      req: req as any,
      res: res as any,
    });
    
    console.log("[Debug TRPC] Context created successfully");
    
    // Try to call the locals.list procedure
    const caller = appRouter.createCaller(mockContext);
    const locals = await caller.locals.list();
    
    console.log("[Debug TRPC] locals.list called successfully, result:", locals);
    
    res.status(200).json({
      message: "Debug TRPC successful",
      locals,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Debug TRPC] Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
