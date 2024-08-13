// import mongoose from "mongoose";

// const connectMongoDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGOURL);
//         console.log("Connected to MongoDB.");
//     } catch (error) {
//         console.log(error);
//     }
// };

// export default connectMongoDB;

// lib/mongoose.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGOURL;
console.log("🚀 ~ MONGODB_URI:", process.env.MONGOURL)

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(process.env.MONGOURL, opts).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;