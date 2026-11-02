// backend/src/shared/helpers/responseHelper.js
// ============================================
// RESPONSE HELPER — Chuẩn hóa định dạng phản hồi API
// ============================================

/**
 * Trả về phản hồi thành công chuẩn cho client
 */
export function sendSuccess(res, data = null, message = "Thành công", statusCode = 200, meta = null) {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

export const successResponse = sendSuccess;

/**
 * Trả về phản hồi tạo mới tài nguyên thành công (HTTP 201)
 */
export function sendCreated(res, data = null, message = "Khởi tạo thành công", meta = null) {
  return sendSuccess(res, data, message, 201, meta);
}

/**
 * Trả về phản hồi lỗi chuẩn cho client
 */
export function sendError(res, message = "Có lỗi xảy ra", statusCode = 500, errorCode = "ERR_INTERNAL", details = null) {
  const payload = {
    success: false,
    error: {
      code: errorCode,
      message,
    },
  };

  if (details && process.env.NODE_ENV !== "production") {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
}

export default {
  sendSuccess,
  sendCreated,
  sendError,
};

