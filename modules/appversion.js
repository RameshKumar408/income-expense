import mongoose, { Schema } from "mongoose";

const appversionSchema = new Schema(
    {
        Version: String,
    },
    {
        timestamps: true,
    }
);

const Versions = mongoose.models.appversion || mongoose.model("appversion", appversionSchema);

export default Versions;