import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDb = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(connectionInstance);
        console.log("Connected successfully with ",connectionInstance.connection.host);
    } catch (error) {
        console.log(`Database connection failed due to error: ${error}`)
    }
}