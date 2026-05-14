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

    // Get the user's subscription to find their plan - use same logic as subscription controller
    const allSubscriptions = await Subscription.find({
        owner_id: req.user._id,
    }).populate("plan_id").sort({ createdAt: -1 });
    
    console.log("🔍 All subscriptions for user:", allSubscriptions.map(sub => ({
        id: sub._id,
        status: sub.status,
        plan_id: sub.plan_id?._id || sub.plan_id,
        plan_name: sub.plan_id?.name
    })));
    
    let subscription = null;
    
    if (allSubscriptions.length > 0) {
        const firstSubscription = allSubscriptions[0];
        console.log('🎯 Checking first subscription [0]:', {
            id: firstSubscription._id,
            status: firstSubscription.status,
            plan_id: firstSubscription.plan_id?._id || firstSubscription.plan_id,
            plan_name: firstSubscription.plan_id?.name
        });
        
        // If the first subscription has status "active" (case insensitive), use it
        if (firstSubscription.status && firstSubscription.status.toLowerCase() === "active") {
            subscription = firstSubscription;
            console.log('✅ First subscription is active, using it');
        } else {
            console.log('❌ First subscription is not active, status:', firstSubscription.status);
            
            // For debugging: let's try to use it anyway if it's the only one
            if (allSubscriptions.length === 1) {
                console.log('⚠️ Only one subscription exists, using it anyway for debugging');
                subscription = firstSubscription;
            }
        }
    } else {
        console.log('❌ No subscriptions found for user');
    }

    if (!subscription) {
        console.log("❌ No subscription found for user:", req.user._id);
        throw new ApiError(
            403,
            "Active subscription required to add ports. Please purchase a subscription plan."
        );
    }

    // Get the plan to check limits - use populated plan if available
    let plan = null;
    
    if (subscription.plan_id && typeof subscription.plan_id === 'object' && subscription.plan_id.name) {
        // Plan is already populated
        plan = subscription.plan_id;
        console.log("🔍 Using populated plan:", plan.name);
    } else {
        // Need to fetch plan separately
        const planId = subscription.plan_id?._id || subscription.plan_id;
        console.log("🔍 Looking for plan with ID:", planId);
        plan = await SubscriptionPlan.findById(planId);
        
        if (!plan) {
            console.log("❌ Subscription plan not found for ID:", planId);
            console.log("🔍 Available plans in database:");
            const allPlans = await SubscriptionPlan.find({});
            console.log(allPlans.map(p => ({ id: p._id, name: p.name, is_active: p.is_active })));
            
            throw new ApiError(500, "Subscription plan not found");
        }
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
