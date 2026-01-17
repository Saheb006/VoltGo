// postCar
// listMyCars
// getCarById
// updateCar
// deleteCar

// selectActiveCar        // IMPORTANT
// getActiveCar           // IMPORTANT
// getCarChargingHistory  // VERY USEFUL
// getCarStats            // OPTIONAL (but impressive)



import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Car } from "../models/car.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const postCar = asyncHandler(async (req, res) => {
  const {
    company,
    model,
    launchYear,
    licensePlate,
    batteryCapacityKwh,
    maxChargingPowerKw,
    connectorType
  } = req.body;

  // 🔒 ONLY vehicle owners can add cars
  if (req.user.role !== "vehicle_owner") {
    throw new ApiError(403, "Only vehicle owners can add cars");
  }

  // basic validation (keep it simple)
  if (
    !company ||
    !model ||
    !launchYear ||
    !licensePlate ||
    !batteryCapacityKwh ||
    !maxChargingPowerKw ||
    !connectorType
  ) {
    throw new ApiError(400, "All car fields are required");
  }

  if (typeof launchYear !== "number") {
    throw new ApiError(400, "Launch year must be a number");
  }

  const normalizedConnectorType =
    typeof connectorType === "string" ? [connectorType] : connectorType;

  const car = await Car.create({
    owner_id: req.user._id,
    company,
    model,
    launchYear,
    license_plate: licensePlate,
    battery_capacity_kwh: batteryCapacityKwh,
    max_charging_power_kw: maxChargingPowerKw,
    connector_type: normalizedConnectorType
  });

  return res
    .status(201)
    .json(new ApiResponse(201, car, "Car created successfully"));
});


const listMyCars = asyncHandler(async (req, res) => {
  const userId = req.user._id; 
  const cars = await Car.find({ owner_id: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, cars, "Cars list retrieved successfully"));
});


const getCarById = asyncHandler(async (req, res) => {
 
  const carId = req.params.carId; // ✅ CORRECT


  const car = await Car.findById(carId);

  if (!car) {
    throw new ApiError(404, "Car not found"); // 🔧 REQUIRED
  }

  return res
    .status(200)
    .json(new ApiResponse(200, car, "Car retrieved successfully"));
});

const updateCar = asyncHandler(async (req, res) => {
  const carId = req.params.carId; // ✅ FIXED

  const {
    company,
    model,
    launchYear,
    licensePlate,
    batteryCapacityKwh,
    maxChargingPowerKw,
    connectorType
  } = req.body;

  const car = await Car.findOne({
    _id: carId,
    owner_id: req.user._id
  });

  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  // ✅ PATCH = update only provided fields
  if (company !== undefined) car.company = company;
  if (model !== undefined) car.model = model;
  if (launchYear !== undefined) car.launchYear = launchYear;
  if (licensePlate !== undefined) car.license_plate = licensePlate;
  if (batteryCapacityKwh !== undefined) car.battery_capacity_kwh = batteryCapacityKwh;
  if (maxChargingPowerKw !== undefined) car.max_charging_power_kw = maxChargingPowerKw;

  if (connectorType !== undefined) {
    car.connector_type =
      typeof connectorType === "string"
        ? [connectorType]
        : connectorType;
  }


  await car.save();

  return res
    .status(200)
    .json(new ApiResponse(200, car, "Car updated successfully"));
});


const deleteCar = asyncHandler(async (req, res) => {
  const carId = req.params.carId; 

  const car = await Car.findOne({
    _id: carId,
    owner_id: req.user._id
  });

  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  // clear active car if deleting it
  if (
    req.user.active_car_id &&
    req.user.active_car_id.toString() === car._id.toString()
  ) {
    req.user.active_car_id = null;
    await req.user.save();
  }

  await car.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Car deleted successfully"));
});










export { 
    postCar,
    listMyCars,
    getCarById,
    updateCar,
    deleteCar

 };