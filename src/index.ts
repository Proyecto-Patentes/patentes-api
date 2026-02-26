import { Hono } from "hono";
import plateRoutes from "./routes/plate.js";
import reportRoutes from "./routes/report.js";
import reportCategoryRoutes from "./routes/report-category.js";
import vehicleTypeRoutes from "./routes/vehicle-type.js";

const app = new Hono();

app.get("/", (c) => c.text("API running"));

app.route("/plate", plateRoutes);
app.route("/report", reportRoutes);
app.route("/report-category", reportCategoryRoutes);
app.route("/vehicle-type", vehicleTypeRoutes);

export const config = { runtime: "nodejs" };

export default app;
