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

app.use(cors());
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
