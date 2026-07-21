import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load configuration variables
dotenv.config();

const requiredEnvVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  const errorMessage = `[MySQL Connection Error] Missing required environment variables: ${missingEnvVars.join(", ")}. Please define them in your environment / .env file.`;
  console.error("❌ " + errorMessage);
  throw new Error(errorMessage);
}

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

console.log("[MySQL Configuration] Attempting connection pool setup for host:", dbConfig.host);

let pool: mysql.Pool | null = null;

/**
 * Returns the initialized MySQL connection pool.
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * Verifies that we can connect to the Hostinger MySQL database.
 * Returns true if successful, false otherwise.
 */
export async function testMySQLConnection(): Promise<boolean> {
  try {
    const currentPool = getPool();
    // Grab a connection from the pool to test
    const connection = await currentPool.getConnection();
    console.log("✅ MySQL Connection Test: Connection pool verified successfully.");
    connection.release();
    return true;
  } catch (error: any) {
    console.warn("⚠️ MySQL Connection Test Warning: Could not establish connection to the database.");
    console.warn("   Error Message:", error.message || error);
    console.warn("   Error Code:", error.code || "N/A");
    console.warn("   💡 Hostinger Setup Tip: Ensure Remote MySQL is enabled for wildcard (%) or your current client IP in Hostinger hPanel.");
    return false;
  }
}
