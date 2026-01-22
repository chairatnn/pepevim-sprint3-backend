import express from "express";
import { 
  getDashboardSummary, 
  updateDashboardConfig,
  getSalesAnalytics 
} from "../controllers/dashboard.controller.js";
// สมมติว่ามี middleware สำหรับตรวจสอบ token และสิทธิ์ admin
// import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   GET /api/v1/dashboard/summary
 * @desc    ดึงข้อมูลภาพรวม (Stats cards + Charts data)
 * @access  Private (Admin Only)
 */
router.get("/summary", getDashboardSummary);

/**
 * @route   GET /api/v1/dashboard/sales-analytics
 * @desc    ดึงข้อมูลวิเคราะห์ยอดขายแยกตามช่วงเวลา (เช่น 7 วันล่าสุด, 30 วันล่าสุด)
 * @access  Private (Admin Only)
 */
router.get("/sales-analytics", getSalesAnalytics);

/**
 * @route   PATCH /api/v1/dashboard/config
 * @desc    อัปเดตการตั้งค่า Dashboard (เช่น เปลี่ยนชื่อกราฟ หรือสีที่ใช้แสดงผล)
 * @access  Private (Admin Only)
 */
router.patch("/config", updateDashboardConfig);

export default router;