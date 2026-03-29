const { AppError } = require("../utils/AppError");

const notFoundHandler = (_req, _res, next) => {
  next(new AppError("Route not found", 404));
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || "Internal server error",
      statusCode
    }
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};

