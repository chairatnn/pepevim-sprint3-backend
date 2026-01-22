import express from "express";
import { getDashboardSummary} from "../../modules/dashboard/dashboard.controller.js";


export const router = express.Router();

router.get("/", getDashboardSummary);

// // เฉพาะ Admin
// router.post("/", updateDashboard);

// // สร้างข้อมูลทดสอบ
// router.post("/seed", seedDashboardData);
