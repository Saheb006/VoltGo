import CarModel from "../models/carmodel.model.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

export const addCar = async (req, res) => {
  try {
    // 🔐 Admin check
    if (req.headers.adminkey !== "SECRET123") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const {
      companyName,
      modelName,
      supportedConnectors,
      maxPowerKW,
      maxBatteryCapacity
    } = req.body;

    // ✅ Validation
    if (
      !companyName ||
      !modelName ||
      !supportedConnectors ||
      !maxPowerKW ||
      !maxBatteryCapacity
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Image check
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // 🧠 Slug generation
    const slug = `${companyName}-${modelName}`
      .toLowerCase()
      .replace(/\s+/g, "-");

    // 🚫 Duplicate check
    const exists = await CarModel.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: "Car already exists" });
    }

    // 🔌 Fix connectors (ensure array)
    const connectors = Array.isArray(supportedConnectors)
      ? supportedConnectors
      : [supportedConnectors];

    // ☁️ Upload to Cloudinary (BUFFER method)
    const result = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // 💾 Save to DB
    const car = await CarModel.create({
      companyName,
      modelName,
      slug,
      imageUrl: result.secure_url,
      supportedConnectors: connectors,
      maxPowerKW,
      maxBatteryCapacity
    });

    res.status(201).json(car);

  } catch (err) {
    console.error("Add Car Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllCars = async (req, res) => {
  try {
    const cars = await CarModel.find({}).select('companyName modelName imageUrl slug maxPowerKW maxBatteryCapacity');
    res.status(200).json(cars);
  } catch (err) {
    console.error("Get Cars Error:", err);
    res.status(500).json({ error: err.message });
  }
};

