import ENVIRONMENT from "../../Config/Environment.config.js";

/*
    Email templates for the password reset flow. One builder per email
    type, each returning the ready-to-send body. The controller/service
    layer only decides WHEN to send, the wording and styling live here.
*/

/*
    Email with the reset link, sent when the user asks for a password
    reset. The link goes to the frontend, which sends the token back
    to the API: /reset-password?reset_token=<token>
*/
export function buildResetPasswordEmailHtml(resetPasswordToken) {
    const resetPasswordUrl = ENVIRONMENT.URL_FRONTEND + '/reset-password?reset_token=' + resetPasswordToken

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
                                            Reset your password
                                        </h1>
                                    </td>
                                </tr>
                                <!-- Body -->
                                <tr>
                                    <td style="padding: 32px;">
                                        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #1d1c1d; font-weight: 700;">
                                            Did you forget your password?
                                        </p>
                                        <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #1d1c1d;">
                                            We received a request to reset the password of your account.
                                            Click the button below to choose a new one. If it wasn't you,
                                            you can safely ignore this email: your password stays the same.
                                        </p>
                                        <!-- Call-to-action button -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                                            <tr>
                                                <td style="border-radius: 4px; background-color: #481a54;" align="center">
                                                    <a href="${resetPasswordUrl}"
                                                       style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none;">
                                                        Reset your password
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- Plain-text URL fallback -->
                                        <p style="margin: 28px 0 0; font-size: 14px; line-height: 1.6; color: #616061;">
                                            This link expires in 1 hour. If the button does not work,
                                            copy and paste this URL into your browser:
                                        </p>
                                        <p style="margin: 8px 0 0; font-size: 13px; line-height: 1.6; color: #1264a3; word-break: break-all;">
                                            <a href="${resetPasswordUrl}" style="color: #1264a3;">${resetPasswordUrl}</a>
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 20px 32px; border-top: 1px solid #ebeaeb;">
                                        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #616061;">
                                            If you did not request a password reset, you can safely ignore this email.
                                            This message was sent because someone (hopefully you) asked to reset the password of this account.
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
    Builds a plain-text version of the reset email, shown by mail
    clients that do not render HTML or when the user disables it.
*/
export function buildResetPasswordEmailText(resetPasswordToken) {
    const resetPasswordUrl = ENVIRONMENT.URL_FRONTEND + '/reset-password?reset_token=' + resetPasswordToken

    return [
        'Did you forget your password?',
        '',
        'We received a request to reset the password of your account. To choose a new one, open this link:',
        resetPasswordUrl,
        '',
        'This link expires in 1 hour. If you did not request this email, you can safely ignore it.'
    ].join('\n')
}
