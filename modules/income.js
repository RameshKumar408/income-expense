import mongoose, { Schema } from "mongoose";

const topicSchema = new Schema(
    {
        Title: String,
        Amount: Number,
        Type: String,
        Date: String,
        TimeStamp: Number
    },
    {
        timestamps: true,
    }
);

const Income = mongoose.models.incomes || mongoose.model("incomes", topicSchema);

export default Income;