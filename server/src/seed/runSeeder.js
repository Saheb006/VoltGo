import mongoose from "mongoose";
import { dbConnection } from "../db/index.js";
import seedChargers from "./charger.seed.js";

const runSeeder = async () => {
    try {
        await dbConnection();
        console.log("Database connected for seeding...");

        await seedChargers();

        console.log("Seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

runSeeder();
