// backend/src/shared/middlewares/errorHandler.js
// ============================================
// CENTRALIZED ERROR HANDLER — Bộ xử lý lỗi tập trung
// ============================================

import { AppError } from "../errors/AppError.js";
import { logger } from "../logger.js";
import { sendError } from "../helpers/responseHelper.js";

/**
 * Express error handling middleware
 */
export function errorHandler(err, req, res, next) {
  let error = err;

  // 1. Nếu là lỗi Mongoose ValidationError
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((el) => el.message);
    error = AppError.badRequest("Dữ liệu đầu vào không hợp lệ", "ERR_VALIDATION", details);
  }

  // 2. Nếu là lỗi Mongoose CastError (sai định dạng ObjectId)
  if (err.name === "CastError") {
    error = AppError.badRequest(`Định dạng mã định danh ${err.path} không hợp lệ: ${err.value}`, "ERR_INVALID_ID");
  }

  // 3. Nếu là lỗi JWT Token
  if (err.name === "JsonWebTokenError") {
    error = AppError.unauthorized("Phiên xác thực không hợp lệ", "ERR_INVALID_TOKEN");
  }
  if (err.name === "TokenExpiredError") {
    error = AppError.unauthorized("Phiên xác thực đã hết hạn. Vui lòng đăng nhập lại", "ERR_TOKEN_EXPIRED");
  }

  // 4. Mặc định nếu không phải AppError
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || "ERR_INTERNAL_SERVER";
  const message = error.isOperational ? error.message : "Đã có sự cố xảy ra trong hệ thống. Vui lòng thử lại sau.";

  // Ghi log chi tiết
  logger.error(
    `[${req.method}] ${req.originalUrl} - ${errorCode}: ${err.message}`,
    "ErrorHandler",
    error.isOperational ? error.details : { stack: err.stack }
  );

  return sendError(res, message, statusCode, errorCode, error.details || (process.env.NODE_ENV !== "production" ? err.stack : null));
}

export default errorHandler;

