// models/Workout.js
// This file defines the structure (schema) for workout data stored in MongoDB

const mongoose = require("mongoose");

// Define the shape of each workout document in MongoDB
const workoutSchema = new mongoose.Schema(
  {
    // Name of the workout (e.g., "Morning Run", "Chest Day")
    name: {
      type: String,
      required: [true, "Workout name is required"],
      trim: true, // Removes extra spaces from start/end
    },

    // Type/category of workout
    type: {
      type: String,
      required: [true, "Workout type is required"],
      enum: ["Cardio", "Strength", "Flexibility", "Sports", "Other"],
    },

    // How long the workout lasted (in minutes)
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },

    // Estimated calories burned during the workout
    calories: {
      type: Number,
      required: [true, "Calories burned is required"],
      min: [0, "Calories cannot be negative"],
    },

    // Optional notes about the workout
    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // Date the workout was performed
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the model so other files can use it
module.exports = mongoose.model("Workout", workoutSchema);
