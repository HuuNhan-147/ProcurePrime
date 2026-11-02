// backend/src/modules/governance/AuditTrailService.js
// ============================================
// AUDIT TRAIL SERVICE — Chuỗi Băm SHA-256 Bất Biến Giám Sát Ra Quyết Định
// Kế thừa từ kiến trúc AuditLogService của EDUREF_AI
// ============================================

import crypto from 'node:crypto';
import { AppError } from '../../shared/errors/AppError.js';

export class AuditTrailService {
  static GENESIS_HASH = 'GENESIS_HASH_PROCUREPRIME_2026';

  /**
   * Chuẩn hóa đối tượng JSON theo thứ tự từ điển (Canonical JSON)
   * Đảm bảo bất kể thứ tự thuộc tính thế nào thì kết quả băm luôn nhất quán 100%
   */
  static canonicalStringify(obj) {
    if (obj === undefined) return 'null';
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    if (obj instanceof Date) {
      return JSON.stringify(obj.toISOString());
    }
    if (Array.isArray(obj)) {
      return '[' + obj.map((item) => this.canonicalStringify(item !== undefined ? item : null)).join(',') + ']';
    }
    const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + this.canonicalStringify(obj[k])).join(',') + '}';
  }

  /**
   * Tính toán chuỗi băm SHA-256 nối tiếp bất biến
   */
  static calculateHash({
    previousHash,
    actorType,
    action,
    decision,
    reason,
    inputSnapshot,
    timestamp,
  }) {
    if (previousHash === undefined || previousHash === null || previousHash === '') {
      throw AppError.validationError('previousHash không được để trống khi tính hash audit');
    }
    if (!action) {
      throw AppError.validationError('action không được để trống khi tính hash audit');
    }

    const timeStr = timestamp instanceof Date 
      ? timestamp.toISOString() 
      : (typeof timestamp === 'string' ? timestamp : new Date().toISOString());

    const rawPayload = [
      previousHash,
      actorType !== undefined && actorType !== null ? actorType : 'AI_AGENT',
      action,
      decision !== undefined && decision !== null ? decision : 'NONE',
      reason !== undefined && reason !== null ? reason : 'NONE',
      this.canonicalStringify(inputSnapshot !== undefined && inputSnapshot !== null ? inputSnapshot : {}),
      timeStr,
    ].join('|');

    return crypto.createHash('sha256').update(rawPayload).digest('hex');
  }

  /**
   * Tạo bản ghi kiểm toán hoàn chỉnh có đóng dấu băm
   */
  static createAuditRecord({
    previousHash,
    actorType,
    actorId,
    action,
    decision,
    reason,
    inputSnapshot,
    timestamp = new Date().toISOString(),
  }) {
    const prevHash = previousHash !== undefined && previousHash !== null && previousHash !== '' 
      ? previousHash 
      : this.GENESIS_HASH;

    const hash = this.calculateHash({
      previousHash: prevHash,
      actorType,
      action,
      decision,
      reason,
      inputSnapshot,
      timestamp,
    });

    return {
      hash,
      previousHash: prevHash,
      actorType: actorType !== undefined && actorType !== null ? actorType : 'AI_AGENT',
      actorId: actorId !== undefined && actorId !== null ? actorId : null,
      action,
      decision: decision !== undefined && decision !== null ? decision : null,
      reason: reason !== undefined && reason !== null ? reason : null,
      inputSnapshot: inputSnapshot !== undefined && inputSnapshot !== null ? inputSnapshot : {},
      timestamp,
    };
  }

  /**
   * Xác thực tính toàn vẹn của chuỗi lịch sử Audit (Audit Trail Integrity Verification)
   * Phát hiện bất kỳ sự can thiệp hoặc sửa đổi dữ liệu nào trong quá khứ
   */
  static verifyChain(records) {
    if (!Array.isArray(records)) {
      throw AppError.validationError('records phải là một mảng danh sách bản ghi kiểm toán');
    }
    if (records.length === 0) {
      return { valid: true, verifiedCount: 0 };
    }

    let expectedPrevHash = this.GENESIS_HASH;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      if (record.previousHash !== expectedPrevHash) {
        return {
          valid: false,
          brokenIndex: i,
          reason: `Đứt gãy chuỗi băm tại vị trí ${i}: previousHash '${record.previousHash}' không khớp với hash kỳ vọng '${expectedPrevHash}'`,
        };
      }

      const recalculatedHash = this.calculateHash({
        previousHash: record.previousHash,
        actorType: record.actorType,
        action: record.action,
        decision: record.decision,
        reason: record.reason,
        inputSnapshot: record.inputSnapshot,
        timestamp: record.timestamp,
      });

      if (record.hash !== recalculatedHash) {
        return {
          valid: false,
          brokenIndex: i,
          reason: `Phát hiện giả mạo dữ liệu tại vị trí ${i}: Hash lưu trữ '${record.hash}' khác với Hash tính toán lại '${recalculatedHash}'`,
        };
      }

      expectedPrevHash = record.hash;
    }

    return { valid: true, verifiedCount: records.length };
  }
}

