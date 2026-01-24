import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";

import { registerRoutes } from "./routes";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage/routes";
import { setupVite, serveStatic, serveIndexHtmlFallback, log } from "./vite";
import { connectDB } from "./db";
import { seedDatabase } from "./seed";
import { startAccountDeletionJob } from "./jobs/accountDeletionJob";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cors({
  exposedHeaders: ["ETag"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await connectDB();
  await seedDatabase();
  startAccountDeletionJob();
  registerObjectStorageRoutes(app);
  await registerRoutes(app);

  // Register frontend fallback/static serving BEFORE error handler
  if (process.env.NODE_ENV === "development") {
    // Agar external Vite (5173) chala rahe ho, to backend me Vite middleware mat lagao
    if (process.env.EXTERNAL_VITE !== "true") {
      await setupVite(app);
    } else {
      // For external Vite, serve index.html for non-API routes as fallback
      serveIndexHtmlFallback(app);
    }
  } else {
    serveStatic(app);
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Global error handler caught:", err);
    const status = (err as { status?: number }).status || (err as { statusCode?: number }).statusCode || 500;
    const message = (err as { message?: string }).message || "Internal Server Error";

    // Only send response if not already sent
    if (!res.headersSent) {
      res.status(status).json({ error: message });
    }
  });

const port = Number(process.env.PORT) || 5011;

  app.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
