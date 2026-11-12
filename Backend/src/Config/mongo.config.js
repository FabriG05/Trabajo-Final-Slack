import mongoose from "mongoose";
import ENVIRONMENT from "./Environment.config.js";


async function connectMongoDB() { // Try and catch is used to handle errors.
    try {
        await mongoose.connect(
            `${ENVIRONMENT.MONGO_URI}/${ENVIRONMENT.MONGO_DB_NAME}`
        )
    }
    catch (error) { // Instead of crashing everything, it executes this block of code.
        console.error("There was a critial error while connecting to MongoDB", error.message)
        process.exit(1) // We use this to (controlledly) exit the program.
    }
}

export default connectMongoDB