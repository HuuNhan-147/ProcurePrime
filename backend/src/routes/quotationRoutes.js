// backend/src/routes/quotationRoutes.js
// ============================================
// QUOTATION ROUTES — Tuyến đường API Báo Giá Thương Mại
// ============================================

import express from "express";
import { QuotationController } from "../controllers/quotationController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", QuotationController.create);
router.get("/:quotationNumber", QuotationController.getDetail);
router.get("/:quotationNumber/html", QuotationController.getHtml);
router.get("/:quotationNumber/excel", QuotationController.getExcel);
router.patch("/:quotationNumber/approve", protect, QuotationController.approve);

export default router;
