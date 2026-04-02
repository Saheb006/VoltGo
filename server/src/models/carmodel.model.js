import mongoose from "mongoose";

const CarModelSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },

  modelName: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  imageUrl: {
    type: String,
    default: ""
  },

  supportedConnectors: {
    type: [String],
    required: true,
    enum: ["Type1", "Type2", "CCS1", "CCS2", "CHAdeMO", "GBT", "Tesla"]
  },

  maxPowerKW: {
    type: Number,
    required: true
  },

  maxBatteryCapacity: {
    type: Number,
    required: true
  }

}, {
  timestamps: true
});

export default mongoose.model("CarModel", CarModelSchema);