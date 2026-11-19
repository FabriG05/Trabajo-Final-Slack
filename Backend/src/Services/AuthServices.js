import ENVIRONMENT from "../Config/Environment.config.js";
import mailer_transporter from "../Config/Mailer.config.js";
import user_repository from "../Repositories/UserRepository.js";
import { generateHash, compareHash } from "../Utils/bcrypt.js";
import ServerError from "../Utils/Error.Utils.js";
import jwt from 'jsonwebtoken';
import { buildVerificationEmailHtml, buildVerificationEmailText } from "../Utils/email-templates/verification-email.js";
import { buildResetPasswordEmailHtml, buildResetPasswordEmailText } from "../Utils/email-templates/reset-password-email.js";

/*
    Authentication service. This layer holds the business logic of the
    auth endpoints; the controllers only extract the data from the HTTP
    request, hand it over here and build the response.

    Errors are thrown as ServerError (message, status) and handled by
    the error middleware, so neither this layer nor the controllers
    need try/catch blocks.
*/

/*
    Signs the verification token and sends the verification email.
    Shared by register and resend.
*/
async function sendVerificationEmail(email) {
    /* When a user logs in, we must hand them a signed credential that lets us state who they are.
        The same mechanism backs the verification flow: JWT (JsonWebTokens) are Js objects turned
        into strings by an algorithm called HS256. */
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

/*
    Signs the password-reset token and sends the reset email.
    The token carries the email of the user and expires in 1 hour.
    It does not need to be stored in the database: the signature
    and the expiration already guarantee that it is valid. The link
    in the email points to the frontend, which sends the token back
    to the API together with the new password.
*/
async function sendResetPasswordEmail(email) {
    const resetPasswordToken = jwt.sign(
        {
            email: email
        },
        ENVIRONMENT.JWT_SECRET_KEY,
        {
            expiresIn: "1h"
        }
    )

    await mailer_transporter.sendMail(
        {
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: "Reset your password",
            html: buildResetPasswordEmailHtml(resetPasswordToken),
            text: buildResetPasswordEmailText(resetPasswordToken)
        }
    )
}

class AuthService {
    async register(username, email, password) {
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
    }

    async login(email, password) {
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

        return {
            authToken: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        }
    }

    async verifyEmail(verifyEmailToken) {
        if (!verifyEmailToken) {
            throw new ServerError('The verification token is missing', 400)
        }

        // jwt.verify throws when the signature is invalid or the token already
        // expired; we turn that into a controlled error instead of a 500.
        let payload
        try {
            payload = jwt.verify(verifyEmailToken, ENVIRONMENT.JWT_SECRET_KEY)
        } catch (error) {
            throw new ServerError('The verification token is invalid or expired', 400)
        }
        const { email } = payload

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
    }

    async resendVerificationEmail(email) {
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
    }

    /*
        Password reset, step 1: the user asks for a reset email.
        Same anti-enumeration policy as resendVerificationEmail: the
        response does not reveal whether the account exists. We only
        send the email when the account exists and is active.
    */
    async forgotPassword(email) {
        if (!email || typeof email !== 'string') {
            throw new ServerError('Email is required', 400)
        }

        const normalizedEmail = email.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { //Checks that the email looks like an email.
            throw new ServerError(
                "Email is incorrect",
                400
            );
        }

        const userFound = await user_repository.getByEmail(normalizedEmail) //Looks the user up by email to make sure it exists.

        if (userFound && userFound.active) {
            await sendResetPasswordEmail(normalizedEmail)
        }
    }

    /*
        Password reset, step 2: the user arrives from the email link
        with the token in the querystring and sends it back together
        with the new password.
    */
    async resetPassword(resetPasswordToken, password) {
        if (
            !resetPasswordToken
            || !password
            || typeof resetPasswordToken !== 'string'
            || typeof password !== 'string'
        ) {
            throw new ServerError('Reset token and new password are required', 400)
        }

        if (!password.trim()) {
            throw new ServerError('Reset token and new password are required', 400)
        }

        // jwt.verify throws when the signature is invalid or the token already
        // expired; we turn that into a controlled error instead of a 500.
        let payload
        try {
            payload = jwt.verify(resetPasswordToken, ENVIRONMENT.JWT_SECRET_KEY)
        } catch (error) {
            throw new ServerError('The reset token is invalid or expired', 400)
        }
        const { email } = payload

        const userFound = await user_repository.getByEmail(email)

        if (!userFound) {
            throw new ServerError('User not found', 404)
        }

        if (!userFound.active) {
            throw new ServerError('The account was deactivated. Contact the client support if you think this is a mistake.', 400)
        }

        const passwordHash = await generateHash(password, 12);

        await user_repository.updateById(
            userFound._id,
            { password: passwordHash }
        )
    }
}

export default new AuthService()
