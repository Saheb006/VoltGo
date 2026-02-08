import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import SubscriptionPlan from "../models/subscription_plan.model.js";
import ChargerPort from "../models/chargerPort.model.js";

export const checkPortLimit = asyncHandler(async (req, res, next) => {
  const subscription = req.subscription;

  if (!subscription) return next();

  const plan = await SubscriptionPlan.findById(subscription.plan_id);

  if (!plan) {
    throw new ApiError(500, "Subscription plan not found");
  }

  // unlimited ports
  if (plan.max_ports_per_charger === null) {
    return next();
  }

  const chargerId = req.params.chargerId;

  const portCount = await ChargerPort.countDocuments({
    charger_id: chargerId,
  });

  if (portCount >= plan.max_ports_per_charger) {
    throw new ApiError(
      403,
      "Port limit reached for this charger under current plan"
    );
  }

  next();
});
