const errorMiddleware = (error, request, response, next) => {
    console.log("[Error Middleware]", error)
    if (error.status) { //Si hay status es un error manejable, porque yo definí / contemplé ese error.
        return response.status(error.status).send(
            {
                ok: false,
                message: error.message
            }
        )
    }
    else { //Es un error inesperado, error genérico.
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