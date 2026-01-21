import * as mockup from "../../mock-db/dashboard.js"; 
import { Dashboard } from "./dashboard.model.js";

export const getDashboard = async (req, res) => {
  try {

    let dashboardFromDB = await Dashboard.findOne().sort({ createdAt: -1 });

    const responseData = dashboardFromDB ? {
      salesChart: dashboardFromDB.salesChart,
      collectionsChart: dashboardFromDB.collectionsChart,
    } : {
      // ใช้ข้อมูลจากไฟล์ mockup ที่ import มา
      salesChart: {
        data: mockup.chartData,
        config: mockup.chartConfig
      },
      collectionsChart: {
        data: mockup.chartData2,
        config: mockup.chartConfig2
      }
    };

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message
    });
  }
};

export const updateDashboard = async (req, res) => {
  try {
    const { salesChart, collectionsChart, title } = req.body;

    const updatedDashboard = await Dashboard.findOneAndUpdate(
      {}, 
      { 
        title, 
        salesChart, 
        collectionsChart,
        updatedAt: Date.now() 
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "อัปเดตข้อมูล Dashboard สำเร็จ ✅",
      data: updatedDashboard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "ไม่สามารถอัปเดตข้อมูลได้",
      error: error.message
    });
  }
};

export const seedDashboardData = async (req, res) => {
  try {
    // ใช้ข้อมูลจาก mockup file เป็น initialData
    const initialData = {
      title: "Main Sales Dashboard",
      salesChart: {
        data: mockup.chartData,
        config: mockup.chartConfig
      },
      collectionsChart: {
        data: mockup.chartData2,
        config: mockup.chartConfig2
      }
    };

    await Dashboard.deleteMany({}); 
    const newDashboard = await Dashboard.create(initialData);

    res.status(201).json({
      success: true,
      message: "Seed data success ✅",
      data: newDashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};