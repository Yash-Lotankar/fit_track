// routes/workouts.js
// This file handles all API routes for workout CRUD operations

const express = require("express");
const router = express.Router();
const Workout = require("../models/Workout");

// ─────────────────────────────────────────────
// GET /api/workouts — Fetch all workouts
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    // Find all workouts, sorted by date (newest first)
    const workouts = await Workout.find().sort({ date: -1 });

    res.json({
      success: true,
      count: workouts.length,
      data: workouts,
    });
  } catch (error) {
    // Send a 500 error if something goes wrong on the server
    res.status(500).json({
      success: false,
      message: "Failed to fetch workouts",
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────
// GET /api/workouts/:id — Fetch a single workout by ID
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    // If no workout found, return 404
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    res.json({ success: true, data: workout });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch workout",
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/workouts — Create a new workout
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    // Destructure the fields we expect from the request body
    const { name, type, duration, calories, notes, date } = req.body;

    // Create a new workout document in MongoDB
    const workout = await Workout.create({
      name,
      type,
      duration,
      calories,
      notes,
      date,
    });

    // Return the newly created workout with 201 (Created) status
    res.status(201).json({
      success: true,
      message: "Workout logged successfully!",
      data: workout,
    });
  } catch (error) {
    // Handle validation errors separately (e.g., missing required fields)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create workout",
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────
// PUT /api/workouts/:id — Update an existing workout
// ─────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    // Find the workout by ID and update it with the new data
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body, // The updated fields
      {
        new: true,          // Return the updated document (not the old one)
        runValidators: true, // Re-run schema validation on update
      }
    );

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    res.json({
      success: true,
      message: "Workout updated successfully!",
      data: workout,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update workout",
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/workouts/:id — Delete a workout
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    res.json({
      success: true,
      message: "Workout deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete workout",
      error: error.message,
    });
  }
});

module.exports = router;
