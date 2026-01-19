import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";
import carRoutes from "./routes/car.routes.js";
import chargerRoutes from "./routes/charger.routes.js";


const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:9000",
  credentials: true,
}));

// BODY PARSERS (must be BEFORE routes)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// STATIC FILES (match folder name exactly)
app.use(express.static("public"));

// COOKIES
app.use(cookieParser());

// ROUTES
app.use("/api/v1/users", userRoutes);

app.use("/api/v1/cars", carRoutes);

app.use("/api/v1/chargers", chargerRoutes);


app.get("/home", (req, res) => {
  res.send("Backend is running");
});

export default app;

