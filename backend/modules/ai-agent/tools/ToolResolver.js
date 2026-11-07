// modules/ai-agent/tools/ToolResolver.js
// ============================================
// TOOL RESOLVER — Bộ giải quyết và điều phối thực thi Tool (Dual-Path)
// ============================================

import { localServiceAdapter } from "./adapters/LocalServiceAdapter.js";
import { webMCPAdapter } from "./adapters/WebMCPAdapter.js";

// Danh sách các tool B2B cấp cao bắt buộc thực thi trực tiếp tại Server
// (Ký băm SHA-256 Audit Trail, thẩm định hạn mức duyệt chi và lưu Database)
export const SERVER_ONLY_TOOLS = new Set([
  "create_quotation",
  "evaluate_procurement_policy",
]);

export class ToolResolver {
  constructor(localAdapter = localServiceAdapter, mcpAdapter = webMCPAdapter) {
    this.localAdapter = localAdapter;
    this.mcpAdapter = mcpAdapter;
  }

  /**
   * Điều phối thực thi tool theo cơ chế Dual-Path:
   * - Tool nghiệp vụ máy chủ (SERVER_ONLY_TOOLS): Luôn chạy tại Server qua LocalServiceAdapter
   * - Nếu client hỗ trợ WebMCP: Ủy quyền cho trình duyệt qua WebMCPAdapter
   * - Mặc định / Fallback: Chạy trên Server qua LocalServiceAdapter
   *
   * @param {AgentTool} tool - Instance AgentTool cần thực thi
   * @param {Object} args - Tham số từ LLM
   * @param {Object} context - Ngữ cảnh phiên làm việc
   */
  async resolveAndExecute(tool, args, context = {}) {
    if (!tool) {
      throw new Error("ToolResolver: Tool không hợp lệ");
    }

    const { clientSupportsWebMCP } = context;
    const isServerOnly = SERVER_ONLY_TOOLS.has(tool.name);

    // Chọn adapter phù hợp: Các tool Server-Only không bao giờ đẩy sang Trình duyệt WebMCP
    const selectedAdapter = clientSupportsWebMCP && !isServerOnly ? this.mcpAdapter : this.localAdapter;
    console.log(`🔀 [ToolResolver] Điều phối tool [${tool.name}] qua [${selectedAdapter.name}]${isServerOnly ? " (Server-Side Enterprise Tool)" : ""}`);

    try {
      return await selectedAdapter.execute(tool, args, context);
    } catch (error) {
      console.error(`💥 [ToolResolver] Lỗi nghiêm trọng khi thực thi tool [${tool.name}]:`, error.message);
      // Fallback khẩn cấp nếu adapter bị throw uncaught exception
      if (selectedAdapter !== this.localAdapter) {
        console.warn(`  🔄 [ToolResolver] Thực thi khẩn cấp với LocalServiceAdapter...`);
        return await this.localAdapter.execute(tool, args, context);
      }
      return {
        success: false,
        source: "fallback_error",
        error: error.message,
      };
    }
  }
}

export const toolResolver = new ToolResolver();
