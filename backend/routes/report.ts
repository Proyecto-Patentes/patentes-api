import { Hono } from "hono";
import { getPool } from "../db";

const router = new Hono();

// GET /report  (incluye plate embebido)
router.get("/", async (c) => {
  const db = getPool();
  const [rows] = await db.query(
    `SELECT
       r.id,
       r.user_id,
       r.report_category_id,
       r.plate_id,
       r.created_at,
       p.id   AS plate_inner_id,
       p.plate AS plate_value
     FROM report r
     LEFT JOIN plate p ON p.id = r.plate_id
     ORDER BY r.id DESC`
  );

  const data = (rows as any[]).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    report_category_id: r.report_category_id,
    plate_id: r.plate_id,
    created_at: r.created_at,
    plate: r.plate_inner_id ? { id: r.plate_inner_id, plate: r.plate_value } : null,
  }));

  return c.json(data);
});

// POST /report  { user_id:number, report_category_id:number, plate_id:number }
router.post("/", async (c) => {
  const b = await c.req.json().catch(() => null) as
    | { user_id?: number; report_category_id?: number; plate_id?: number }
    | null;

  if (!b || typeof b.user_id !== "number" || typeof b.report_category_id !== "number" || typeof b.plate_id !== "number") {
    return c.json({ detail: "Invalid body" }, 422);
  }

  const db = getPool();
  const [res] = await db.execute(
    "INSERT INTO report (user_id, report_category_id, plate_id) VALUES (?, ?, ?)",
    [b.user_id, b.report_category_id, b.plate_id]
  );
  const id = (res as any).insertId;

  const [rows] = await db.query(
    `SELECT
       r.id,
       r.user_id,
       r.report_category_id,
       r.plate_id,
       r.created_at,
       p.id   AS plate_inner_id,
       p.plate AS plate_value
     FROM report r
     LEFT JOIN plate p ON p.id = r.plate_id
     WHERE r.id = ?`,
    [id]
  );

  const r = (rows as any[])[0];
  const data = {
    id: r.id,
    user_id: r.user_id,
    report_category_id: r.report_category_id,
    plate_id: r.plate_id,
    created_at: r.created_at,
    plate: r.plate_inner_id ? { id: r.plate_inner_id, plate: r.plate_value } : null,
  };

  return c.json(data, 201);
});

export default router;
