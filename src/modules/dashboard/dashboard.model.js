import mongoose from "mongoose";

/**
 * Schema สำหรับเก็บการตั้งค่าของกราฟ (เช่น สี, ชื่อแกน)
 * แทนที่จะเก็บข้อมูลตัวเลข (ซึ่งจะดึงจาก Order แทน)
 */
const chartConfigSchema = new mongoose.Schema({
  label: { type: String, required: true },
  color: { type: String, required: true },
}, { _id: false });

const dashboardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Store Overview Dashboard",
    },
    
    // ตั้งค่าสำหรับกราฟยอดขาย (ใช้ดึงข้อมูลจาก Order)
    salesChart: {
      // เก็บเฉพาะ Config ส่วน Data จะถูกเติมด้วย Aggregation จาก Order
      config: {
        type: Map,
        of: chartConfigSchema,
        default: {
          clothes: { label: "Clothes", color: "#A71B79" },
          cosmetics: { label: "Cosmetics", color: "#E0C013" },
        }
      }
    },

    // ข้อมูลสำหรับกราฟวงกลม (Collections/Categories)
    collectionsChart: {
      // ส่วนนี้สามารถเก็บ data ไว้ในนี้ได้หากต้องการกำหนดสัดส่วนเอง 
      // หรือปล่อยว่างเพื่อดึงจากฐานข้อมูลสินค้า
      data: [
        {
          browser: { type: String },
          collections: { type: Number },
          fill: { type: String },
        }
      ],
      config: {
        type: Map,
        of: chartConfigSchema,
      },
    },

    // ฟิลด์เพิ่มเติมสำหรับแสดงตัวเลขสรุปบนหน้าจอ
    lastCalculated: {
      type: Date,
      default: Date.now,
    }
  },
  { 
    timestamps: true,
    // อนุญาตให้เก็บฟิลด์อื่นที่ไม่ได้ระบุไว้ (เผื่อการขยายตัวในอนาคต)
    strict: false 
  }
);

// สร้าง Index เพื่อให้ดึงข้อมูลล่าสุดได้เร็วขึ้น
dashboardSchema.index({ createdAt: -1 });

export const Dashboard = mongoose.model("Dashboard", dashboardSchema);