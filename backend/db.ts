import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER!,
      password: process.env.DB_PASS!,
      database: process.env.DB_NAME!,
      ssl: process.env.SSL_CA ? { ca: process.env.SSL_CA } : undefined,
      connectionLimit: 5,
      waitForConnections: true,
    });
  }
  return pool;
}
