import { handle } from "hono/vercel";
import { Hono } from "hono";
import { cors } from "hono/cors";
import plateRoutes from "../backend/routes/plate";
import reportRoutes from "../backend/routes/report";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => c.json({ status: "ok", message: "API is running" }));

app.route("/plate", plateRoutes);
app.route("/report", reportRoutes);

export const config = { runtime: "nodejs" };

export default handle(app);
