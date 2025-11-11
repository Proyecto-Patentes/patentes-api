import { Hono } from "hono";
import { cors } from "hono/cors";
import plateRoutes from "./routes/plate";
import reportRoutes from "./routes/report";

const app = new Hono();
app.use("*", cors());

// Health (queda en /api/)
app.get("/", (c) => c.json({ status: "ok", message: "API is running" }));

// Tus endpoints (quedan en /api/plate y /api/report)
app.route("/plate", plateRoutes);
app.route("/report", reportRoutes);

export default app;
