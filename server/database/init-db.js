import { sequelize } from "./db.js";
import ChartConfig from "./models/ChartConfig.js";

if (process.env.NODE_ENV === "production") {
  console.error("Không thể chạy init-db trong môi trường sản xuất!");
  process.exit(1);
}

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error("Lỗi khi làm mới cơ sở dữ liệu:", error);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch (error) {
      console.error("Lỗi khi đóng kết nối:", error);
      process.exit(1);
    }
  }
};

initDatabase();
