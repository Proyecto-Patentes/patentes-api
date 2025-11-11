import { handle } from "hono/vercel";
import app from "../backend/hono";

// Runtime Node (no edge), necesario para MySQL
export const runtime = "nodejs";

export default handle(app);
