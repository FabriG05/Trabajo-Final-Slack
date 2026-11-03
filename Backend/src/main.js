import connectMongoDB from "./Config/mongo.config.js";
import express, { request, response } from 'express'
import auth_router from "./Routes/AuthRouter.js";
import user_router from "./Routes/UserRouter.js"
import workspaceRouter from "./Routes/WorkspaceRouter.js";
import errorMiddleware from "./Middlewares/ErrorMiddleware.js";
import authMiddleware from "./Middlewares/AuthMiddleware.js";
import mailer_transporter from "./Config/Mailer.config.js";
import ENVIRONMENT from "./Config/Environment.config.js";
import user_repository from "./Repositories/UserRepository.js";
import ServerError from "./Utils/Error.Utils.js";
import { verifyEmail } from "./Controllers/AuthControllers.js";


connectMongoDB()

/* Para hacer un server HTTP con NODE.js vamos a usar una librería que se llama express.js (Otra opción para TS podría ser nest.js) */

const PORT = 8080 //Destimos un puerto de nuestra PC para que esta app se escuche.
const app = express() //Con esto creamos una app express (server http).

// Middleware para permitir CORS (Cross-Origin Resource Sharing)
app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (request.method === 'OPTIONS') {
        return response.sendStatus(200);
    }
    next();
});

app.use(express.json()) //Configuramos nuestra API para que el body pueda ser tipo JSON. Esto de llama middleware.
//Cada vez que le llegue una consulta, el middleware revisará si el request header.['Content.type']

app.listen(
    PORT, //Si este método listen funciona, nos trae esta segunda función.
    () => {
        console.log(`El servidor se está escuchando correctamente en https://localhost:${PORT}`)
    }
)


/* Todas las consultas que lleguen a /api/auth lo manejará el auth_router */
app.use('/api/auth', auth_router)
app.use('/api/user', user_router)
app.use('/api/workspace', workspaceRouter)

app.use(errorMiddleware)
