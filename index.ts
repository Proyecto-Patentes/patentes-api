import { Hono } from "hono";
import { cors } from "hono/cors";

import plateRoutes from "./backend/routes/plate";
import reportRoutes from "./backend/routes/report";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => c.json({ status: "ok" }));

app.route("/plate", plateRoutes);
app.route("/report", reportRoutes);

export default app;
