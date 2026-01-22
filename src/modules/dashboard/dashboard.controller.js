import { Order } from "../models/order.model.js"; // ตรวจสอบ path ให้ถูกต้อง
import mongoose from "mongoose";

/**
 * @desc    Get dashboard summary data (Stats & Charts)
 * @route   GET /api/v1/dashboard/summary
 */
export const getDashboardSummary = async (req, res) => {
  try {
    // 1. คำนวณสรุปยอด (Stats Boxes)
    // ใช้ Aggregate เพื่อดึงข้อมูลหลายอย่างพร้อมกันเพื่อประสิทธิภาพ
    const stats = await Order.aggregate([
      {
        $facet: {
          // คำนวณรายได้รวม (เฉพาะที่จ่ายเงินแล้วหรือสำเร็จแล้ว)
          totalRevenue: [
            { $match: { status: { $in: ["paid", "shipped", "completed"] } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
          ],
          // นับจำนวนออเดอร์แยกตามสถานะ
          statusCounts: [
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          // นับจำนวนออเดอร์ทั้งหมด
          totalOrders: [
            { $count: "count" }
          ]
        }
      }
    ]);

    // 2. ข้อมูลยอดขายรายวันย้อนหลัง 7 วัน (สำหรับ Line Chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesHistory = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $in: ["paid", "shipped", "completed"] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // จัดโครงสร้างข้อมูลใหม่ให้ใช้งานง่าย
    const dashboardData = {
      summary: {
        totalRevenue: stats[0].totalRevenue[0]?.total || 0,
        totalOrders: stats[0].totalOrders[0]?.count || 0,
        statusBreakdown: stats[0].statusCounts
      },
      salesHistory: salesHistory
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงข้อมูล Dashboard ได้",
      error: error.message
    });
  }
};

/**
 * @desc    Get Top 5 Best Selling Products
 * @route   GET /api/v1/dashboard/top-products
 */
export const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      // 1. กรองเฉพาะออเดอร์ที่สำเร็จ
      { $match: { status: { $in: ["paid", "shipped", "completed"] } } },
      
      // 2. กระจาย Array items ออกเป็นทีละชิ้น (สำคัญมากสำหรับ schema ของคุณ)
      { $unwind: "$items" },
      
      // 3. จัดกลุ่มตาม productId และคำนวณยอด
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          totalQuantity: { $sum: "$items.quantity" },
          totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      
      // 4. เรียงลำดับจากจำนวนที่ขายได้มากที่สุด
      { $sort: { totalQuantity: -1 } },
      
      // 5. เอาแค่ 5 อันดับแรก
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงข้อมูลสินค้าขายดีได้",
      error: error.message
    });
  }
};