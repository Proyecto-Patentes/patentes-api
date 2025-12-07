import { Hono } from "hono";
import plateRoutes from "./routes/plate.js";
import reportRoutes from "./routes/report.js";

const app = new Hono();

app.get("/", (c) => c.text("API running"));

app.route("/plate", plateRoutes);
app.route("/report", reportRoutes);

export const config = { runtime: "nodejs" };

export default app;
