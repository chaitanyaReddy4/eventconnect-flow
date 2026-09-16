const express = require("express");
const cors = require("cors");
require("dotenv").config();

const requirementRoutes = require("./routes/requirementRoutes");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/api/requirements", requirementRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GoPratle Requirement API is running",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server because MongoDB connection failed.");
    process.exit(1);
  }
};

startServer();
