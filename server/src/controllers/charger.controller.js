import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Charger from "../models/charger.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ChargerPort from "../models/chargerPort.model.js";

// createCharger
// updateCharger
// deleteCharger
// listMyChargers
// getChargerById

const createCharger = asyncHandler(async (req, res) => {
  const {
    latitude,
    longitude,
    name,
    address,
    address_details,
    status,
    charger_type,
  } = req.body;

  if (req.user.role !== "charger_owner") {
    throw new ApiError(403, "Only charger owners can add chargers");
  }

  const imageLocalPath = req.file?.path;
  if (!imageLocalPath) {
    throw new ApiError(400, "Charger image is required");
  }

  const uploadedImage = await uploadOnCloudinary(imageLocalPath);
  if (!uploadedImage?.url) {
    throw new ApiError(500, "Failed to upload charger image");
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (
    Number.isNaN(lat) || Number.isNaN(lng) ||
    lat < -90 || lat > 90 ||
    lng < -180 || lng > 180
  ) {
    throw new ApiError(400, "Valid latitude and longitude are required");
  }

  const finalStatus = status ?? "active";

  if (!name || !address || !charger_type ) {
    throw new ApiError(400, "Missing required charger fields");
  }

  const charger = await Charger.create({
    owner_id: req.user._id,
    name,
    address,
    address_details,
    status: finalStatus,
    charger_type,
    image_url: uploadedImage.url,
    location: {
      type: "Point",
      coordinates: [lng, lat],
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, charger, "Charger created successfully"));
});


const updateCharger = asyncHandler(async (req, res) => {
  const chargerId = req.params.chargerId;

  const charger = await Charger.findById(chargerId);
  if (!charger) {
    throw new ApiError(404, "Charger not found");
  }

  // 🔒 ownership check
  if (charger.owner_id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own chargers");
  }

  const {
    latitude,
    longitude,
    name,
    address,
    address_details,
    status,
    charger_type,
  } = req.body;

  // 🔧 update location
  if (latitude !== undefined && longitude !== undefined) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 || lat > 90 ||
      lng < -180 || lng > 180
    ) {
      throw new ApiError(400, "Invalid latitude or longitude");
    }

    charger.location = {
      type: "Point",
      coordinates: [lng, lat],
    };
  }

  // 🔧 update image
  if (req.file?.path) {
    const uploadedImage = await uploadOnCloudinary(req.file.path);
    if (!uploadedImage?.url) {
      throw new ApiError(500, "Failed to upload charger image");
    }
    charger.image_url = uploadedImage.url;
  }

  // 🔧 update charger-level fields
  if (name !== undefined) charger.name = name;
  if (address !== undefined) charger.address = address;
  if (address_details !== undefined) charger.address_details = address_details;
  if (status !== undefined) charger.status = status;
  if (charger_type !== undefined) charger.charger_type = charger_type;

  await charger.save();

  return res
    .status(200)
    .json(new ApiResponse(200, charger, "Charger updated successfully"));
});


const deleteCharger = asyncHandler(async (req, res) => {
  const chargerId = req.params.chargerId;

  const charger = await Charger.findById(chargerId);
  if (!charger) {
    throw new ApiError(404, "Charger not found");
  }

  // 🔒 ownership check
  if (charger.owner_id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own chargers");
  }

  // for now this part in comment out cuz chargersession model is not active yet 

  // // 🚫 BLOCK deletion if active session exists (DO THIS FIRST)
  // const activeSession = await ChargingSession.exists({
  //   charger_id: chargerId,
  //   status: "charging",
  // });

  // if (activeSession) {
  //   throw new ApiError(400, "Cannot delete charger with active sessions");
  // }

  const imageUrl = charger.image_url;

  //  DELETE PORTS
  await ChargerPort.deleteMany({ charger_id: chargerId });

  //  DELETE CHARGER
  await charger.deleteOne();

  // cleanup cloudinary image
  if (imageUrl) {
    try {
      await deleteFromCloudinary(imageUrl);
    } catch (err) {
      console.warn("Failed to delete charger image:", err);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Charger deleted successfully"));
});


const listMyChargers = asyncHandler(async (req, res) => {
  // 🔒 ONLY charger owners
  if (req.user.role !== "charger_owner") {
    throw new ApiError(403, "Only charger owners can view their chargers");
  }

  const chargers = await Charger.find({ owner_id: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, chargers, "Chargers retrieved successfully"));
});


const listNearbyChargers = asyncHandler(async (req, res) => {
  // 🔒 Only vehicle owners can search chargers
  if (req.user.role !== "vehicle_owner") {
    throw new ApiError(403, "Only vehicle owners can search nearby chargers");
  }

  const { lat, lng, radius } = req.query;

  const latitude = Number(lat);
  const longitude = Number(lng);
  const searchRadius = Number(radius); // meters

  // 🔧 validation
  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    Number.isNaN(searchRadius)
  ) {
    throw new ApiError(400, "Latitude, longitude and radius are required");
  }

  if (
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180 ||
    searchRadius <= 0
  ) {
    throw new ApiError(400, "Invalid latitude, longitude or radius");
  }

  const chargers = await Charger.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude], // MongoDB order
        },
        $maxDistance: searchRadius,
      },
    },
    status: "active",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        chargers,
        "Nearby chargers retrieved successfully"
      )
    );
});


const getChargerById = asyncHandler(async (req, res) => {
  const { chargerId } = req.params;

  const charger = await Charger.findById(chargerId);
  if (!charger) {
    throw new ApiError(404, "Charger not found");
  }

  const isOwner =
    req.user?.role === "charger_owner" &&
    charger.owner_id.toString() === req.user._id.toString();

  // EV owners cannot see inactive chargers
  if (!isOwner && charger.status !== "active") {
    throw new ApiError(404, "Charger not available");
  }

  let ports = [];

  if (charger.status === "active" || isOwner) {
    ports = await ChargerPort.find({ charger_id: chargerId });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        charger,
        ports,
      },
      "Charger fetched successfully"
    )
  );
});


const toggleChargerStatus = asyncHandler(async (req, res) => {
  const { chargerId } = req.params;

  const charger = await Charger.findOne({
    _id: chargerId,
    owner_id: req.user._id
  });

  if (!charger) {
    throw new ApiError(404, "Charger not found");
  }

  charger.status = charger.status === "active" ? "inactive" : "active";
  await charger.save();

  return res
    .status(200)
    .json(new ApiResponse(200, charger, "Charger status updated"));
});

export { 
    createCharger,
    updateCharger,
    deleteCharger,
    listMyChargers,
    listNearbyChargers,
    getChargerById,
    toggleChargerStatus

};


