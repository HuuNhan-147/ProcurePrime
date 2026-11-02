// backend/src/shared/errors/AppError.js
// ============================================
// APP ERROR — Lớp lỗi nghiệp vụ chuẩn hóa
// ============================================

export class AppError extends Error {
  /**
   * @param {string} message - Thông điệp lỗi hiển thị cho người dùng
   * @param {number} statusCode - HTTP status code
   * @param {string} errorCode - Mã định danh lỗi nghiệp vụ
   * @param {Object|null} details - Chi tiết lỗi bổ sung
   */
  constructor(message, statusCode = 500, errorCode = "ERR_INTERNAL_SERVER", details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true; // Đánh dấu lỗi nghiệp vụ dự kiến được

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Yêu cầu không hợp lệ", errorCode = "ERR_BAD_REQUEST", details = null) {
    return new AppError(message, 400, errorCode, details);
  }

  static unauthorized(message = "Bạn cần đăng nhập để thực hiện tác vụ này", errorCode = "ERR_UNAUTHORIZED") {
    return new AppError(message, 401, errorCode);
  }

  static forbidden(message = "Bạn không có quyền thực hiện tác vụ này", errorCode = "ERR_FORBIDDEN") {
    return new AppError(message, 403, errorCode);
  }

  static notFound(message = "Không tìm thấy tài nguyên yêu cầu", errorCode = "ERR_NOT_FOUND") {
    return new AppError(message, 404, errorCode);
  }

  static validationError(message = "Dữ liệu đầu vào không hợp lệ", details = null) {
    return new AppError(message, 422, "ERR_VALIDATION_FAILED", details);
  }

  static policyViolation(message = "Yêu cầu vi phạm quy chế thu mua doanh nghiệp", rule = "RULE_VIOLATION", details = null) {
    return new AppError(message, 422, `ERR_POLICY_${rule}`, details);
  }

  static budgetExceeded(message = "Tổng chi phí dự toán vượt quá ngân sách phê duyệt", details = null) {
    return new AppError(message, 422, "ERR_BUDGET_CAP_EXCEEDED", details);
  }

  static internal(message = "Lỗi xử lý nội bộ hệ thống", errorCode = "ERR_INTERNAL") {
    return new AppError(message, 500, errorCode);
  }
}

export default AppError;

