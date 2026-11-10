// backend/utils/securityUtils.js
// ============================================
// SECURITY UTILITIES — Hỗ trợ phòng vệ chống Injection & ReDoS
// ============================================

/**
 * Thoát các ký tự đặc biệt của Regular Expression để chống ReDoS và lỗi cú pháp Regex
 * @param {string} str - Chuỗi đầu vào từ client
 * @returns {string} Chuỗi an toàn để đưa vào $regex trong truy vấn MongoDB
 */
export function escapeRegex(str) {
  if (typeof str !== "string") return "";
  return str.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Kiểm tra chuỗi ID có đúng định dạng MongoDB ObjectId (24 hex characters)
 * @param {any} id
 * @returns {boolean}
 */
export function isValidObjectId(id) {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}
