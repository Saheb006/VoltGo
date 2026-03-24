import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Subscription from "../models/subscription.model.js";

export const checkActiveSubscription = asyncHandler(async (req, res, next) => {
    // only charger owners need subscriptions
    if (req.user.role !== "charger_owner") {
        return next();
    }

    console.log("🔍 Checking active subscription for user:", req.user._id);

    // Check for ACTIVE subscription first (most recent active one)
    const activeSubscription = await Subscription.findOne({
        owner_id: req.user._id,
        status: "active",
        ends_at: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    console.log("🔍 Found active subscription:", activeSubscription);

    if (activeSubscription) {
        console.log("✅ Active subscription found, setting req.subscription");
        req.subscription = activeSubscription;
        return next();
    }

    // If no active subscription, check for any expired ones to update their status
    const expiredSubscription = await Subscription.findOne({
        owner_id: req.user._id,
        $or: [
            { ends_at: { $lte: new Date() } },
            { status: { $in: ["expired", "cancelled", "paused"] } }
        ]
    }).sort({ createdAt: -1 });

    console.log("🔍 Found expired/inactive subscription:", expiredSubscription);

    if (expiredSubscription) {
        // Update expired subscriptions to expired status
        if (expiredSubscription.ends_at <= new Date() && expiredSubscription.status !== "expired") {
            await Subscription.findByIdAndUpdate(
                expiredSubscription._id,
                { status: "expired" }
            );
            console.log("📝 Updated subscription status to expired");
        }
        
        // Set req.subscription so the next middleware can handle expired case
        req.subscription = expiredSubscription;
        return next();
    }

    // No subscription found at all
    console.log("ℹ️ No subscription found, allowing to proceed");
    return next();
});
