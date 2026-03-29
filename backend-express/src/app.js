const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const uploadRoutes = require("./routes/uploadRoutes");
const jobRoutes = require("./routes/jobRoutes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", async (_req, res) => {
  return res.json({
    success: true,
    message: "Express backend is healthy"
  });
});

app.use("/", uploadRoutes);
app.use("/", jobRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

