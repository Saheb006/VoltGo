import mongoose from "mongoose";
import dotenv from "dotenv";
import SubscriptionPlan from "../models/subscription_plan.model.js";

dotenv.config();

const plans = [
    {
        name: "basic",
        price: 1,
        max_chargers: 2,
        max_ports_per_charger: 4,
        description: "Up to 2 chargers with 4 ports each",
    },
    {
        name: "pro",
        price: 2,
        max_chargers: 5,
        max_ports_per_charger: 4,
        description: "Up to 5 chargers with 4 ports each",
    },
    {
        name: "enterprise",
        price: 3,
        max_chargers: null,
        max_ports_per_charger: null,
        description: "Unlimited chargers with unlimited ports",
    },
];

const seedPlans = async () => {
    try {
        // 🔑 CONNECT TO DB + FORCE DATABASE NAME
        await mongoose.connect(process.env.MONGODB_URL, {
            dbName: "evbackend",
        });

        console.log("MongoDB connected for seeding (evbackend)");

        // optional: clear old plans
        await SubscriptionPlan.deleteMany();

        // insert new plans
        await SubscriptionPlan.insertMany(plans);

        console.log("Subscription plans seeded successfully");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedPlans();
