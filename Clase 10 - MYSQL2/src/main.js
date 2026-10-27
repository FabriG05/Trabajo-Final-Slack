import express, { request, response } from 'express'
import authRouter from "./Routes/AuthRouter.js";
import userRouter from "./Routes/UserRouter.js"
import workspaceRouter from "./Routes/WorkspaceRouter.js"
import errorMiddleware from "./Middlewares/errorMiddleware.js";
import authMiddleware from "./Middlewares/AuthMiddleware.js";
import mailer_transporter from "./Config/Mailer.config.js";
import ENVIRONMENT from "./Config/Environment.config.js";
import userRepository from "./Repositories/UserRepository.js";
import ServerError from "./Utils/Error.Utils.js";
import { verifyEmail } from "./Controllers/AuthControllers.js";
import { testConnection } from "./Config/MySQL.config.js"
import cors from "cors"

/* Para hacer un server HTTP con NODE.js vamos a usar una librería que se llama express.js (Otra opción para TS podría ser nest.js) */

const PORT = ENVIRONMENT.PORT
const app = express() //Con esto creamos una app express (server http).
app.use(express.json()) //Configuramos nuestra API para que el body pueda ser tipo JSON. Esto de llama middleware.
//Cada vez que le llegue una consulta, el middleware revisará si el request header.['Content.type']


app.use(cors()) //Deshabilita la política CORS.
app.listen(
    PORT, //Si este método listen funciona, nos trae esta segunda función.
    () => {
        console.log(`Server is listening successfully at https://localhost:${PORT}`)
    }
)


/* Todas las consultas que lleguen a /api/auth lo manejará el auth_router */
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/workspace', workspaceRouter)

app.use(errorMiddleware)

testConnection()