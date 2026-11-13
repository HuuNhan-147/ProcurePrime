// backend/src/controllers/quotationController.js
// ============================================
// QUOTATION CONTROLLER — Điều phối API Báo Giá Thương Mại B2B
// ============================================

import { QuotationService } from "../modules/quotation/QuotationService.js";
import { QuotationTemplateRenderer } from "../modules/quotation/QuotationTemplateRenderer.js";
import { QuotationExcelExporter } from "../modules/quotation/QuotationExcelExporter.js";
import { successResponse } from "../shared/helpers/responseHelper.js";

export class QuotationController {
  /**
   * POST /api/quotations — Khởi tạo bản báo giá thương mại B2B
   */
  static async create(req, res, next) {
    try {
      const quotation = await QuotationService.createQuotation(req.body);
      return successResponse(res, quotation, "Khởi tạo báo giá thương mại thành công", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/quotations/:quotationNumber — Lấy chi tiết báo giá JSON
   */
  static async getDetail(req, res, next) {
    try {
      const { quotationNumber } = req.params;
      const quotation = await QuotationService.getQuotation(quotationNumber);
      return successResponse(res, quotation, "Lấy thông tin báo giá thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/quotations/:quotationNumber/html — Xuất bản in HTML báo giá chuẩn mực
   */
  static async getHtml(req, res, next) {
    try {
      const { quotationNumber } = req.params;
      const quotation = await QuotationService.getQuotation(quotationNumber);
      const html = QuotationTemplateRenderer.renderToHtml(quotation);

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(html);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/quotations/:quotationNumber/excel — Tự động tải file Excel báo giá doanh nghiệp (.xlsx)
   */
  static async getExcel(req, res, next) {
    try {
      const { quotationNumber } = req.params;
      const quotation = await QuotationService.getQuotation(quotationNumber);
      const buffer = await QuotationExcelExporter.exportToBuffer(quotation);

      const orgName = (quotation.organizationSnapshot?.name || "DoanhNghiep")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .slice(0, 20);
      const fileName = `Bao_Gia_${quotation.quotationNumber}_${orgName}.xlsx`;

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/quotations/:quotationNumber/approve — Phê duyệt báo giá (Manager / CFO)
   */
  static async approve(req, res, next) {
    try {
      const { quotationNumber } = req.params;
      const { approverNote } = req.body;
      const finalRole = "ADMIN";
      const quotation = await QuotationService.approveQuotation(quotationNumber, finalRole, approverNote);
      return successResponse(res, quotation, "Phê duyệt báo giá thành công");
    } catch (error) {
      next(error);
    }
  }
}

