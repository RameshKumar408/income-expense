import mongoose, { Schema } from "mongoose";

const topicSchema = new Schema(
  {
    Title: String,
    Amount: Number,
    Type: String,
    Date: String,
    TimeStamp: Number,
    Description: String,
    AccType: { type: String, default: "" },
    User_id: { type: Schema.Types.ObjectId, ref: "users" },
  },
  {
    timestamps: true,
  },
);

// High-performance compound indexes for date range queries and analytics
topicSchema.index({ User_id: 1, TimeStamp: -1 });
topicSchema.index({ User_id: 1, Type: 1 });

const Income =
  mongoose.models.incomes || mongoose.model("incomes", topicSchema);

export default Income;
