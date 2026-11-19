import connectMongoDB from "./Config/mongo.config.js";
import express, { request, response } from 'express'
import swaggerUi from 'swagger-ui-express';
import openapiSpec from '../Docs/openapi.js';
import auth_router from "./Routes/AuthRouter.js";
import user_router from "./Routes/UserRouter.js"
import workspaceRouter from "./Routes/WorkspaceRouter.js";
import errorMiddleware from "./Middlewares/ErrorMiddleware.js";
import authMiddleware from "./Middlewares/AuthMiddleware.js";
import loggerMiddleware from "./Middlewares/LoggerMiddleware.js";
import mailer_transporter from "./Config/Mailer.config.js";
import ENVIRONMENT from "./Config/Environment.config.js";
import user_repository from "./Repositories/UserRepository.js";
import ServerError from "./Utils/Error.Utils.js";
import { verifyEmail } from "./Controllers/AuthControllers.js";


connectMongoDB()

/* To build an HTTP server with NODE.js we'll use a library called express.js (another option for TS could be nest.js) */

const PORT = 8080 // Assign a port on our machine for this app to listen on.
const app = express() // With this we create an express app (HTTP server).

app.set('trust proxy', 1) // Trust the first proxy (Vercel) so request.ip returns the real client IP.

// Middleware to enable CORS (Cross-Origin Resource Sharing)
app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (request.method === 'OPTIONS') {
        return response.sendStatus(200);
    }
    next();
});

app.use(express.json()) // Configure our API so the body can be JSON. This is called a middleware.
// Every time a request arrives, the middleware checks the request header['Content-Type']

app.use(loggerMiddleware) // Logs every request (ip, url, endpoint, method, status, user id, duration) to MongoDB. The body is never logged.

/* Swagger UI: interactive documentation of every endpoint, served from the OpenAPI spec in ../Docs */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec))

app.listen(
    PORT, // If this listen method succeeds, it runs this callback function.
    () => {
        console.log(`El servidor se está escuchando correctamente en https://localhost:${PORT}`)
    }
)


/* All requests that arrive at /api/auth will be handled by auth_router */
app.use('/api/auth', auth_router)
app.use('/api/user', user_router)
app.use('/api/workspace', workspaceRouter)

app.use(errorMiddleware)
