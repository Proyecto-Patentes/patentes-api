import { Hono } from "hono";
import { getPool } from "../db.js";

const router = new Hono();

router.get("/", async (c) => {
  const db = getPool();
  const [rows] = await db.query(
    "SELECT id, name, country_code, format FROM vehicle_type ORDER BY id ASC"
  );
  // group by name + country_code
  const map: Record<string, { name: string; country_code: string; formats: Array<{ id: number; format: string }> }> = {};
  for (const r of rows as any[]) {
    const key = `${r.name}|${r.country_code}`;
    if (!map[key]) {
      map[key] = { name: r.name, country_code: r.country_code, formats: [] };
    }
    map[key].formats.push({ id: r.id, format: r.format });
  }
  return c.json(Object.values(map));
});

export default router;
