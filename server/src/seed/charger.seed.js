import mongoose from "mongoose";
import Charger from "../models/charger.model.js";
import User from "../models/user.model.js";

const sampleChargers = [
    {
        name: "Tata Power Charging Station",
        address: "Connaught Place, New Delhi",
        address_details: "Near Palika Bazar",
        status: "active",
        charger_type: "DC Fast Charger",
        image_url:
            "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwxfHx8fDE3Njc1OTQ3OTF8MA&ixlib=rb-4.1.0&q=80&w=400",
        location: {
            type: "Point",
            coordinates: [77.209, 28.6139], // [lng, lat] - Connaught Place
        },
    },
    {
        name: "ChargePoint Hub",
        address: "Nehru Place, New Delhi",
        address_details: "Opposite Nehru Place Metro Station",
        status: "active",
        charger_type: "AC Type 2",
        image_url:
            "https://images.unsplash.com/photo-1610829356361-9a7cac1c34c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwxfHx8fDE3Njc1OTQ3OTF8MA&ixlib=rb-4.1.0&q=80&w=400",
        location: {
            type: "Point",
            coordinates: [77.25, 28.54], // [lng, lat] - Nehru Place
        },
    },
    {
        name: "EV Charging Station",
        address: "Karol Bagh, New Delhi",
        address_details: "Near Karol Bagh Metro Station",
        status: "active",
        charger_type: "DC Fast Charger",
        image_url:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwxfHx8fDE3Njc1OTQ3OTF8MA&ixlib=rb-4.1.0&q=80&w=400",
        location: {
            type: "Point",
            coordinates: [77.19, 28.65], // [lng, lat] - Karol Bagh
        },
    },
    {
        name: "Green Energy Charger",
        address: "South Extension, New Delhi",
        address_details: "Part 1 Market",
        status: "active",
        charger_type: "AC Type 2",
        image_url:
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwxfHx8fDE3Njc1OTQ3OTF8MA&ixlib=rb-4.1.0&q=80&w=400",
        location: {
            type: "Point",
            coordinates: [77.22, 28.58], // [lng, lat] - South Extension
        },
    },
    {
        name: "Power Grid Station",
        address: "Rajouri Garden, New Delhi",
        address_details: "Near District Centre",
        status: "active",
        charger_type: "DC Fast Charger",
        image_url:
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwxfHx8fDE3Njc1OTQ3OTF8MA&ixlib=rb-4.1.0&q=80&w=400",
        location: {
            type: "Point",
            coordinates: [77.12, 28.62], // [lng, lat] - Rajouri Garden
        },
    },
];

const seedChargers = async () => {
    try {
        // Find a charger owner user
        const chargerOwner = await User.findOne({ role: "charger_owner" });

        if (!chargerOwner) {
            console.log(
                "No charger owner found. Please create a charger owner user first."
            );
            return;
        }

        // Clear existing chargers
        await Charger.deleteMany({});

        // Add sample chargers with owner_id
        const chargersWithOwner = sampleChargers.map((charger) => ({
            ...charger,
            owner_id: chargerOwner._id,
        }));

        await Charger.insertMany(chargersWithOwner);

        console.log(
            `${chargersWithOwner.length} sample chargers seeded successfully!`
        );
    } catch (error) {
        console.error("Error seeding chargers:", error);
    }
};

export default seedChargers;
