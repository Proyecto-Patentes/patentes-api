import { Hono } from "hono";
import { getPool } from "../db.js";

const router = new Hono();

router.get("/", async (c) => {
  const db = getPool();
  const [rows] = await db.query(
    "SELECT id, name, country_code, format FROM vehicle_type ORDER BY id ASC"
  );
  return c.json(rows);
});

export default router;
