import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import SubscriptionPlan from "../models/subscription_plan.model.js";
import Charger from "../models/charger.model.js";

export const checkChargerLimit = asyncHandler(async (req, res, next) => {
    // only charger owners need subscriptions
    if (req.user.role !== "charger_owner") {
        return next();
    }

    console.log("🔍 Checking charger limit for user:", req.user._id);
    console.log("🔍 Subscription from middleware:", req.subscription);

    const subscription = req.subscription;

    // Block users without any subscription from adding chargers
    if (!subscription) {
        console.log("❌ No subscription found for user:", req.user._id);
        throw new ApiError(
            403,
            "Active subscription required to add chargers. Please purchase a subscription plan."
        );
    }

    // Check if subscription is expired
    if (subscription.status === "expired" || subscription.ends_at <= new Date()) {
        console.log("❌ Subscription expired for user:", req.user._id);
        throw new ApiError(
            403,
            "Your subscription has expired. Please renew your subscription plan to add chargers."
        );
    }

    // Check if subscription is not active
    if (subscription.status !== "active") {
        console.log("❌ Subscription not active for user:", req.user._id, "Status:", subscription.status);
        throw new ApiError(
            403,
            "Your subscription is not active. Please purchase a subscription plan to add chargers."
        );
    }

    const plan = await SubscriptionPlan.findById(subscription.plan_id);

    if (!plan) {
        throw new ApiError(500, "Subscription plan not found");
    }

    // unlimited chargers
    if (plan.max_chargers === null) {
        return next();
    }

    const chargerCount = await Charger.countDocuments({
        owner_id: req.user._id,
    });

    if (chargerCount >= plan.max_chargers) {
        throw new ApiError(
            403,
            "Charger limit reached. Upgrade plan to add more chargers."
        );
    }

    next();
});
