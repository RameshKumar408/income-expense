import mongoose from "mongoose";

const connectMongoDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://ckramesh0006:Ramesh6453@cluster0.iqdk9lt.mongodb.net/incomeExpense');
        console.log("Connected to MongoDB.");
    } catch (error) {
        console.log(error);
    }
};

export default connectMongoDB;