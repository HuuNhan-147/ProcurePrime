// backend/src/modules/procurement/SpecificationMatchingService.js
// ============================================
// SPECIFICATION MATCHING SERVICE — So khớp Cấu hình Kỹ thuật B2B
// ============================================

import { AppError } from "../../shared/errors/AppError.js";

export class SpecificationMatchingService {
  /**
   * Bóc tách các thông số phần cứng từ văn bản tự nhiên (RAM, SSD/HDD, CPU)
   * @param {string} queryText - Câu yêu cầu của khách hàng
   * @returns {Object} Các ràng buộc kỹ thuật trích xuất được
   */
  static extractSpecsFromText(queryText) {
    if (typeof queryText !== "string" || queryText.trim().length === 0) {
      throw AppError.badRequest("Văn bản yêu cầu bóc tách thông số không được để trống", "ERR_EMPTY_QUERY");
    }

    const text = queryText.toLowerCase();
    const specs = {};

    // 1. Trích xuất RAM tối thiểu (VD: '16gb ram', 'ram tối thiểu 16gb', 'ram 32gb')
    const ramMatch = text.match(/(?:ram\s*(?:tối thiểu|ít nhất)?\s*(\d+)\s*gb|(\d+)\s*gb\s*ram)/i);
    if (ramMatch) {
      const gb = Number(ramMatch[1] || ramMatch[2]);
      if (Number.isInteger(gb) && gb > 0) {
        specs.minRamGb = gb;
      }
    }

    // 2. Trích xuất Dung lượng Ổ cứng (SSD/HDD)
    const storageMatch = text.match(/(?:ssd|ổ cứng|o cung|storage)\s*(\d+)\s*(gb|tb)|(\d+)\s*(gb|tb)\s*(?:ssd|ổ cứng)/i);
    if (storageMatch) {
      const val = Number(storageMatch[1] || storageMatch[3]);
      const unit = (storageMatch[2] || storageMatch[4] || "gb").toLowerCase();
      specs.minStorageGb = unit === "tb" ? val * 1024 : val;
    }

    // 3. Trích xuất Dòng Chip CPU (Core i5, Core i7, M1, M2, M3, Ryzen 5, Ryzen 7)
    const cpuMatch = text.match(/(core\s*i[3579]|ryzen\s*[3579]|apple\s*m[1234]|m[1234]\s*pro|m[1234]\s*max)/i);
    if (cpuMatch) {
      specs.cpuFamily = cpuMatch[1].replace(/\s+/g, " ").toUpperCase();
    }

    return specs;
  }

  /**
   * So khớp một sản phẩm với các ràng buộc cấu hình kỹ thuật
   * @param {Object} product - Đối tượng Product (kèm specifications populated hoặc dạng object)
   * @param {Object} constraints - Các ràng buộc: { minRamGb, minStorageGb, cpuFamily }
   * @returns {Object} Kết quả so khớp: { isMatched, score, matchedSpecs, missingSpecs }
   */
  static matchProductSpecs(product, constraints = {}) {
    if (!product || typeof product !== "object") {
      throw AppError.badRequest("Dữ liệu sản phẩm so khớp không hợp lệ", "ERR_INVALID_PRODUCT");
    }

    const matchedSpecs = {};
    const failedSpecs = [];
    let matchScore = 100;

    // Chuẩn hóa danh mục thông số của sản phẩm
    const productSpecMap = new Map();
    if (Array.isArray(product.specifications)) {
      for (const spec of product.specifications) {
        if (spec && typeof spec.key === "string" && spec.value !== undefined) {
          productSpecMap.set(spec.key.toLowerCase().trim(), String(spec.value).toLowerCase().trim());
        }
      }
    }

    // Chuỗi text mô tả chung để fallback tìm kiếm nếu specifications chưa được tạo dạng bảng
    const fullTextDescription = `${product.name || ""} ${product.description || ""}`.toLowerCase();

    // 1. Kiểm tra RAM
    if (constraints.minRamGb) {
      const targetRam = Number(constraints.minRamGb);
      let detectedRam = null;

      // Tìm trong bảng specs
      for (const [k, v] of productSpecMap.entries()) {
        if (k.includes("ram") || k.includes("bộ nhớ") || k.includes("memory")) {
          const m = v.match(/(\d+)\s*gb/i);
          if (m) detectedRam = Number(m[1]);
        }
      }

      // Nếu bảng specs không có, tìm trong tên/mô tả sản phẩm
      if (detectedRam === null) {
        const m = fullTextDescription.match(/(\d+)\s*gb\s*ram|ram\s*(\d+)\s*gb/i);
        if (m) detectedRam = Number(m[1] || m[2]);
      }

      if (detectedRam !== null) {
        if (detectedRam >= targetRam) {
          matchedSpecs.ram = `${detectedRam}GB (Đạt chuẩn >= ${targetRam}GB)`;
        } else {
          failedSpecs.push(`RAM ${detectedRam}GB không đạt mức tối thiểu ${targetRam}GB`);
          matchScore -= 40;
        }
      } else {
        // Không tìm thấy thông số RAM
        failedSpecs.push(`Chưa xác định được thông số RAM`);
        matchScore -= 20;
      }
    }

    // 2. Kiểm tra CPU
    if (constraints.cpuFamily) {
      const targetCpu = constraints.cpuFamily.toLowerCase();
      const hasCpu = fullTextDescription.includes(targetCpu);
      if (hasCpu) {
        matchedSpecs.cpu = `Khớp dòng chip ${constraints.cpuFamily}`;
      } else {
        failedSpecs.push(`Không khớp dòng CPU yêu cầu: ${constraints.cpuFamily}`);
        matchScore -= 30;
      }
    }

    const isMatched = failedSpecs.length === 0;

    return {
      productId: product._id ? String(product._id) : (product.id || "unknown"),
      productName: product.name || "Sản phẩm",
      isMatched,
      matchScore: Math.max(0, matchScore),
      matchedSpecs,
      failedSpecs,
    };
  }
}

export default SpecificationMatchingService;

