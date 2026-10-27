import mongoose from "mongoose";
import ENVIRONMENT from "./Environment.config.js";


async function connectMongoDB() { //Try y catch nos sirve para manejar errores.
    try {
        await mongoose.connect(
            `${ENVIRONMENT.MONGO_URI}/${ENVIRONMENT.MONGO_DB_NAME}`
        )
    }
    catch (error) { //En vez de crashearme todo, ejecuta este bloque de código.
        console.error("Critical error connecting to MongoDB", error.message)
        process.exit(1) //Esto lo usamos nosotros para crashear (controladamente) el programa.
    }
}

export default connectMongoDB