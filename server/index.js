import { connectToSQLServer } from "./database/db.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pivotChartRoutes from "./routes/pivotChartRoutes.js";
import session from "express-session";
import Keycloak from "keycloak-connect";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const memoryStore = new session.MemoryStore();

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

// Keycloak configuration
const keycloak = new Keycloak({ store: memoryStore });

// Middleware
app.use(keycloak.middleware());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Public route");
});

app.get("/protected", keycloak.protect(), (req, res) => {
  res.send("Protected route");
});

app.get("/login", (req, res) => {
  if (req.kauth && req.kauth.grant) {
    return res.redirect("/protected");
  }

  const redirectUrl = `${
    process.env.BASE_URL || "http://localhost:5000"
  }/protected`;
  res.redirect(
    keycloak.loginUrl({
      redirectUri: redirectUrl,
    })
  );
});

// API Routes - protected with Keycloak
app.use("/api/bids/pivot", keycloak.protect(), pivotChartRoutes);

// Error handling middleware
app.use(errorHandler);

// Database connection
connectToSQLServer().catch((err) => {
  console.error("Database connection failed", err);
  process.exit(1);
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
