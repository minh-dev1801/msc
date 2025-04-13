import { connectToSQLServer } from "./database/db.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pivorChartRoutes from "./routes/pivotChartRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectToSQLServer();

app.use("/api/bids/pivot", pivorChartRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
