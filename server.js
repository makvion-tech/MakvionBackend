import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoute from "./routes/health.js";
import contactRoute from "./routes/contact.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// FRONTEND_URL can hold one site or several, separated by commas:
//   https://makvion-tech.vercel.app
//   https://makvion-tech.vercel.app,https://makviontech.com
// Trailing slashes are stripped, since browsers never send them in Origin.
// Local dev is always allowed.
const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean),
];

app.use(
  cors({
    origin(origin, callback) {
      // no Origin header = curl, Postman, server-to-server: allow
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/health", healthRoute);
app.use("/api/contact", contactRoute);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log("Allowed origins:", allowedOrigins.join(", "));
});