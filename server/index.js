import { connectToSQLServer } from "./database/db.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pivotChartRoutes from "./routes/pivotChartRoutes.js";
import session from "express-session";
import Keycloak from "keycloak-connect";
import { errorHandler } from "./middleware/errorMiddleware.js";
import ChartConfig from "./models/ChartConfig.js";

dotenv.config();

const app = express();
const memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

const keycloak = new Keycloak({ store: memoryStore });

app.use(keycloak.middleware());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/public", (req, res) => {
  res.send("Public route");
});

app.get("/api/protected", keycloak.protect(), (req, res) => {
  const userInfo = req.kauth.grant.access_token.content;

  res.send({
    message: "This is a protected endpoint",
    user: {
      username: userInfo.preferred_username,
      email: userInfo.email,
      roles: userInfo.realm_access?.roles || [],
    },
  });
});

app.post("/api/createChart", keycloak.protect(), async (req, res) => {
  try {
    const { chartType, prompt } = req.body;
    const userInfo = req.kauth.grant.access_token.content;

    const newChartConfig = await ChartConfig.create({
      userId: userInfo.sub,
      chartType,
      prompt,
    });

    res.status(201).send({
      success: true,
      message: "Chart configuration saved successfully",
      data: newChartConfig,
    });
  } catch (error) {
    console.error("Error saving chart configuration:", error);
    res.status(500).send({
      success: false,
      message: "Failed to save chart configuration",
      error: error.message,
    });
  }
});

app.use("/api/bids/pivot", pivotChartRoutes);

connectToSQLServer().catch((err) => {
  console.error("Database connection failed", err);
  process.exit(1);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
