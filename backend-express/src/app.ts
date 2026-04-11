import express from "express";
import cors from "cors";
import morgan from "morgan";

import uploadRoutes from "./routes/uploadRoutes";
import jobRoutes from "./routes/jobRoutes";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorMiddleware";

const app = express();
const frontendOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: frontendOrigins,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", async (_req, res) => {
  res.json({
    success: true,
    message: "Express backend is healthy",
  });
});

app.use("/", uploadRoutes);
app.use("/", jobRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
