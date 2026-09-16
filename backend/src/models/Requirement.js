const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    // Step 1 - Event Basics
    eventName: {
      type: String,
      required: true,
      trim: true,
    },

    eventType: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    venue: {
      type: String,
      trim: true,
      default: "",
    },

    // Selected category
    category: {
      type: String,
      required: true,
      enum: ["planner", "performer", "crew"],
    },

    // Step 2 - Category-specific details
    categoryDetails: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Step 3 - Additional Requirements
    additionalRequirements: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Requirement", requirementSchema);
