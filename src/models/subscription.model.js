import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId, // ther user who is subscribing 
      ref: "User",
    },
    channel: {
        type : mongoose.Schema.Types.ObjectId, // the user who will be subscribed
        ref : "User"
    },
  },
  { timestamps: true },
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
