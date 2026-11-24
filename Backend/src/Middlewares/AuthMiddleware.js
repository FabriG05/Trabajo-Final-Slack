import jwt from "jsonwebtoken"
import ENVIRONMENT from "../Config/Environment.config.js"
import ServerError from "../Utils/Error.Utils.js"
import { assertNotBlacklistedAuth } from "./BlacklistMiddleware.js"
import { assertWhitelistedIdentifier } from "./WhitelistMiddleware.js"

function authMiddleware(request, response, next) {
    try {
        // When a user performs an operation requiring auth, we receive the authToken in the request headers. We usually expect it in a header named authorization.
        const authHeader = request.headers.authorization

        if (!authHeader) {
            throw new ServerError("Auth header is required.", 401)
        }

        const authParts = authHeader.split(" ") // "Bearer tokenValue" --> Here there are two parts. I need the second one, on the right.
        const authToken = authParts[1] // tokenValue

        if (!authToken || authParts[0] !== "Bearer") {
            throw new ServerError("Auth token is required or malformed.", 401)
        }

        const { id, name, email } = jwt.verify(authToken, ENVIRONMENT.JWT_SECRET_KEY) // Verifies the signature to see if they match.
        request.user = { // Mutate the request so it stores the credential data inside the new user property.
            id: id,
            name: name,
            email: email
        }

        assertNotBlacklistedAuth({ token: authToken, user: request.user })
        assertWhitelistedIdentifier(request.user)

        next() // This moves on to the next middleware / controller.

    } catch (error) {
        if ( // If there was a failure verifying the token,
            error instanceof jwt.JsonWebTokenError || // If the token is invalid.
            error instanceof jwt.NotBeforeError ||  // If the token was created in a future time.
            error instanceof jwt.TokenExpiredError // If the token has expired.
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

        // Unexpected error, generic error.
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