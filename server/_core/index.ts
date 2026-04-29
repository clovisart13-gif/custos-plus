import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Export endpoint
  app.get("/api/export", async (req, res) => {
    try {
      const { getDb } = await import("../db");
      const db = await getDb();
      
      if (!db) {
        return res.status(500).json({
          success: false,
          error: "Database not available"
        });
      }
      
      const { fichasCusto, orcamentos, itensOrcamento } = await import("../../drizzle/schema");
      
      const fichasData = await db.select().from(fichasCusto);
      const orcamentosData = await db.select().from(orcamentos);
      const itensData = await db.select().from(itensOrcamento);
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          fichas_custo: fichasData,
          orcamentos: orcamentosData,
          itens_orcamento: itensData,
          summary: {
            total_fichas: fichasData.length,
            total_orcamentos: orcamentosData.length,
            total_itens: itensData.length,
          }
        }
      });
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
