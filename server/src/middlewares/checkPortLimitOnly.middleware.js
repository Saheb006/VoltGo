import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import SubscriptionPlan from "../models/subscription_plan.model.js";
import ChargerPort from "../models/chargerPort.model.js";
import Subscription from "../models/subscription.model.js";

export const checkPortLimitOnly = asyncHandler(async (req, res, next) => {
    // only charger owners need port limits
    if (req.user.role !== "charger_owner") {
        return next();
    }

    console.log("🔍 Checking port limit ONLY for user:", req.user._id);

    // Get the user's subscription to find their plan
    const subscription = await Subscription.findOne({
        owner_id: req.user._id,
    });

    if (!subscription) {
        console.log("❌ No subscription found for user:", req.user._id);
        throw new ApiError(
            403,
            "Active subscription required to add ports. Please purchase a subscription plan."
        );
    }

    // Get the plan to check limits
    const plan = await SubscriptionPlan.findById(subscription.plan_id);
    if (!plan) {
        throw new ApiError(500, "Subscription plan not found");
    }

    console.log("🔍 Found plan:", plan.name, "max_ports_per_charger:", plan.max_ports_per_charger);

    // unlimited ports - no limit check needed
    if (plan.max_ports_per_charger === null) {
        console.log("✅ Unlimited ports allowed");
        return next();
    }

    const chargerId = req.params.chargerId;
    console.log("🔍 Checking ports for charger:", chargerId);

    const portCount = await ChargerPort.countDocuments({
        charger_id: chargerId,
    });

    console.log("🔍 Current port count:", portCount, "Max allowed:", plan.max_ports_per_charger);

    if (portCount >= plan.max_ports_per_charger) {
        console.log("❌ Port limit reached");
        throw new ApiError(
            403,
            `Port limit reached (${plan.max_ports_per_charger} ports per charger). Please upgrade your plan to add more ports.`
        );
    }

    console.log("✅ Port limit check passed");
    next();
});
