import mongoose, { Schema } from "mongoose";

const googleApSchema = new Schema(
    {
        refreshtoken: String,
        token: String
    },

    {
        timestamps: true,
    }
);

const GoogleApi = mongoose.models.googleapis || mongoose.model("googleapis", googleApSchema);

export default GoogleApi;