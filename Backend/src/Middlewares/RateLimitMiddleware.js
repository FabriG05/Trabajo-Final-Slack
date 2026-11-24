import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import ENVIRONMENT from '../Config/Environment.config.js'

function createRateLimitHandler(message) {
    return (request, response) => {
        return response.status(429).send({
            ok: false,
            message
        })
    }
}

export const generalApiRateLimiter = rateLimit({
    windowMs: ENVIRONMENT.RATE_LIMIT_WINDOW_MS,
    max: ENVIRONMENT.RATE_LIMIT_MAX,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (request) => ipKeyGenerator(request.ip),
    handler: createRateLimitHandler('Too many requests. Please try again later.')
})

export const authRateLimiter = rateLimit({
    windowMs: ENVIRONMENT.AUTH_RATE_LIMIT_WINDOW_MS,
    max: ENVIRONMENT.AUTH_RATE_LIMIT_MAX,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (request) => ipKeyGenerator(request.ip),
    handler: createRateLimitHandler('Too many authentication attempts. Please try again later.')
})