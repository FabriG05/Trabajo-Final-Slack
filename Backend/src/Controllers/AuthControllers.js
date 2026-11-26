import auth_service from "../Services/AuthServices.js";

/*
    To send information to an API we use the request body.

    GET requests have NO body.
    The body can be of several data types:
        Today we are using JSON, so our API must be prepared
        to receive that type of information.
*/

/*
    Auth controllers. Thin HTTP layer: every handler only reads the
    data out of the request, hands it to the auth service (which owns
    the business logic) and builds the response. Errors thrown by the
    service are handled by the error middleware.
*/

function getFrontendUrl(request) {
    const rawOrigin = request.headers.origin
    if (rawOrigin && typeof rawOrigin === 'string' && rawOrigin !== 'null') {
        return rawOrigin.replace(/\/$/, '')
    }

    const rawReferer = request.headers.referer
    if (rawReferer && typeof rawReferer === 'string') {
        try {
            return new URL(rawReferer).origin.replace(/\/$/, '')
        } catch {
            // ignore
        }
    }

    return null
}

export async function register(request, response) {
    const { username, email, password } = request.body;
    const frontendUrl = getFrontendUrl(request);

    await auth_service.register(username, email, password, frontendUrl);

    return response.status(201).send({
        ok: true,
        message: "User registered successfully",
    });
}

export async function login(request, response) {
    const { email, password } = request.body;

    const { authToken, user } = await auth_service.login(email, password);

    return response.status(200).send({
        ok: true,
        message: "You have logged in successfully",
        data: {
            token: authToken,
            user: user
        }
    });
}

export async function verifyEmail(request, response) {
    // The token travels through the querystring: /api/auth/verify-email?verification_token=...
    const { verification_token: verifyEmailToken } = request.query;

    await auth_service.verifyEmail(verifyEmailToken);

    return response.status(200).send(
        {
            ok: true,
            message: 'User verified successfully.'
        }
    )
}

export async function resendVerificationEmail(request, response) {
    // The email travels as a route parameter: /api/auth/verify-email/:email/resend
    const frontendUrl = getFrontendUrl(request);
    await auth_service.resendVerificationEmail(request.params.email, frontendUrl);

    // The same response is returned in every case so the endpoint gives no hints about the account.
    return response.status(200).send(
        {
            ok: true,
            message: 'If this account exists, an email with the steps to verify it is on its way.'
        }
    )
}

export async function forgotPassword(request, response) {
    const { email } = request.body;
    const frontendUrl = getFrontendUrl(request);

    await auth_service.forgotPassword(email, frontendUrl);

    // The same response is returned in every case so the endpoint gives no hints about the account.
    return response.status(200).send(
        {
            ok: true,
            message: 'If this account exists, an email with the steps to reset your password is on its way.'
        }
    )
}

export async function resetPassword(request, response) {
    // The token and the new password travel in the body: POST /api/auth/reset-password
    const { reset_password_token, password } = request.body;

    await auth_service.resetPassword(reset_password_token, password);

    return response.status(200).send(
        {
            ok: true,
            message: 'Your password was reset successfully. You can now log in with your new password.'
        }
    )
}
