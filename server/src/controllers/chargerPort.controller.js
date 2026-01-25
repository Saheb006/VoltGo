import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Charger from "../models/charger.model.js";
import ChargerPort from "../models/chargerPort.model.js";


// createChargerPort
// listChargerPorts
// updateChargerPort
// updatePortStatus
// deleteChargerPort


const createChargerPort = asyncHandler(async (req, res) => {
  const { chargerId } = req.params;
  const { connector_type, max_power_kw, price_per_kwh, status } = req.body;

  if (req.user.role !== "charger_owner") {
    throw new ApiError(403, "Only charger owners can add ports");
  }

  // 🔒 check charger ownership
  const charger = await Charger.findOne({
    _id: chargerId,
    owner_id: req.user._id,
  });

  if (!charger) {
    throw new ApiError(404, "Charger not found");
  }

  // 🔧 validate connector
  if (!connector_type) {
    throw new ApiError(400, "Connector type is required");
  }

  const validConnectors =
    ChargerPort.schema.path("connector_type").enumValues;

  if (!validConnectors.includes(connector_type)) {
    throw new ApiError(
      400,
      `Invalid connector type. Allowed: ${validConnectors.join(", ")}`
    );
  }

  // 🔧 normalize & validate power
  const power = Number(max_power_kw);
  if (Number.isNaN(power) || power <= 0) {
    throw new ApiError(400, "Invalid max power value");
  }

  // 🔧 normalize & validate price
  const price = Number(price_per_kwh);
  if (Number.isNaN(price) || price <= 0) {
    throw new ApiError(400, "Invalid price per kWh");
  }

  // 🔢 AUTO-ASSIGN PORT NUMBER
  const lastPort = await ChargerPort.findOne({ charger_id: chargerId })
    .sort({ port_number: -1 })
    .select("port_number");

  const nextPortNumber = lastPort ? lastPort.port_number + 1 : 1;

  // 🔧 create port
  const port = await ChargerPort.create({
    charger_id: chargerId,
    port_number: nextPortNumber,
    connector_type,
    max_power_kw: power,
    price_per_kwh: price,
    status: status ?? "available",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, port, "Port created successfully"));
});



const listChargerPorts = asyncHandler(async (req, res) => {
  const { chargerId } = req.params;

  const charger = await Charger.findById(chargerId);
  if (!charger) {
    throw new ApiError(404, "Charger not found");
  }

  const isOwner =
    req.user?.role === "charger_owner" &&
    charger.owner_id.toString() === req.user._id.toString();

  // EV users can only see ports if charger is active
  if (!isOwner && charger.status !== "active") {
    throw new ApiError(403, "Charger not available");
  }

  // 🔹 NO status filtering
  const ports = await ChargerPort
    .find({ charger_id: chargerId })
    .sort({ port_number: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, ports, "Ports retrieved successfully"));
});


const updateChargerPort = asyncHandler(async (req, res) => {
  const { portId } = req.params;
  const { connector_type, max_power_kw, price_per_kwh } = req.body;

  if (req.user.role !== "charger_owner") {
    throw new ApiError(403, "Only charger owners can update ports");
  }

  const port = await ChargerPort.findById(portId);
  if (!port) {
    throw new ApiError(404, "Port not found");
  }

  const charger = await Charger.findOne({
    _id: port.charger_id,
    owner_id: req.user._id,
  });

  if (!charger) {
    throw new ApiError(403, "Unauthorized");
  }

  // update connector
  if (connector_type !== undefined) {
    const validConnectors =
      ChargerPort.schema.path("connector_type").enumValues;

    if (!validConnectors.includes(connector_type)) {
      throw new ApiError(
        400,
        `Invalid connector type. Allowed: ${validConnectors.join(", ")}`
      );
    }
    port.connector_type = connector_type;
  }

  // update power
  if (max_power_kw !== undefined) {
    const power = Number(max_power_kw);
    if (Number.isNaN(power) || power <= 0) {
      throw new ApiError(400, "Invalid max power value");
    }
    port.max_power_kw = power;
  }

  // update price
  if (price_per_kwh !== undefined) {
    const price = Number(price_per_kwh);
    if (Number.isNaN(price) || price <= 0) {
      throw new ApiError(400, "Invalid price per kWh");
    }
    port.price_per_kwh = price;
  }

  await port.save();

  return res
    .status(200)
    .json(new ApiResponse(200, port, "Port updated successfully"));
});



const updatePortStatus = asyncHandler(async (req, res) => {
  const { portId } = req.params;
  const { status } = req.body;

  if (req.user.role !== "charger_owner") {
    throw new ApiError(403, "Only charger owners can update port status");
  }

  if (!status) {
    throw new ApiError(400, "Port status is required");
  }

  const port = await ChargerPort.findById(portId);
  if (!port) {
    throw new ApiError(404, "Port not found");
  }

  const charger = await Charger.findOne({
    _id: port.charger_id,
    owner_id: req.user._id,
  });

  if (!charger) {
    throw new ApiError(403, "Unauthorized");
  }

  const allowedStatuses =
    ChargerPort.schema.path("status").enumValues;

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid port status");
  }

  // Optional safety
  if (port.status === status) {
    return res
      .status(200)
      .json(new ApiResponse(200, port, "Port status already set"));
  }

  port.status = status;
  await port.save();

  return res
    .status(200)
    .json(new ApiResponse(200, port, "Port status updated"));
});




const deleteChargerPort = asyncHandler(async (req, res) => {
  const { portId } = req.params;

  if (req.user.role !== "charger_owner") {
    throw new ApiError(403, "Only charger owners can delete ports");
  }

  const port = await ChargerPort.findById(portId);
  if (!port) {
    throw new ApiError(404, "Port not found");
  }

  const charger = await Charger.findOne({
    _id: port.charger_id,
    owner_id: req.user._id,
  });

  if (!charger) {
    throw new ApiError(403, "Unauthorized");
  }

  if (port.status === "occupied") {
    throw new ApiError(400, "Cannot delete an occupied port");
  }

  await port.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Port deleted successfully"));
});

export {
  createChargerPort,
  listChargerPorts,
  updateChargerPort,
  updatePortStatus,
  deleteChargerPort,
};
