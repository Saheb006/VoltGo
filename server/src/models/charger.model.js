import mongoose from "mongoose";

const chargerSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    address_details: {
      type: String,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },

    charger_type: {
      type: String,
      enum: ["AC", "DC"],
      required: true,
    },

    image_url: {
      type: String,
    },

    avg_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    rating_count: {
      type: Number,
      default: 0,
    },

    total_sessions: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

chargerSchema.index({ location: "2dsphere" });

export default mongoose.model("Charger", chargerSchema);

