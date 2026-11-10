// backend/middleware/securityMiddleware.js
// ============================================
// SECURITY MIDDLEWARE — Bảo vệ tầng HTTP & Chống lạm dụng
// ============================================

/**
 * Middleware thiết lập các HTTP Security Headers chuẩn OWASP (Native - Không phụ thuộc thư viện ngoài)
 */
export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.removeHeader("X-Powered-By");
  next();
};

/**
 * In-memory Token-Bucket / Sliding Window Rate Limiter (Native - Không cần cài thêm thư viện)
 * @param {Object} options - Cấu hình rate limit
 * @param {number} options.windowMs - Khoảng thời gian tính (ms)
 * @param {number} options.max - Số request tối đa trong cửa sổ thời gian
 * @param {string} options.message - Thông báo lỗi khi bị vượt ngưỡng
 */
export const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 120,
  message = "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau giây lát!",
} = {}) => {
  const requests = new Map();

  // Dọn dẹp định kỳ các bản ghi đã hết hạn mỗi 5 phút để tránh rò rỉ bộ nhớ
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requests.entries()) {
      if (now > record.resetTime) {
        requests.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Không giữ tiến trình node unref nếu server shutdown
  if (cleanupInterval.unref) cleanupInterval.unref();

  return (req, res, next) => {
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown-ip";

    const key = `${clientIp}:${req.baseUrl || ""}`;
    const now = Date.now();
    let record = requests.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      requests.set(key, record);
    } else {
      record.count += 1;
    }

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message,
        errorCode: "ERR_RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
};

/**
 * Rate limiters theo từng phân vùng API
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 30, // Tối đa 30 lần đăng nhập/đăng ký trong 15 phút
  message: "Quá nhiều yêu cầu xác thực từ IP này. Vui lòng thử lại sau 15 phút!",
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 phút
  max: 300, // 300 requests/phút cho các API thông thường
  message: "Hệ thống đang tiếp nhận quá nhiều thao tác từ bạn. Vui lòng làm chậm lại!",
});

export const aiAgentRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 phút
  max: 40, // 40 requests/phút đối với AI chat để bảo vệ Gemini Quota
  message: "Trợ lý AI đang xử lý dồn dập. Vui lòng chờ vài giây trước khi gửi tiếp!",
});
