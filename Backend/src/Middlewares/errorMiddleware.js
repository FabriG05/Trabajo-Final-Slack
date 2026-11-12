const errorMiddleware = (error, request, response, next) => {
    console.log("[Error Middleware]", error)
    if (error.status) { // If there is a status, it's a manageable error, because I defined / accounted for that error.
        return response.status(error.status).send(
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