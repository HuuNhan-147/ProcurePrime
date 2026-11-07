// modules/ai-agent/tools/ToolRegistry.js
// ============================================
// TOOL REGISTRY — Quản lý Danh mục AgentTool & Tích hợp ToolResolver
// ============================================

import { AgentTool } from "./AgentTool.js";
import { toolResolver } from "./ToolResolver.js";
import { searchProducts, getProductDetail } from "./actions/productTools.js";
import {
  addToCart,
  bulkAddToCart,
  addFromLastViewed,
  getCart,
  removeFromCart,
  updateCart,
  getCartCount,
} from "./actions/cartTools.js";
import {
  createOrder,
  getOrderDetail,
  getUserOrders,
  cancelOrder,
} from "./actions/orderTools.js";
import { getUserProfile, updateUserProfile } from "./actions/userTools.js";
import { createVnPayPayment } from "./actions/paymentTools.js";
import { ProcurementPolicyEngine } from "../../../src/modules/governance/ProcurementPolicyEngine.js";
import { AuditTrailService } from "../../../src/modules/governance/AuditTrailService.js";
import { QuotationService } from "../../../src/modules/quotation/QuotationService.js";

// Khởi tạo các AgentTool instances
export const toolInstances = [
  new AgentTool({
    name: "search_products",
    description: "🔍 BẮT BUỘC gọi tool này KHI NÀO: (1) User muốn TÌM/SEARCH sản phẩm, (2) User hỏi về sản phẩm cụ thể, (3) TRƯỚC KHI thêm sản phẩm vào giỏ. Ví dụ trigger: 'tìm iPhone', 'có iPhone không', 'xem điện thoại', 'thêm iPhone vào giỏ'.",
    inputSchema: {
      type: "object",
      properties: {
        keyword: { type: "string", description: "Từ khóa tìm kiếm (tên sản phẩm, thương hiệu...)" },
        category: { type: "string", description: "Danh mục sản phẩm (không bắt buộc)" },
        minPrice: { type: "number", description: "Giá tối thiểu (không bắt buộc)" },
        maxPrice: { type: "number", description: "Giá tối đa (không bắt buộc)" },
      },
      required: ["keyword"],
    },
    execute: (args, context) => searchProducts({ ...args, ...context }),
  }),

  new AgentTool({
    name: "get_product_detail",
    description: "Lấy thông tin chi tiết của một sản phẩm cụ thể theo ID",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "string", description: "ID của sản phẩm" },
      },
      required: ["productId"],
    },
    execute: (args) => getProductDetail(args),
  }),

  new AgentTool({
    name: "add_to_cart",
    description: "Thêm sản phẩm vào giỏ hàng. QUAN TRỌNG: Phải có productId (lấy từ search_products). Không được hỏi user về productId.",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "string", description: "ID của sản phẩm cần thêm" },
        quantity: { type: "number", description: "Số lượng sản phẩm (mặc định: 1)" },
      },
      required: ["productId"],
    },
    execute: (args, context) => addToCart({ ...args, ...context }),
  }),

  new AgentTool({
    name: "bulk_add_to_cart",
    description: "Thêm hàng loạt danh sách thiết bị và số lượng vào giỏ hàng doanh nghiệp B2B trong 1 lượt. BẮT BUỘC dùng khi khách hàng đặt gói combo hoặc trang bị nhiều món cho nhân viên/phòng ban.",
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "Mảng các thiết bị cần thêm vào giỏ hàng",
          items: {
            type: "object",
            properties: {
              productId: { type: "string", description: "ID của sản phẩm" },
              quantity: { type: "number", description: "Số lượng thiết bị cần mua" },
            },
            required: ["productId", "quantity"],
          },
        },
      },
      required: ["items"],
    },
    execute: (args, context) => bulkAddToCart({ ...args, ...context }),
  }),

  new AgentTool({
    name: "add_from_last_viewed",
    description: "Thêm sản phẩm vào giỏ dựa trên danh sách sản phẩm vừa xem (ví dụ: 'lấy con thứ 2'). Sử dụng chỉ số 1-based.",
    inputSchema: {
      type: "object",
      properties: {
        index: { type: "number", description: "1-based index trong danh sách lastViewedProducts" },
        quantity: { type: "number", description: "Số lượng (mặc định: 1)" },
      },
      required: ["index"],
    },
    execute: (args, context) => addFromLastViewed({ ...args, ...context }),
  }),

  new AgentTool({
    name: "get_cart",
    description: "Xem các sản phẩm hiện có trong giỏ hàng của người dùng",
    inputSchema: {
      type: "object",
      properties: {},
    },
    execute: (args, context) => getCart({ ...args, ...context }),
  }),

  new AgentTool({
    name: "remove_from_cart",
    description: "Xóa một sản phẩm khỏi giỏ hàng",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "string", description: "ID của sản phẩm cần xóa" },
      },
      required: ["productId"],
    },
    execute: (args, context) => removeFromCart({ ...args, ...context }),
  }),

  new AgentTool({
    name: "update_cart",
    description: "Cập nhật số lượng của một sản phẩm trong giỏ hàng",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "string", description: "ID của sản phẩm cần cập nhật" },
        quantity: { type: "number", description: "Số lượng mới (phải >= 1)" },
      },
      required: ["productId", "quantity"],
    },
    execute: (args, context) => updateCart({ ...args, ...context }),
  }),

  new AgentTool({
    name: "get_cart_count",
    description: "Lấy tổng số lượng sản phẩm trong giỏ hàng",
    inputSchema: {
      type: "object",
      properties: {},
    },
    execute: (args, context) => getCartCount({ ...args, ...context }),
  }),

  new AgentTool({
    name: "create_order",
    description: "Tạo đơn hàng mua sắm doanh nghiệp (Purchase Order - PO) từ giỏ hàng hiện tại hoặc theo Báo Giá B2B đã duyệt",
    inputSchema: {
      type: "object",
      properties: {
        shippingAddress: {
          type: "object",
          description: "Thông tin địa chỉ trụ sở/văn phòng giao hàng",
          properties: {
            fullname: { type: "string", description: "Đại diện nhận hàng / Người phụ trách thu mua" },
            phone: { type: "string", description: "Số điện thoại liên hệ" },
            address: { type: "string", description: "Địa chỉ nhận hàng (văn phòng / kho doanh nghiệp)" },
            city: { type: "string", description: "Tỉnh / Thành phố" },
          },
          required: ["fullname", "phone", "address", "city"],
        },
        paymentMethod: {
          type: "string",
          enum: ["BankTransfer", "VNPay", "COD"],
          description: "Phương thức thanh toán B2B (mặc định: BankTransfer - Chuyển khoản Doanh nghiệp)",
        },
        organization: { type: "string", description: "Tên Công ty / Cơ quan Doanh nghiệp" },
        taxCode: { type: "string", description: "Mã số thuế doanh nghiệp xuất hóa đơn VAT" },
        quotationNumber: { type: "string", description: "Số hiệu Báo Giá tham chiếu (PP-YYYYMMDD-XXXX)" },
        budgetCap: { type: "number", description: "Hạn mức ngân sách được duyệt" },
      },
      required: ["shippingAddress"],
    },
    execute: (args, context) => createOrder({ ...args, ...context }),
  }),

  new AgentTool({
    name: "get_order_detail",
    description: "Lấy thông tin chi tiết của một đơn hàng cụ thể theo mã đơn hoặc ID",
    inputSchema: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "ID đơn hàng (MongoDB ObjectId) hoặc Mã đơn hàng (orderCode, vd: DH123456-789)",
        },
      },
      required: ["orderId"],
    },
    execute: (args, context) => getOrderDetail({ ...args, ...context }),
  }),

  new AgentTool({
    name: "get_user_orders",
    description: "Lấy danh sách các đơn hàng đã đặt của người dùng",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Lọc theo trạng thái (pending, delivered, cancelled...)" },
      },
    },
    execute: (args, context) => getUserOrders({ ...args, ...context }),
  }),

  new AgentTool({
    name: "cancel_order",
    description: "Hủy đơn hàng của người dùng (chỉ khi đơn chưa thanh toán)",
    inputSchema: {
      type: "object",
      properties: {
        orderIdentifier: {
          type: "string",
          description: "Mã đơn hàng (DH...) hoặc MongoDB _id của đơn hàng cần hủy",
        },
      },
      required: ["orderIdentifier"],
    },
    execute: (args, context) => cancelOrder({ ...args, ...context }),
  }),

  new AgentTool({
    name: "create_vnpay_payment",
    description: "Tạo URL thanh toán VNPay cho đơn hàng cụ thể",
    inputSchema: {
      type: "object",
      properties: {
        orderIdentifier: {
          type: "string",
          description: "Mã đơn hàng (DH...) hoặc ID đơn hàng cần thanh toán",
        },
        bankCode: { type: "string", description: "Mã ngân hàng (NCB, VCB... Không bắt buộc)" },
        language: { type: "string", description: "Ngôn ngữ giao diện thanh toán (mặc định: vn)" },
      },
      required: ["orderIdentifier"],
    },
    execute: (args, context) => createVnPayPayment({ ...args, ...context }),
  }),

  new AgentTool({
    name: "get_user_profile",
    description: "Lấy thông tin hồ sơ của người dùng hiện tại",
    inputSchema: {
      type: "object",
      properties: {},
    },
    execute: (args, context) => getUserProfile({ ...args, ...context }),
  }),

  new AgentTool({
    name: "update_user_profile",
    description: "Cập nhật thông tin hồ sơ người dùng (tên, số điện thoại)",
    inputSchema: {
      type: "object",
      properties: {
        updates: {
          type: "object",
          properties: {
            name: { type: "string", description: "Họ và tên mới" },
            phone: { type: "string", description: "Số điện thoại mới" },
          },
        },
      },
      required: ["updates"],
    },
    execute: (args, context) => updateUserProfile({ ...args, ...context }),
  }),

  new AgentTool({
    name: "evaluate_procurement_policy",
    description: "Thẩm định quy chế mua sắm B2B, đối chiếu ngân sách trần và xác định cấp thẩm quyền phê duyệt (Specialist, Manager, CFO). BẮT BUỘC gọi trước khi tạo báo giá hoặc xác nhận đặt hàng combo B2B.",
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "Danh sách thiết bị (mỗi thiết bị gồm name và quantity)",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Tên thiết bị" },
              quantity: { type: "number", description: "Số lượng" },
            },
            required: ["name", "quantity"],
          },
        },
        maxBudget: { type: "number", description: "Trần ngân sách tối đa được giao (VNĐ)" },
        currentTotal: { type: "number", description: "Tổng giá trị tính toán của đơn hàng (VNĐ)" },
      },
      required: ["items", "currentTotal"],
    },
    execute: (args) => {
      const evaluation = ProcurementPolicyEngine.evaluatePolicy({
        items: args.items,
        maxBudget: args.maxBudget !== undefined && args.maxBudget !== null ? Number(args.maxBudget) : null,
        currentTotal: Number(args.currentTotal),
      });

      const auditRecord = AuditTrailService.createAuditRecord({
        actorType: "AI_AGENT",
        action: "EVALUATE_PROCUREMENT_POLICY",
        decision: evaluation.decision,
        reason: evaluation.reason,
        inputSnapshot: { items: args.items, maxBudget: args.maxBudget, currentTotal: args.currentTotal },
      });

      return {
        ...evaluation,
        auditFingerprint: auditRecord.hash,
      };
    },
  }),

  new AgentTool({
    name: "create_quotation",
    description: "Khởi tạo Bảng Báo Giá Thương Mại B2B chính thức (Commercial Quotation) kèm mã hiệu PP-YYYYMMDD-XXXX, áp dụng chiết khấu sỉ 5%, tính thuế VAT 10% và chữ ký băm SHA-256. BẮT BUỘC gọi khi khách hàng yêu cầu xuất báo giá, làm báo giá gửi sếp hoặc xuất hợp đồng mua sắm.",
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "Danh sách thiết bị (mỗi thiết bị gồm productName, unitPrice, quantity). Nếu không truyền, hệ thống sẽ tự động lấy danh sách từ giỏ hàng hiện tại.",
          items: {
            type: "object",
            properties: {
              productName: { type: "string", description: "Tên thiết bị" },
              unitPrice: { type: "number", description: "Đơn giá (VNĐ)" },
              quantity: { type: "number", description: "Số lượng" },
            },
            required: ["productName", "unitPrice", "quantity"],
          },
        },
        companyName: { type: "string", description: "Tên công ty / doanh nghiệp nhận báo giá" },
        taxCode: { type: "string", description: "Mã số thuế doanh nghiệp (nếu có)" },
        maxBudget: { type: "number", description: "Trần ngân sách (nếu có)" },
      },
    },
    execute: async (args, context) => {
      let items = args.items;
      if (!Array.isArray(items) || items.length === 0) {
        if (context?.userId && context?.token) {
          try {
            const cartRes = await getCart({ userId: context.userId, token: context.token });
            if (cartRes?.cart?.items?.length > 0) {
              items = cartRes.cart.items.map((it) => ({
                productName: it.name,
                unitPrice: it.price,
                quantity: it.quantity,
              }));
            }
          } catch {
            // bỏ qua lỗi đọc giỏ hàng
          }
        }
      }

      if (!Array.isArray(items) || items.length === 0) {
        return {
          success: false,
          error: "Chưa có danh sách thiết bị để lập báo giá. Vui lòng thêm sản phẩm vào giỏ hoặc truyền danh sách thiết bị.",
        };
      }

      const quotation = await QuotationService.createQuotation({
        items,
        organization: {
          name: args.companyName || "Doanh Nghiệp Mua Sắm B2B",
          taxCode: args.taxCode || "0101234567",
          address: "Việt Nam",
          phone: "0901234567",
          status: "ACTIVE",
        },
        maxBudget: args.maxBudget !== undefined && args.maxBudget !== null ? Number(args.maxBudget) : null,
      });

      return {
        success: true,
        message: `Đã khởi tạo thành công Bản Báo Giá Thương Mại ${quotation.quotationNumber}`,
        quotationNumber: quotation.quotationNumber,
        grandTotal: quotation.grandTotal,
        status: quotation.status,
        auditFingerprint: quotation.auditFingerprint,
        previewUrl: `/api/quotations/${quotation.quotationNumber}/html`,
        excelUrl: `/api/quotations/${quotation.quotationNumber}/excel`,
        itemsCount: quotation.items.length,
      };
    },
  }),
];

