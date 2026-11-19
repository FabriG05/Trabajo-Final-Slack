import Log from "../Models/LogModel.js"

/* Global request logger.
   It registers on 'finish' (when the response is fully sent) instead of at request time,
   because the auth middleware runs after this one: by 'finish' time, request.user
   already exists if the route required authentication.

   The request body is NEVER logged. */

function loggerMiddleware(request, response, next) {
    const start_time = performance.now() // High-resolution timer to measure execution time.

    response.on('finish', async () => {
        try {
            const duration_ms = Math.round(performance.now() - start_time)

            await Log.create({
                timestamp: new Date(),
                ip: request.ip,
                url: request.originalUrl,
                endpoint: request.route?.path ? request.baseUrl + request.route.path : request.originalUrl,
                method: request.method,
                status_code: response.statusCode,
                user_id: request.user?.id ?? null,
                duration_ms: duration_ms
            })
        }
        catch (error) { // Logging must never break the server.
            console.error('[Logger Error]:', error.message)
        }
    })

    next()
}

export default loggerMiddleware
