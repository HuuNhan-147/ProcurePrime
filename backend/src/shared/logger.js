// backend/src/shared/logger.js
// ============================================
// STRUCTURED LOGGER — Hệ thống ghi log chuẩn hóa
// ============================================

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LEVEL = process.env.NODE_ENV === "production" ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

function formatMessage(level, domain, message, meta) {
  const timestamp = new Date().toISOString();
  const domainTag = domain ? `[${domain}]` : "[ProcurePrime]";
  const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} ${level} ${domainTag} ${message}${metaStr}`;
}

export const logger = {
  debug(message, domain = "Core", meta = null) {
    if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
      console.debug(formatMessage("🔍 DEBUG", domain, message, meta));
    }
  },

  info(message, domain = "Core", meta = null) {
    if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
      console.log(formatMessage("ℹ️ INFO ", domain, message, meta));
    }
  },

  warn(message, domain = "Core", meta = null) {
    if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(formatMessage("⚠️ WARN ", domain, message, meta));
    }
  },

  error(message, domain = "Core", error = null) {
    if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
      const errDetail = error instanceof Error ? { message: error.message, stack: error.stack } : error;
      console.error(formatMessage("❌ ERROR", domain, message, errDetail));
    }
  },
};

export default logger;

