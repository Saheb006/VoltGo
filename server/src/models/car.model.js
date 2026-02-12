import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
    {
        owner_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        company: {
            type: String,
            required: true,
            trim: true,
        },

        model: {
            type: String,
            required: true,
            trim: true,
        },

        launchYear: {
            type: Number,
            required: true,
        },

        license_plate: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },

        battery_capacity_kwh: {
            type: Number,
            required: true,
        },

        max_charging_power_kw: {
            type: Number,
            required: true,
        },

        connector_type: {
            type: [String],
            required: true,
            enum: [
                "Type 1",
                "Type 2",
                "CCS1",
                "CCS2",
                "CHAdeMO",
                "GB/T",
                "Tesla",
            ], // Enforce standard types
        },
    },
    {
        timestamps: true,
    }
);

export const Car = mongoose.model("Car", carSchema);

export default Car;
