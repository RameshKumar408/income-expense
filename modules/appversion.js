import mongoose, { Schema } from "mongoose";

const appversionSchema = new Schema(
    {
        Version: String,
        Link: String
    },

    {
        timestamps: true,
    }
);

const Versions = mongoose.model("appversions", appversionSchema);

export default Versions;