// backend/src/config/envValidator.js
// ============================================
// ENV VALIDATOR — Kiểm tra & Chuẩn hóa biến môi trường (Strict Validation - No Fallback)
// ============================================

try {
  const dotenv = await import("dotenv");
  dotenv.default?.config?.();
} catch {
  // Bỏ qua nếu môi trường đã nạp sẵn qua shell/container
}

const REQUIRED_ENVS = [
  { key: "MONGO_URI", description: "Chuỗi kết nối cơ sở dữ liệu MongoDB" },
  { key: "ACCESS_TOKEN_SECRET", alias: "JWT_SECRET", description: "Khóa bí mật giải mã chữ ký JWT" },
];

/**
 * Thẩm định tính toàn vẹn của biến môi trường khi server khởi động.
 * Nguyên tắc: Dữ liệu đúng là đúng, sai hoặc thiếu thì văng lỗi rõ ràng, tuyệt đối không dùng '||' nuốt lỗi.
 * @returns {Object} Đối tượng cấu hình môi trường đã được thẩm định nghiêm ngặt
 */
export function validateEnv() {
  const missingEnvs = [];

  for (const item of REQUIRED_ENVS) {
    const val = process.env[item.key] || (item.alias ? process.env[item.alias] : undefined);
    if (typeof val !== "string" || val.trim().length === 0) {
      missingEnvs.push(`❌ ${item.key}: ${item.description}`);
    } else if (item.alias && !process.env[item.alias]) {
      process.env[item.alias] = val;
    } else if (!process.env[item.key] && item.alias && process.env[item.alias]) {
      process.env[item.key] = process.env[item.alias];
    }
  }

  if (missingEnvs.length > 0) {
    const errorMsg = `Thiếu ${missingEnvs.length} biến môi trường bắt buộc:\n${missingEnvs.join("\n")}`;
    console.error("\n=======================================================");
    console.error("🚨 [ProcurePrime] LỖI CẤU HÌNH MÔI TRƯỜNG KHI KHỞI ĐỘNG:");
    console.error(errorMsg);
    console.error("=======================================================\n");
    throw new Error(errorMsg);
  }

  // 1. Thẩm định cổng PORT
  let parsedPort = 5000;
  if (process.env.PORT !== undefined && process.env.PORT !== "") {
    parsedPort = Number(process.env.PORT);
    if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
      throw new Error(`Cấu hình PORT không hợp lệ: "${process.env.PORT}". PORT phải là số nguyên trong khoảng 1 - 65535.`);
    }
  }

  // 2. Thẩm định FRONTEND_URL
  const frontendUrl = process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim() !== ""
    ? process.env.FRONTEND_URL.trim()
    : "http://localhost:5173";

  // 3. Thẩm định REDIS_URL
  const redisUrl = process.env.REDIS_URL && process.env.REDIS_URL.trim() !== ""
    ? process.env.REDIS_URL.trim()
    : "redis://localhost:6379";

  // 4. Thẩm định GEMINI_API_KEY
  const geminiApiKey = typeof process.env.GEMINI_API_KEY === "string" && process.env.GEMINI_API_KEY.trim() !== ""
    ? process.env.GEMINI_API_KEY.trim()
    : null;

  return {
    PORT: parsedPort,
    MONGO_URI: process.env.MONGO_URI.trim(),
    JWT_SECRET: process.env.JWT_SECRET.trim(),
    GEMINI_API_KEY: geminiApiKey,
    REDIS_URL: redisUrl,
    FRONTEND_URL: frontendUrl,
    VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE ? process.env.VNPAY_TMN_CODE.trim() : null,
    VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET ? process.env.VNPAY_HASH_SECRET.trim() : null,
    VNPAY_URL: process.env.VNPAY_URL ? process.env.VNPAY_URL.trim() : "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  };
}

export default validateEnv;
