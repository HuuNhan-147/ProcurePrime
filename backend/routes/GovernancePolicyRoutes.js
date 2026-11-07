// backend/routes/GovernancePolicyRoutes.js
import express from "express";
import {
  getActivePolicy,
  updatePolicy,
  simulatePolicy,
} from "../controller/GovernancePolicyController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Lấy thông tin chính sách đang hiệu lực
router.get("/policy", getActivePolicy);

// Cập nhật chính sách (yêu cầu quyền Admin)
router.put("/policy", protect, admin, updatePolicy);

// Giả lập kiểm thử Sandbox (cho phép nhân viên / admin test thử)
router.post("/simulate", simulatePolicy);

export default router;

