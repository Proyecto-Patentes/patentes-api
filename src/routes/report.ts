import { Hono } from "hono";
import { getPool } from "../db.js";

const router = new Hono();

router.get("/", async (c) => {
  const db = getPool();
  const [rows] = await db.query(
    `SELECT
       r.id,
       r.user_id,
       r.plate_id,
       r.description,
       r.latitude,
       r.longitude,
       r.severity,
       r.created_at,
       p.id    AS plate_inner_id,
       p.plate AS plate_value,
       rc.id   AS category_id,
       rc.report_category AS category_name,
       rc.severity AS category_severity
     FROM report r
     LEFT JOIN plate p ON p.id = r.plate_id
     LEFT JOIN report_category_report rcr ON rcr.report_id = r.id
     LEFT JOIN report_category rc ON rc.id = rcr.report_category_id
     ORDER BY r.id DESC`
  );

  // group categories per report
  const grouped: any = {};
  for (const r of rows as any[]) {
    if (!grouped[r.id]) {
      grouped[r.id] = {
        id: r.id,
        user_id: r.user_id,
        plate_id: r.plate_id,
        description: r.description,
        latitude: r.latitude,
        longitude: r.longitude,
        severity: r.severity,
        created_at: r.created_at,
        plate: r.plate_inner_id ? { id: r.plate_inner_id, plate: r.plate_value } : null,
        categories: [] as any[],
      };
    }
    if (r.category_id) {
      grouped[r.id].categories.push({
        id: r.category_id,
        report_category: r.category_name,
        severity: r.category_severity,
      });
    }
  }

  return c.json(Object.values(grouped));
});

router.post("/", async (c) => {
  const b = (await c.req.json().catch(() => null)) as
    | {
        user_id?: number;
        plate_id?: number;
        report_category_ids?: number[];
        description?: string;
        latitude?: number;
        longitude?: number;
      }
    | null;

  if (
    !b ||
    typeof b.user_id !== "number" ||
    typeof b.plate_id !== "number" ||
    !Array.isArray(b.report_category_ids) ||
    b.report_category_ids.length === 0 ||
    b.report_category_ids.length > 3 ||
    !b.report_category_ids.every((v) => typeof v === "number")
  ) {
    return c.json({ detail: "Invalid body" }, 422);
  }

  const db = getPool();
  // fetch severities to compute average
  const [cats] = await db.query(
    `SELECT id, severity FROM report_category WHERE id IN (${b.report_category_ids
      .map(() => "?")
      .join(",")})`,
    b.report_category_ids
  );
  const catRows = cats as any[];
  if (catRows.length !== b.report_category_ids.length) {
    return c.json({ detail: "Some categories not found" }, 422);
  }
  const severitySum = catRows.reduce((sum, r) => sum + Number(r.severity), 0);

  // insert report
  const [res] = await db.execute(
    `INSERT INTO report (user_id, plate_id, description, latitude, longitude, severity) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      b.user_id,
      b.plate_id,
      b.description || null,
      b.latitude || null,
      b.longitude || null,
      severitySum,
    ]
  );
  const id = (res as any).insertId;

  // insert category relations
  for (const catId of b.report_category_ids) {
    await db.execute(
      "INSERT INTO report_category_report (report_id, report_category_id) VALUES (?, ?)",
      [id, catId]
    );
  }

  // fetch and return new report with categories
  const [rows] = await db.query(
    `SELECT
       r.id,
       r.user_id,
       r.plate_id,
       r.description,
       r.latitude,
       r.longitude,
       r.severity,
       r.created_at,
       p.id    AS plate_inner_id,
       p.plate AS plate_value,
       rc.id   AS category_id,
       rc.report_category AS category_name,
       rc.severity AS category_severity
     FROM report r
     LEFT JOIN plate p ON p.id = r.plate_id
     LEFT JOIN report_category_report rcr ON rcr.report_id = r.id
     LEFT JOIN report_category rc ON rc.id = rcr.report_category_id
     WHERE r.id = ?`,
    [id]
  );

  const grouped: any = {};
  for (const r of (rows as any[])) {
    if (!grouped[r.id]) {
      grouped[r.id] = {
        id: r.id,
        user_id: r.user_id,
        plate_id: r.plate_id,
        description: r.description,
        latitude: r.latitude,
        longitude: r.longitude,
        severity: r.severity,
        created_at: r.created_at,
        plate: r.plate_inner_id ? { id: r.plate_inner_id, plate: r.plate_value } : null,
        categories: [] as any[],
      };
    }
    if (r.category_id) {
      grouped[r.id].categories.push({
        id: r.category_id,
        report_category: r.category_name,
        severity: r.category_severity,
      });
    }
  }

  return c.json(Object.values(grouped)[0], 201);
});

export default router;
