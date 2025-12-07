import { Hono } from "hono";
import { getPool } from "../db.js";

const router = new Hono();

router.get("/", async (c) => {
  const db = getPool();
  const [rows] = await db.query("SELECT id, plate FROM plate ORDER BY id DESC");
  return c.json(rows);
});

router.post("/", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { plate?: string } | null;
  const value = body?.plate?.trim();
  if (!value) return c.json({ detail: "Invalid body" }, 422);

  const db = getPool();
  const [res] = await db.execute("INSERT INTO plate (plate) VALUES (?)", [value]);
  const id = (res as any).insertId;

  const [rows] = await db.query("SELECT id, plate FROM plate WHERE id = ?", [id]);
  return c.json((rows as any[])[0], 201);
});

router.get("/search", async (c) => {
  const id = c.req.query("id");
  const plate = c.req.query("plate");
  const partial = (c.req.query("partial") || "false").toLowerCase() === "true";
  const limitQ = c.req.query("limit");
  const offsetQ = c.req.query("offset");

  let sql = "SELECT id, plate FROM plate WHERE 1=1";
  const params: any[] = [];

  if (id) { sql += " AND id = ?"; params.push(Number(id)); }
  if (plate) {
    if (partial) { sql += " AND plate LIKE ?"; params.push(`%${plate}%`); }
    else         { sql += " AND plate = ?";     params.push(plate); }
  }

  sql += " ORDER BY id DESC";
  if (offsetQ) { sql += " OFFSET ?"; params.push(Number(offsetQ)); }
  if (limitQ)  { sql += " LIMIT ?";  params.push(Number(limitQ));  }

  const db = getPool();
  const [rows] = await db.query(sql, params);
  return c.json(rows);
});

router.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!id || Number.isNaN(id)) return c.json({ detail: "Invalid id" }, 422);

  const db = getPool();
  const [rows] = await db.query("SELECT id, plate FROM plate WHERE id = ?", [id]);
  const row = (rows as any[])[0];
  return row ? c.json(row) : c.json({ detail: "Plate not found" }, 404);
});

export default router;
