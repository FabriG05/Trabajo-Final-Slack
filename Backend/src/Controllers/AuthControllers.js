import ENVIRONMENT from "../Config/Environment.config.js";
import mailer_transporter from "../Config/Mailer.config.js";
import user_repository from "../Repositories/UserRepository.js";
import { generateHash, compareHash } from "../Utils/bcrypt.js";
import ServerError from "../Utils/Error.Utils.js";
import jwt from 'jsonwebtoken';


/*
    To send information to an API we use the request body.

    GET requests have NO body.
    The body can be of several data types:
        Today we are using JSON, so our API must be prepared
        to receive that type of information.
*/

/*
    Builds the HTML body of the verification email. It is shared by
    register and resendVerificationEmail so both send the same template.

    Inline styles only: most email clients strip <style> tags, so all
    CSS has to live in style attributes. The layout is table-based for
    the same reason, with a colored header band, a call-to-action
    button and a plain-text URL fallback.
*/
function buildVerificationEmailHtml(verifyEmailToken) {
    const verifyEmailUrl = ENVIRONMENT.URL_FRONTEND + '/verify-email?verification_token=' + verifyEmailToken

    return `
        <!DOCTYPE html>
        <html>
            <body style="margin: 0; padding: 0; background-color: #f4f5f6; font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 40px 16px;">
                            <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                                <!-- Header band -->
                                <tr>
                                    <td align="center" style="background-color: #481a54; padding: 28px 32px;">
                                        <h1 style="margin: 0; font-size: 24px; line-height: 1.3; color: #ffffff; font-weight: 700;">
                                            Verify your email
                                        </h1>
                                    </td>
                                </tr>
                                <!-- Body -->
                                <tr>
                                    <td style="padding: 32px;">
                                        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #1d1c1d; font-weight: 700;">
                                            Welcome to our platform!
                                        </p>
                                        <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #1d1c1d;">
                                            To finish setting up your account and start using the app,
                                            please confirm that this email address belongs to you.
                                        </p>
                                        <!-- Call-to-action button -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                                            <tr>
                                                <td style="border-radius: 4px; background-color: #481a54;" align="center">
                                                    <a href="${verifyEmailUrl}"
                                                       style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none;">
                                                        Verify your email
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- Plain-text URL fallback -->
                                        <p style="margin: 28px 0 0; font-size: 14px; line-height: 1.6; color: #616061;">
                                            This link expires in 24 hours. If the button does not work,
                                            copy and paste this URL into your browser:
                                        </p>
                                        <p style="margin: 8px 0 0; font-size: 13px; line-height: 1.6; color: #1264a3; word-break: break-all;">
                                            <a href="${verifyEmailUrl}" style="color: #1264a3;">${verifyEmailUrl}</a>
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 20px 32px; border-top: 1px solid #ebeaeb;">
                                        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #616061;">
                                            If you did not request this email, you can safely ignore it.
                                            This message was sent because someone (hopefully you) signed up with this address.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `
}

/*
    Builds a plain-text version of the verification email, shown by mail
    clients that do not render HTML or when the user disables it.
*/
function buildVerificationEmailText(verifyEmailToken) {
    const verifyEmailUrl = ENVIRONMENT.URL_FRONTEND + '/verify-email?verification_token=' + verifyEmailToken

    return [
        'Welcome to our platform!',
        '',
        'To finish setting up your account, please confirm that this email address belongs to you:',
        verifyEmailUrl,
        '',
        'This link expires in 24 hours. If you did not request this email, you can safely ignore it.'
    ].join('\n')
}

/*
    Signs the verification token and sends the verification email.
    Shared by register and resendVerificationEmail.
*/
async function sendVerificationEmail(email) {
    const verifyEmailToken = jwt.sign(
        {
            email: email
        },
        ENVIRONMENT.JWT_SECRET_KEY,
        {
            expiresIn: "1d"
        }
    )

    await mailer_transporter.sendMail(
        {
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: "Verify your account",
            html: buildVerificationEmailHtml(verifyEmailToken),
            text: buildVerificationEmailText(verifyEmailToken)
        }
    )
}

