const API_URL = import.meta.env.VITE_APP_URL_BACKEND

export async function login(email, password) {
    const responseHttp = await fetch(
        API_URL + '/api/auth/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json" //Inform server about data type.
            },
            body: JSON.stringify({ //Transform JS object into JSON.
                email: email,
                password: password
            })
        }
    )
    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export const logIn = login

export async function register(username, email, password) {
    const responseHttp = await fetch(
        API_URL + '/api/auth/register',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        }
    )

    //Read the response body as JSON.
    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function verifyEmail(verificationToken) {
    // The token travels through the querystring, just like the email link sends it.
    const responseHttp = await fetch(
        API_URL + '/api/auth/verify-email?verification_token=' + encodeURIComponent(verificationToken),
        {
            method: 'GET'
        }
    )

    //Read the response body as JSON.
    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function resendVerificationEmail(email) {
    // The email travels through the path, matching the backend route: /api/auth/verify-email/:email/resend
    const responseHttp = await fetch(
        API_URL + '/api/auth/verify-email/' + encodeURIComponent(email) + '/resend',
        {
            method: 'GET'
        }
    )

    //Read the response body as JSON.
    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function forgotPassword(email) {
    const responseHttp = await fetch(
        API_URL + '/api/auth/forgot-password',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                email: email
            })
        }
    )

    //Read the response body as JSON.
    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}

export async function resetPassword(resetPasswordToken, password) {
    // The token and the new password travel in the body, matching POST /api/auth/reset-password.
    const responseHttp = await fetch(
        API_URL + '/api/auth/reset-password',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                reset_password_token: resetPasswordToken,
                password: password
            })
        }
    )

    //Read the response body as JSON.
    const responseBody = await responseHttp.json()

    if (!responseBody.ok) {
        throw new Error(responseBody.message)
    }

    return responseBody
}
