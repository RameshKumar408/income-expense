import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        Name: String,
        Email: {
            type: String,
            unique: true
        },
        Password: {
            type: String,
            select: false
        },
    },
    {
        timestamps: true,
    }
);

const Users = mongoose.models.users || mongoose.model("users", userSchema);

export default Users;