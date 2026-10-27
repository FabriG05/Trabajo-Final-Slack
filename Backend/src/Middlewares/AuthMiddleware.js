import jwt from "jsonwebtoken"
import ENVIRONMENT from "../Config/Environment.config.js"
import ServerError from "../Utils/Error.Utils.js"

function authMiddleware(request, response, next) {
    try {
        //Cuando un usuario una operación que necesite auth, vamos a recibir el authToken de los headers de la consulta. Lo solemos esperar en un header llamado authorization.
        const authHeader = request.headers.authorization

        if (!authHeader) {
            throw new ServerError("Auth header is required.", 400)
        }

        const authParts = authHeader.split(" ") //"Bearer tokenValue" --> Acá hay dos partes. Necesito la segunda, la de la derecha.
        const authToken = authParts[1] //tokenValue

        if (!authToken || authParts[0] !== "Bearer") {
            throw new ServerError("Auth token is required or malformed.", 400)
        }

        const { id, name, email } = jwt.verify(authToken, ENVIRONMENT.JWT_SECRET_KEY) //Verifica la firma para ver si coinciden.
        request.user = { //Mutamos la request para que guarde dentro de la nueva propiedad user los datos de la credencial.
            id: id,
            name: name,
            email: email
        }

        next() //Esto hace que se siga al siguiente Middleware / controlador.

    } catch (error) {
        if ( //Si hubo un fallo al verificar el token,
            error instanceof jwt.JsonWebTokenError || //Si está mal el token.
            error instanceof jwt.NotBeforeError ||  //Si el token se creó en un tiempo futuro.
            error instanceof jwt.TokenExpiredError //Si es un token expirado.
        ) {
            return response.status(401).send({
                ok: false,
                message: "Auth token is invalid."
            })
        }
        if (error.status) {
            return response.status(error.status).send(
                {
                    ok: false,
                    message: error.message
                }
            )
        }
        
        //Es un error inesperado, error genérico.
        console.error('[Server Error]:', error.message)
        return response.status(500).send(
            {
                ok: false,
                message: 'Internal Server Error'
            }
        )
    }
}

export default authMiddleware