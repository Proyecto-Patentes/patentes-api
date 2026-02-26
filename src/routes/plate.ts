import { Hono } from "hono";
import { getPool } from "../db.js";

const router = new Hono();

router.get("/", async (c) => {
  const db = getPool();
  const [rows] = await db.query("SELECT id, plate FROM plate ORDER BY id DESC");
  return c.json(rows);
});

router.post("/", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { plate?: string; vehicle_type_id?: number } | null;
  const value = body?.plate?.trim();
  const vehicleTypeId = body?.vehicle_type_id;
  if (!value) return c.json({ detail: "Invalid body" }, 422);

  const db = getPool();

  // if vehicle type provided, validate format
  if (vehicleTypeId) {
    const [vtRows] = await db.query(
      "SELECT format FROM vehicle_type WHERE id = ?",
      [vehicleTypeId]
    );
    const vt = (vtRows as any[])[0];
    if (!vt) {
      return c.json({ detail: "Vehicle type not found" }, 422);
    }
    const format: string = vt.format;
    // build regex from format: A -> [A-Za-z], N -> \d, other characters escape
    const regexString = format
      .split("")
      .map((ch: string) => {
        if (ch === "A") return "[A-Za-z]";
        if (ch === "N") return "\\d";
        return ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      })
      .join("");
    const regex = new RegExp(`^${regexString}$`);
    if (!regex.test(value)) {
      return c.json({ detail: "Plate does not match vehicle type format" }, 422);
    }
  }

  const [res] = await db.execute(
    "INSERT INTO plate (plate, vehicle_type_id) VALUES (?, ?)",
    [value, vehicleTypeId || null]
  );
  const id = (res as any).insertId;

  const [rows] = await db.query("SELECT id, plate, vehicle_type_id FROM plate WHERE id = ?", [id]);
  return c.json((rows as any[])[0], 201);
});

router.get("/search", async (c) => {
  const id = c.req.query("id");
  const plate = c.req.query("plate");
  const vehicleTypeId = c.req.query("vehicle_type_id");
  const partial = (c.req.query("partial") || "false").toLowerCase() === "true";
  const limitQ = c.req.query("limit");
  const offsetQ = c.req.query("offset");

  let sql = "SELECT id, plate, vehicle_type_id FROM plate WHERE 1=1";
  const params: any[] = [];

  if (id) { sql += " AND id = ?"; params.push(Number(id)); }
  if (plate) {
    if (partial) { sql += " AND plate LIKE ?"; params.push(`%${plate}%`); }
    else         { sql += " AND plate = ?";     params.push(plate); }
  }
  if (vehicleTypeId) { sql += " AND vehicle_type_id = ?"; params.push(Number(vehicleTypeId)); }

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
