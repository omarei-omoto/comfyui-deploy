import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const isDevContainer = process.env.REMOTE_CONTAINERS !== undefined;

// Only configure Neon when NOT on Vercel build/runtime
if (!process.env.VERCEL) {
  if (isDevContainer) {
    neonConfig.wsProxy = () => "host.docker.internal:5481/v1";
  } else {
    neonConfig.wsProxy = (host) => `${host}:5481/v1`;
  }

  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

let _db: ReturnType<typeof neonDrizzle> | null = null;

export function getDB() {
  // This prevents Vercel from trying to connect to Neon/Railway during build
  if (process.env.VERCEL === "1") {
    throw new Error("Database is not available on Vercel. Use Railway API instead.");
  }

  if (!_db) {
    _db = neonDrizzle(
      new Pool({
        connectionString: process.env.POSTGRES_URL,
      }),
      {
        schema,
      },
    );
  }

  return _db;
}