export async function register(request, response) {
    const { username, email, password } = request.body;
    if (
        typeof username !== "string" || //typeof tells JavaScript which data type was received.
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        throw new ServerError(
            "Username, email and password are required",
            400
        );
    }

    const normalizedUsername = username.trim(); //.trim() works on strings and removes leading and trailing spaces.
    const normalizedEmail = email.trim().toLowerCase(); //Converts the whole text to lowercase.
    if (!normalizedUsername || !normalizedEmail || !password.trim()) {
        throw new ServerError(
            "Username, email and password are required",
            400
        );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new ServerError(
            "Email is incorrect",
            400
        );
    }

    const userAlreadyExists = await user_repository.getByEmail(
        normalizedEmail
    );
    if (userAlreadyExists) {
        throw new ServerError(
            "Email is already used",
            400
        );
    }

    const passwordHash = await generateHash(password, 12);
    try {
        await user_repository.create(
            normalizedUsername,
            normalizedEmail,
            passwordHash
        );
    } catch (error) {
        if (error.code === 11000) { //error.code === 11000 detects a specific MongoDB error: a duplicate value was saved into a field marked as unique: true.
            throw new ServerError("Email is already used", 400);
        }
        throw error;
    }

    // The token is signed with the normalized email, which is the one
    // actually stored in the database, so verifyEmail can find the user.
    await sendVerificationEmail(normalizedEmail)

    return response.status(201).send({
        ok: true,
        message: "User registered successfully",
    });
}

export async function login(request, response) {
    const { email, password } = request.body;
    if (
        !email || !password || typeof email !== "string" || typeof password !== "string" //typeof tells JavaScript which data type was received.
    ) {
        throw new ServerError(
            "Email and password are required",
            400
        );
    }

    const normalizedEmail = email.trim().toLowerCase(); //.trim() works on strings and removes leading and trailing spaces. .toLowerCase() converts the whole text to lowercase.
    if (!normalizedEmail || !password.trim()) {
        throw new ServerError(
            "Email and password are required",
            400
        );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { //Checks that the email looks like an email.
        throw new ServerError(
            "Email is incorrect",
            400
        );
    }

    const user = await user_repository.getByEmail(normalizedEmail); //Looks the user up by email to make sure it exists.
    if (!user) {
        throw new ServerError(
            "User not found",
            404
        );
    }

    const isPasswordValid = await compareHash(password, user.password); //Compares the hash stored in the database against the password the client sent in the body.
    if (!isPasswordValid) {
        throw new ServerError(
            "Invalid email or password",
            401
        );
    }

    const authToken = jwt.sign(
        { //This is the information to store as the credential.
            id: user._id,
            name: user.name,
            email: user.email
        },
        ENVIRONMENT.JWT_SECRET_KEY
    )

    return response.status(200).send({
        ok: true,
        message: "You have logged in successfully",
        data: {
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        }
    });
}


export async function verifyEmail(request, response) {
    // The token now travels through the querystring: /api/auth/verify-email?verification_token=...
    const { verification_token: verifyEmailToken } = request.query

    if (!verifyEmailToken) {
        throw new ServerError('The verification token is missing', 400)
    }

    const { email } = jwt.verify(verifyEmailToken, ENVIRONMENT.JWT_SECRET_KEY)

    const userFound = await user_repository.getByEmail(email)

    if (!userFound) {
        throw new ServerError('User not found', 404)
    }

    if (!userFound.active) {
        throw new ServerError('The account was deactivated. Contact the client support if you think this is a mistake.', 400)
    }

    if (userFound.verified_email) {
        throw new ServerError('You have already verified your account', 400)
    }

    await user_repository.updateById(
        userFound._id,
        { verified_email: true }
    )

    return response.status(200).send(
        {
            ok: true,
            message: 'User verified successfully.'
        }
    )
}


export async function resendVerificationEmail(request, response) {
    // The email travels as a route parameter: /api/auth/verify-email/:email/resend
    const { email } = request.params

    if (typeof email !== 'string') {
        throw new ServerError('Email is required', 400)
    }

    const normalizedEmail = email.trim().toLowerCase() //.trim() removes leading and trailing spaces. .toLowerCase() converts the whole text to lowercase.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { //Checks that the email looks like an email.
        throw new ServerError(
            "Email is incorrect",
            400
        );
    }

    const userFound = await user_repository.getByEmail(normalizedEmail) //Looks the user up by email to make sure it exists.

    /*
        To avoid revealing whether the account exists or is already verified,
        we do not return status errors. We only send the email when the account
        exists, is active and still needs verification.
    */
    if (userFound && userFound.active && !userFound.verified_email) {
        await sendVerificationEmail(normalizedEmail)
    }

    // The same response is returned in every case so the endpoint gives no hints about the account.
    return response.status(200).send(
        {
            ok: true,
            message: 'If this account exists, an email with the steps to verify it is on its way.'
        }
    )
}



/* When a user logs in, we must hand them a signed credential that lets us state who they are. Later on, that user will hand the credential back so the server can trust them.

To issue that credential, we use JWT (JsonWebTokens).
JWTs are Js objects turned into strings by an algorithm called HS256. */
