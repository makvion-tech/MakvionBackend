import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoute from "./routes/health.js";
import contactRoute from "./routes/contact.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/health", healthRoute);
app.use("/api/contact", contactRoute);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});