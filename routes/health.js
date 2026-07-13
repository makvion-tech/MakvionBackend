import { Router } from "express";

const router = Router();

// GET /api/health - lets the frontend confirm it can reach the backend
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "portfolio-backend",
    time: new Date().toISOString(),
  });
});

export default router;