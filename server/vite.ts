import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// Project root ko CWD se find karo (upar tak walk karke vite.config.* dhundega)
function findProjectRoot(startDir: string) {
  let dir = startDir;

  for (let i = 0; i < 8; i++) {
    const hasViteConfig =
      fs.existsSync(path.join(dir, "vite.config.ts")) ||
      fs.existsSync(path.join(dir, "vite.config.js")) ||
      fs.existsSync(path.join(dir, "vite.config.mjs"));

    if (hasViteConfig) return dir;

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return startDir;
}

const rootPath = findProjectRoot(process.cwd());
const distPath = path.resolve(rootPath, "dist", "public");

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express) {
  // ✅ Vite ko runtime pe sirf dev me load karo (prod logs me CJS warning bhi nahi aayegi)
  const { createServer } = await import("vite");

  const vite = await createServer({
    configFile: path.resolve(rootPath, "vite.config.ts"),
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);
}

export function serveIndexHtmlFallback(app: Express) {
  // For development mode with external Vite - serve index.html for non-API routes
  const indexPath = path.resolve(rootPath, "client", "index.html");

  if (!fs.existsSync(indexPath)) {
    log("Warning: client/index.html not found", "express");
    return;
  }

  app.use((req, res, next) => {
    // Skip API routes and static files
    if (req.path.startsWith("/api") || /\.[a-z]+$/i.test(req.path)) {
      return next();
    }
    res.sendFile(indexPath);
  });
}

export function serveStatic(app: Express) {
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, { maxAge: "1d" }));

  // ✅ Express 5 me "*" invalid hai, isliye no-path middleware use karo
  app.use((req, res) => {
    // /api ka unknown route ho to index.html mat do, 404 do
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "Not Found" });
    }
    return res.sendFile(path.resolve(distPath, "index.html"));
  });
}
