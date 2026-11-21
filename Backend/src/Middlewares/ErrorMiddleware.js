const errorMiddleware = (error, request, response, next) => {
    console.log("[Error Middleware]", error)

    // body-parser could not parse the JSON body. It has status 400, but its
    // raw message includes parser internals, so answer with a stable one.
    if (error.type === 'entity.parse.failed') {
        return response.status(400).send(
            {
                ok: false,
                message: 'Invalid JSON body.'
            }
        )
    }

    // body-parser rejected a body larger than the 1 MB limit set in main.js.
    if (error.type === 'entity.too.large') {
        return response.status(413).send(
            {
                ok: false,
                message: 'Request body is too large.'
            }
        )
    }

    // Mongoose could not cast an id from the path/query to ObjectId.
    if (error.name === 'CastError') {
        return response.status(400).send(
            {
                ok: false,
                message: 'Invalid id format.'
            }
        )
    }

    if (error.status) { // If there is a status, it's a manageable error, because I defined / accounted for that error.
        return response.status(error.status).send(
            {
                ok: false,
                message: error.message
            }
        )
    }
    else if (error.name === 'ValidationError') {
        // Mongoose schema validation failures are client mistakes: report them as 400 with the real message, not as a 500.
        return response.status(400).send(
            {
                ok: false,
                message: error.message
            }
        )
    }
    else { // Unexpected error, generic error.
        console.error('[Server Error]:', error.message)
        return response.status(500).send(
            {
                ok: false,
                message: 'Internal Server Error'
            }
        )
    }
}

export default errorMiddleware;
