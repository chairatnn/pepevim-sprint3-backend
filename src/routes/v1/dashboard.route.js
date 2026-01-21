import express from "express";
import { getDashboard, seedDashboardData, updateDashboard } from "../../modules/dashboard/dashboard.controller.js";


export const router = express.Router();

router.get("/", getDashboard);

// เฉพาะ Admin
router.post("/", updateDashboard);

// สร้างข้อมูลทดสอบ
router.post("/seed", seedDashboardData);
