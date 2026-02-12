import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import SubscriptionPlan from "../models/subscription_plan.model.js";
import Charger from "../models/charger.model.js";

export const checkChargerLimit = asyncHandler(async (req, res, next) => {
    const subscription = req.subscription;

    if (!subscription) return next();

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
