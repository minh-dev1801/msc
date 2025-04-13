import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import "./PivotChart.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

const cleanNumber = (value) => {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const cleanedValue = String(value).replace(/\./g, "").replace(/,/g, ".");

  return parseFloat(cleanedValue) || 0;
};

const PivotChart = () => {
  const [data, setData] = useState({
    bidStats: [],
    investorStats: [],
    vendorStats: [],
  });

  console.log(data);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculatePercentageData = (bidStats) => {
    const cleanedStats = bidStats.map((item) => ({
      ...item,
      totalPrice: cleanNumber(item.totalPrice),
      fieldCategory: item.fieldCategory || "Không xác định",
    }));

    const total = cleanedStats.reduce((sum, item) => sum + item.totalPrice, 0);
    return cleanedStats.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.totalPrice / total) * 100 : 0,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/bids/pivot"
        );
        const pivotData = response.data;

        const cleanedInvestorStats = pivotData.investorStats.map((item) => ({
          investorName: item.investorName || "Không xác định",
          totalPrice: cleanNumber(item.totalPrice),
        }));

        const cleanedVendorStats = pivotData.vendorStats.map((item) => ({
          vendorName: item.vendorName || "Không xác định",
          totalPrice: cleanNumber(item.totalPrice),
        }));

        setData({
          bidStats: calculatePercentageData(pivotData.bidStats),
          investorStats: cleanedInvestorStats,
          vendorStats: cleanedVendorStats,
        });
      } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu:", error);
        setError("Không thể tải dữ liệu từ server");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="loading-container">
        <p>⏳ Đang tải dữ liệu...</p>
      </div>
    );
  if (error)
    return (
      <div className="error-container">
        <p>❌ {error}</p>
      </div>
    );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyTooltip = (value) => {
    return new Intl.NumberFormat().format(value) + " VNĐ";
  };

  const formatCompactCurrency = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} triệu`;
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatLongName = (name, maxLength = 30, shouldAbbreviate = true) => {
    if (!name) return "Không xác định";

    if (shouldAbbreviate) {
      const abbreviations = {
        "THƯƠNG MẠI": "TM",
        "TRÁCH NHIỆM HỮU HẠN": "TNHH",
        "CÔNG TY": "CTY",
        "PHÁT TRIỂN": "PT",
        "ĐIỆN LỰC": "ĐL",
        "VIỄN THÔNG": "VT",
        "THÔNG TIN": "TT",
        "CÔNG NGHỆ": "CN",
        "PHÂN CÔNG": "PC",
        "TỔNG CÔNG TY": "TCT",
        "CỔ PHẦN": "CP",
        "NGÂN HÀNG": "NH",
        "NGOẠI THƯƠNG": "NT",
        "PHÁT TRIỂN CÔNG NGHỆ": "PTCN",
        "ĐIỆN TỬ": "ĐT",
      };

      let shortName = name;

      Object.entries(abbreviations).forEach(([long, short]) => {
        shortName = shortName.replace(new RegExp(long, "gi"), short);
      });
      return shortName;
    }

    if (name.length > maxLength) {
      return name.substring(0, maxLength - 3) + "...";
    }

    return name;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const originalName = payload[0].payload.originalName || label;
      return (
        <div className="custom-tooltip">
          <p className="label">{originalName}</p>
          <p className="value">{formatCurrencyTooltip(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{payload[0].name}</p>
          <p className="value">{`${payload[0].value.toFixed(
            2
          )}% (${formatCurrency(payload[0].payload.totalPrice)})`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Báo cáo thống kê đấu thầu</h1>

      <div className="chart-row">
        <div className="chart-container">
          <h2>Tỉ trọng các lĩnh vực</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data.bidStats}
                dataKey="percentage"
                nameKey="fieldCategory"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={5}
                label={({ name, percentage }) =>
                  `${formatLongName(name)}\n${percentage.toFixed(1)}%`
                }
                labelLine={false}
              >
                {data.bidStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                formatter={(value, entry, index) => (
                  <span className="vietnamese-text">
                    {formatLongName(value)} (
                    {data.bidStats[index]?.percentage.toFixed(1)}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-row">
        <div className="chart-container">
          <h2>Top 10 chủ đầu tư</h2>
          <ResponsiveContainer width="100%" height={600}>
            <BarChart
              data={data.investorStats.slice(0, 10).map((item) => ({
                ...item,
                originalName: item.investorName,
                investorName: formatLongName(item.investorName, 45, false),
              }))}
              margin={{ top: 20, right: 50, left: 50, bottom: 60 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={formatCompactCurrency}
                tick={{ fontFamily: "Roboto" }}
              />
              <YAxis
                type="category"
                dataKey="investorName"
                width={250}
                tick={{ fontSize: 12, fontFamily: "Roboto" }}
                tickFormatter={(value) => formatLongName(value, 45, false)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="totalPrice"
                name="Tổng giá trị (VND)"
                fill="#0088FE"
                radius={[0, 4, 4, 0]}
              >
                <LabelList
                  dataKey="totalPrice"
                  position="right"
                  formatter={formatCompactCurrency}
                  style={{ fontFamily: "Roboto" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Top nhà cung cấp</h2>
          <ResponsiveContainer width="100%" height={600}>
            <BarChart
              data={data.vendorStats.slice(0, 10).map((item) => ({
                ...item,
                originalName: item.vendorName,
                vendorName: formatLongName(item.vendorName, 45, false),
              }))}
              margin={{ top: 20, right: 50, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="vendorName"
                angle={-45}
                textAnchor="end"
                height={150}
                tick={{ fontSize: 12, fontFamily: "Roboto" }}
              />
              <YAxis
                tickFormatter={formatCompactCurrency}
                tick={{ fontFamily: "Roboto" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="totalPrice"
                name="Tổng giá trị (VND)"
                fill="#00C49F"
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="totalPrice"
                  position="top"
                  formatter={formatCompactCurrency}
                  style={{ fontFamily: "Roboto" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PivotChart;
