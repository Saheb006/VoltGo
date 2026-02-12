import mongoose from "mongoose";

const chargerPortSchema = new mongoose.Schema(
    {
        charger_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Charger",
            required: true,
            index: true,
        },

        port_number: {
            type: Number,
            required: true,
        },

        connector_type: {
            type: String,
            enum: [
                "Type 1",
                "Type 2",
                "CCS1",
                "CCS2",
                "CHAdeMO",
                "GB/T",
                "Tesla",
            ],
            required: true,
        },

        max_power_kw: {
            type: Number,
            required: true,
        },

        price_per_kwh: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: ["available", "occupied", "faulty", "unavailable"],
            default: "available",
        },
    },
    {
        timestamps: true,
    }
);

chargerPortSchema.index({ charger_id: 1, port_number: 1 }, { unique: true });

export default mongoose.model("ChargerPort", chargerPortSchema);
