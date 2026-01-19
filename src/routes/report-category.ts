import { Hono } from "hono";
import { getPool } from "../db.js";

const router = new Hono();

router.get("/", async (c) => {
  const db = getPool();
  const [rows] = await db.query(
    "SELECT id, report_category, lang FROM report_category ORDER BY id ASC"
  );
  return c.json(rows);
});

router.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!id || Number.isNaN(id)) return c.json({ detail: "Invalid id" }, 422);

  const db = getPool();
  const [rows] = await db.query(
    "SELECT id, report_category, lang FROM report_category WHERE id = ?",
    [id]
  );
  const row = (rows as any[])[0];
  return row ? c.json(row) : c.json({ detail: "Report category not found" }, 404);
});

export default router;

