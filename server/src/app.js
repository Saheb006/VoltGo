import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";
import carRoutes from "./routes/car.routes.js";
import chargerRoutes from "./routes/charger.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";

import { ApiResponse } from "./utils/ApiResponse.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(
    cors({
        origin: [
            process.env.CORS_ORIGIN,
            "http://localhost:5173",
            "http://localhost:9000",
        ],
        credentials: true,
    })
);

// BODY PARSERS (must be BEFORE routes)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// STATIC FILES (match folder name exactly)
app.use(express.static("public"));

// COOKIES
app.use(cookieParser());

// ROUTES

// Temporary request logger (can be removed in production)
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/cars", carRoutes);
app.use("/api/v1/chargers", chargerRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);

app.get("/home", (req, res) => {
    res.send("Backend is running");
});

// GLOBAL ERROR HANDLER – ensures consistent JSON responses
// Must be after all routes / middlewares
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode || 500).json({
            success: false,
            statusCode: err.statusCode || 500,
            message: err.message || "Something went wrong",
            errors: err.error || [],
        });
    }

    return res.status(500).json({
        success: false,
        statusCode: 500,
        message: err && err.message ? err.message : "Internal server error",
    });
});

export default app;
