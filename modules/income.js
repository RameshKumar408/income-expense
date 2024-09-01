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
    }
);

const Income = mongoose.models.incomes || mongoose.model("incomes", topicSchema);

export default Income;