// Map lookup nhanh theo name
const toolMap = new Map();
toolInstances.forEach((tool) => toolMap.set(tool.name, tool));

// Object mapping tương thích ngược
export const tools = {};
toolInstances.forEach((tool) => {
  tools[tool.name] = (args, context) => tool.execute(args, context);
});

export function getToolDeclarations() {
  return toolInstances.map((tool) => tool.getDeclaration());
}

export class ToolRegistry {
  static getTools() {
    return tools;
  }

  static getTool(name) {
    return toolMap.get(name) || null;
  }

  static getDeclarations() {
    return getToolDeclarations();
  }

  /**
   * Thẩm định tham số bắt buộc theo Schema trước khi thực thi (Fail-Fast)
   */
  static validateToolArgs(tool, params) {
    if (!tool.inputSchema || !Array.isArray(tool.inputSchema.required)) return;
    for (const field of tool.inputSchema.required) {
      const val = params[field];
      if (val === undefined || val === null || (typeof val === "string" && val.trim().length === 0)) {
        throw new Error(`Thực thi tool [${tool.name}] thất bại: Thiếu tham số bắt buộc "${field}".`);
      }
    }
  }

  /**
   * Thực thi tool qua ToolResolver (hỗ trợ Dual-Path: WebMCP / Local Service)
   */
  static async executeTool(name, params = {}, context = {}) {
    const tool = toolMap.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" không tồn tại trong ToolRegistry.`);
    }

    // Kiểm tra tính toàn vẹn của tham số đầu vào (Không phòng vệ '||')
    this.validateToolArgs(tool, params);

    return await toolResolver.resolveAndExecute(tool, params, context);
  }
}
