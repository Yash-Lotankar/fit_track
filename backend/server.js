// server.js
// This is the main entry point of the backend server

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config();

// Create the Express app
const app = express();

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────

// Allow requests from the frontend (Cross-Origin Resource Sharing)
app.use(cors());

// Parse incoming JSON data from requests
app.use(express.json());

// Serve frontend static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "../frontend")));

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

// Import and use workout routes
const workoutRoutes = require("./routes/workouts");
app.use("/api/workouts", workoutRoutes);

// Catch-all route: serve the frontend for any unmatched route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ─────────────────────────────────────────────
// DATABASE CONNECTION + SERVER START
// ─────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/fittrack";

// Connect to MongoDB, then start the server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");

    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`🚀 FitTrack server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit if we can't connect to the database
  });
