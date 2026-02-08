import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "paused", "cancelled", "expired"],
      default: "active",
      index: true,
    },

    starts_at: {
      type: Date,
      default: Date.now,
    },

    ends_at: {
      type: Date,
      required: true,
      index: true,
    },

    last_payment_at: Date,
    last_payment_status: {
      type: String,
      enum: ["success", "failed", "pending"],
    },
  },
  { timestamps: true }
);


// One active subscription per charger owner
subscriptionSchema.index(
  { owner_id: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

export default mongoose.model("Subscription", subscriptionSchema);
