import express from "express";
import Bid from "../models/bidModel.js";

const router = express.Router();

// API lấy dữ liệu tổng hợp theo lĩnh vực, nhà đầu tư, vendor
router.get("/", async (req, res) => {
  try {
    // 1. Tổng hợp theo lĩnh vực (fieldCategory)
    const bidStats = await Bid.findAll({
      attributes: [
        "fieldCategory",
        [Bid.sequelize.fn("SUM", Bid.sequelize.col("bidPrice")), "totalPrice"],
      ],
      group: ["fieldCategory"],
    });

    // 2. Tổng hợp theo nhà đầu tư (investorName)
    const investorStats = await Bid.findAll({
      attributes: [
        "investorName",
        [Bid.sequelize.fn("SUM", Bid.sequelize.col("bidPrice")), "totalPrice"],
      ],
      group: ["investorName"],
      order: [[Bid.sequelize.fn("SUM", Bid.sequelize.col("bidPrice")), "DESC"]],
      limit: 10,
    });

    // 3. Tổng hợp dữ liệu từ cột vendors (JSON)
    const vendors = await Bid.findAll({
      attributes: ["vendors"], // Sửa lỗi từ vendos thành vendors
    });

    // Xử lý dữ liệu JSON từ cột vendors để tổng hợp số lần xuất hiện của mỗi vendor
    const vendorCounts = {};
    const vendorPrices = {};

    vendors.forEach((record) => {
      let vendorsData = record.vendors; // Dữ liệu từ DB là string: { "Palo Alto": 12, "Paessler": 1 }

      // Parse chuỗi JSON thành object nếu đang là chuỗi
      if (vendorsData && typeof vendorsData === "string") {
        try {
          vendorsData = JSON.parse(vendorsData);
        } catch (error) {
          console.error("Lỗi khi parse vendors JSON:", error);
          vendorsData = {};
        }
      }

      // Xử lý dữ liệu sau khi đã chuyển thành object
      if (
        vendorsData &&
        typeof vendorsData === "object" &&
        Object.keys(vendorsData).length > 0
      ) {
        Object.keys(vendorsData).forEach((vendor) => {
          vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1;
          vendorPrices[vendor] =
            (vendorPrices[vendor] || 0) + (vendorsData[vendor] || 1);
        });
      }
    });

    // Lấy thông tin bid price cho mỗi vendor
    const bidsWithVendors = await Bid.findAll({
      attributes: ["vendors", "bidPrice"],
    });

    // Tổng hợp giá trị bid cho mỗi vendor
    const vendorTotalPrices = {};
    bidsWithVendors.forEach((bid) => {
      let vendorsData = bid.vendors;
      if (typeof vendorsData === "string") {
        try {
          vendorsData = JSON.parse(vendorsData);
        } catch (error) {
          vendorsData = {};
        }
      }

      if (vendorsData && typeof vendorsData === "object") {
        Object.keys(vendorsData).forEach((vendor) => {
          vendorTotalPrices[vendor] =
            (vendorTotalPrices[vendor] || 0) + bid.bidPrice;
        });
      }
    });

    // Chuyển vendorCounts thành mảng để trả về
    const vendorStats = Object.entries(vendorCounts)
      .map(([name, count]) => ({
        vendorName: name,
        count,
        totalPrice: vendorTotalPrices[name] || 0,
      }))
      .sort((a, b) => b.totalPrice - a.totalPrice);

    // Trả về kết quả
    res.json({
      bidStats,
      investorStats,
      vendorStats,
    });
  } catch (error) {
    console.error("❌ Lỗi API:", error.message);
    res.status(500).json({ error: "Lỗi server: " + error.message });
  }
});

export default router;
