const mongoose = require('mongoose');

// Schema for a workout log entry
const workoutSchema = new mongoose.Schema({
  exercise: { type: String, required: true },
  category: { type: String, required: true },   // e.g. Cardio, Strength
  duration: { type: Number, required: true },    // in minutes
  calories: { type: Number, required: true },
  date: { type: String, required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);