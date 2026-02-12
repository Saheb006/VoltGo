import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Subscription from "../models/subscription.model.js";

export const checkActiveSubscription = asyncHandler(async (req, res, next) => {
    // only charger owners need subscriptions
    if (req.user.role !== "charger_owner") {
        return next();
    }

    const subscription = await Subscription.findOne({
        owner_id: req.user._id,
        status: "active",
        ends_at: { $gt: new Date() },
    });

    if (!subscription) {
        throw new ApiError(
            403,
            "No active subscription found or subscription expired"
        );
    }

    // attach for next middlewares
    req.subscription = subscription;

    next();
});
