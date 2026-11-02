// backend/src/modules/ai-agent/extractor/RequirementExtractionEngine.js
// ============================================
// REQUIREMENT EXTRACTION ENGINE — Động cơ bóc tách yêu cầu Thu mua B2B
// ============================================

import { SpecificationMatchingService } from "../../procurement/SpecificationMatchingService.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class RequirementExtractionEngine {
  /**
   * Phân tích và bóc tách các ràng buộc mua sắm doanh nghiệp từ văn bản tự nhiên.
   * Tuyệt đối không dùng '||' gán ngầm các thông số tài chính hoặc số lượng!
   *
   * @param {string} naturalQuery - Câu lệnh yêu cầu của khách hàng
   * @returns {Object} Cấu trúc yêu cầu thu mua đã bóc tách kèm cờ đánh giá tính đầy đủ
   */
  static extract(naturalQuery) {
    if (typeof naturalQuery !== "string" || naturalQuery.trim().length === 0) {
      throw AppError.badRequest("Văn bản yêu cầu bóc tách không được để trống", "ERR_EMPTY_QUERY");
    }

    const text = naturalQuery.trim();
    const lowerText = text.toLowerCase();

    // 1. Bóc tách Trần ngân sách (Max Budget)
    let maxBudget = null;
    const budgetMatch = lowerText.match(
      /(?:ngân sách|chi phí|tối đa|budget|kinh phí|tổng cộng)\s*(?:tối đa|trần)?\s*(?:là|khoảng|dưới)?\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|tỷ|ty|vnd|vnđ|đ)?/i
    );

    if (budgetMatch) {
      const rawNum = Number(budgetMatch[1].replace(/,/g, "."));
      const unit = budgetMatch[2] ? budgetMatch[2].toLowerCase() : "triệu";

      if (Number.isFinite(rawNum) && rawNum > 0) {
        if (unit === "tỷ" || unit === "ty") {
          maxBudget = Math.round(rawNum * 1000000000);
        } else if (unit === "triệu" || unit === "tr") {
          maxBudget = Math.round(rawNum * 1000000);
        } else {
          // Nếu đơn vị là vnđ hoặc không ghi đơn vị mà số >= 100000
          maxBudget = rawNum >= 100000 ? Math.round(rawNum) : Math.round(rawNum * 1000000);
        }
      }
    }

    // 2. Bóc tách Thông số kỹ thuật (RAM, CPU, SSD) qua SpecificationMatchingService
    const specs = SpecificationMatchingService.extractSpecsFromText(text);

    // 3. Bóc tách Các hạng mục thiết bị và số lượng tương ứng
    const items = [];

    // Nhóm 1: Laptop / Máy tính xách tay
    const laptopMatch = lowerText.match(/(\d+)\s*(?:cái|chiếc|máy)?\s*(?:laptop|máy tính xách tay|notebook)/i);
    if (laptopMatch) {
      const qty = Number(laptopMatch[1]);
      if (Number.isInteger(qty) && qty > 0) {
        items.push({
          category: "laptop",
          name: "Laptop văn phòng",
          quantity: qty,
          specifications: specs,
        });
      }
    } else if (lowerText.includes("laptop") || lowerText.includes("máy tính xách tay")) {
      // Có đề cập đến laptop nhưng chưa nói rõ số lượng
      items.push({
        category: "laptop",
        name: "Laptop",
        quantity: null, // Chưa xác định
        specifications: specs,
      });
    }

    // Nhóm 2: Chuột / Bàn phím / Combo chuột phím
    const mouseMatch = lowerText.match(/(\d+)\s*(?:bộ|cái|chiếc)?\s*(?:chuột|bàn phím|chuột phím|phím chuột)/i);
    if (mouseMatch) {
      const qty = Number(mouseMatch[1]);
      if (Number.isInteger(qty) && qty > 0) {
        items.push({
          category: "accessory",
          name: "Bộ chuột phím",
          quantity: qty,
        });
      }
    }

    // Nhóm 3: Màn hình văn phòng
    const monitorMatch = lowerText.match(/(\d+)\s*(?:cái|chiếc|màn)?\s*(?:màn hình|monitor)/i);
    if (monitorMatch) {
      const qty = Number(monitorMatch[1]);
      if (Number.isInteger(qty) && qty > 0) {
        items.push({
          category: "monitor",
          name: "Màn hình văn phòng",
          quantity: qty,
        });
      }
    }

    // 4. Bóc tách Yêu cầu Hóa đơn VAT và Tên Công ty
    const requireVAT = /hóa đơn vat|hoa don vat|hóa đơn đỏ|vat|xuất vat|xuất hóa đơn/i.test(lowerText);

    let companyName = null;
    const companyMatch = text.match(/(?:công ty|cty|doanh nghiệp)\s+(?:tnhh|cổ phần|cp|trách nhiệm hữu hạn)?\s*([^\n.,;]+)/i);
    if (companyMatch) {
      companyName = companyMatch[0].trim();
    }

    // 5. Đánh giá Tính Đầy Đủ & Xác định các câu hỏi cần làm rõ (Clarification Evaluation)
    const missingFields = [];
    const clarificationQuestions = [];

    if (items.length === 0) {
      missingFields.push("equipment_types");
      clarificationQuestions.push("Anh/chị cần trang bị những chủng loại thiết bị nào (ví dụ: laptop, màn hình, chuột phím)?");
    } else {
      for (const item of items) {
        if (item.quantity === null) {
          missingFields.push(`quantity_${item.category}`);
          clarificationQuestions.push(`Anh/chị dự kiến trang bị bao nhiêu ${item.name} cho nhân sự?`);
        }
      }
    }

    if (maxBudget === null) {
      missingFields.push("max_budget");
      clarificationQuestions.push("Mức ngân sách trần tối đa (Max Budget) cho đợt mua sắm này là bao nhiêu triệu VNĐ để ProcurePrime tối ưu cấu hình tốt nhất?");
    }

    const needsClarification = missingFields.length > 0;

    return {
      rawQuery: text,
      maxBudget,
      items,
      specifications: specs,
      requireVAT,
      companyName,
      needsClarification,
      missingFields,
      clarificationQuestions,
    };
  }
}

export default RequirementExtractionEngine;

