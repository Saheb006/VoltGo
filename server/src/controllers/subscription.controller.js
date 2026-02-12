import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Subscription from "../models/subscription.model.js";
import SubscriptionPlan from "../models/subscription_plan.model.js";

// startSubscription,
// getMySubscription,
// listMySubscriptions,

const startSubscription = asyncHandler(async (req, res) => {
    const { planId } = req.body;

    if (req.user.role !== "charger_owner") {
        throw new ApiError(403, "Only charger owners can subscribe");
    }

    if (!planId) {
        throw new ApiError(400, "Plan ID is required");
    }

    const plan = await SubscriptionPlan.findOne({
        _id: planId,
        is_active: true,
    });

    if (!plan) {
        throw new ApiError(404, "Subscription plan not found or inactive");
    }

    const existingSubscription = await Subscription.findOne({
        owner_id: req.user._id,
        status: "active",
    });

    if (existingSubscription) {
        throw new ApiError(400, "Active subscription already exists");
    }

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 30); // temporary: monthly

    const subscription = await Subscription.create({
        owner_id: req.user._id,
        plan_id: plan._id,
        starts_at: new Date(),
        ends_at: endsAt,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, subscription, "Subscription started"));
});

const getMySubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findOne({
        owner_id: req.user._id,
        status: "active",
        ends_at: { $gt: new Date() },
    }).populate("plan_id");

    if (!subscription) {
        throw new ApiError(404, "No active subscription found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscription, "Active subscription retrieved")
        );
});

const listMySubscriptions = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find({
        owner_id: req.user._id,
    })
        .populate("plan_id")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscriptions,
                "Subscription history retrieved successfully"
            )
        );
});

export { startSubscription, getMySubscription, listMySubscriptions };
