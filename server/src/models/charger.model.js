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

    // GeoJSON location for nearby charger search
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
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

    connector_type: {
      type: [String], // example: ["CCS2", "CHAdeMO"]
      required: true,
      enum: ["Type 1", "Type 2", "CCS1", "CCS2", "CHAdeMO", "GB/T", "Tesla"], // Enforce standard types
    },

    max_charging_power_kw: {
      type: Number,
      required: true,
    },

    price_per_kwh: {
      type: Number,
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
  {
    timestamps: true,
  }
);

// 🔥 REQUIRED for geo queries (nearby chargers)
chargerSchema.index({ location: "2dsphere" });

export default mongoose.model("Charger", chargerSchema);
