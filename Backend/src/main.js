import express from 'express'
import swaggerUi from 'swagger-ui-express'

// Config & Database
import connectMongoDB from './Config/mongo.config.js'
import ENVIRONMENT from './Config/Environment.config.js'
import openapiSpec from '../Docs/openapi.js'

// Middlewares
import errorMiddleware from './Middlewares/ErrorMiddleware.js'
import loggerMiddleware from './Middlewares/LoggerMiddleware.js'
import blacklistMiddleware from './Middlewares/BlacklistMiddleware.js'
import whitelistMiddleware, { isOriginWhitelisted } from './Middlewares/WhitelistMiddleware.js'
import { generalApiRateLimiter } from './Middlewares/RateLimitMiddleware.js'

// Routes
import auth_router from './Routes/AuthRouter.js'
import user_router from './Routes/UserRouter.js'
import workspaceRouter from './Routes/WorkspaceRouter.js'

// Realtime (Socket.IO)
import { initSocketServer } from './Realtime/SocketServer.js'

// Database connection
connectMongoDB()

const app = express()
const PORT = process.env.PORT || 8080

// Trust the reverse proxy (Vercel / Render / Cloudflare) to retrieve the client's real IP
app.set('trust proxy', 1)

// ==========================================
// Global Middlewares
// ==========================================

// 1. CORS (Cross-Origin Resource Sharing)
app.use((request, response, next) => {
    const requestOrigin = request.headers.origin
    const originWhitelistActive = ENVIRONMENT.WHITELIST_ENABLED && Array.isArray(ENVIRONMENT.WHITELIST_ORIGINS) && ENVIRONMENT.WHITELIST_ORIGINS.length > 0

    if (originWhitelistActive) {
        if (requestOrigin && isOriginWhitelisted(requestOrigin)) {
            response.setHeader('Access-Control-Allow-Origin', requestOrigin)
            response.setHeader('Vary', 'Origin')
        }
    } else {
        response.setHeader('Access-Control-Allow-Origin', '*')
    }

    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

    if (request.method === 'OPTIONS') {
        if (originWhitelistActive && requestOrigin && !isOriginWhitelisted(requestOrigin)) {
            return response.status(403).send({
                ok: false,
                message: 'Access denied: origin is not whitelisted.'
            })
        }
        return response.sendStatus(200)
    }
    next()
})

// 2. Body parser (6MB limit to support small attachments and avatar uploads)
app.use(express.json({ limit: '6mb' }))

// 3. Security, access control lists, rate limiting, and request logging
app.use(blacklistMiddleware)
app.use(whitelistMiddleware)
app.use('/api', generalApiRateLimiter)
app.use(loggerMiddleware)

// ==========================================
// Swagger / OpenAPI Documentation
// ==========================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec))

// ==========================================
// REST API Routes
// ==========================================
app.use('/api/auth', auth_router)
app.use('/api/user', user_router)
app.use('/api/workspace', workspaceRouter)

// ==========================================
// 404 Handler & Centralized Error Middleware
// ==========================================
app.use((request, response) => {
    return response.status(404).send({
        ok: false,
        message: 'Route not found.'
    })
})

app.use(errorMiddleware)

// ==========================================
// HTTP Server & Socket.IO Initialization
// ==========================================
const httpServer = app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})

// Socket.IO shares the HTTP server (operates as a safe no-op in serverless environments)
initSocketServer(httpServer)

export default app