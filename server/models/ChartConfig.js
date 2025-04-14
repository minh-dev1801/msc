import { Sequelize, sequelize } from "../database/db.js";

const ChartConfig = sequelize.define(
  "ChartConfig",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    chartType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    prompt: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "ChartConfigs",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  }
);

export default ChartConfig;
