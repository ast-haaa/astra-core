import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./db";
import { log } from "./index";
import path from "path";

export async function initializeDatabase() {
  try {
    log("Initializing database...", "database");
    
    // Run migrations
    const migrationsFolder = path.join(process.cwd(), "migrations");
    await migrate(db, { 
      migrationsFolder,
      migrationsSchema: "public"
    });
    
    log("Database migrations completed successfully", "database");
    return true;
  } catch (error: any) {
    // If migrations folder doesn't exist yet, that's okay - happens on first run
    if (error.code === "ENOENT" || error.message?.includes("no such file")) {
      log("No migrations folder found - this is expected on first deployment", "database");
      return true;
    }
    
    // For other errors, log but don't fail - the app might still work
    log(`Database initialization warning: ${error.message}`, "database");
    return true;
  }
}

export async function closeDatabase() {
  try {
    await pool.end();
    log("Database pool closed", "database");
  } catch (error: any) {
    log(`Error closing database pool: ${error.message}`, "database");
  }
}
