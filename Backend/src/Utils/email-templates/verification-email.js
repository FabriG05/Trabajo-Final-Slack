import ENVIRONMENT from "../../Config/Environment.config.js";

/*
    Email templates. One builder per email type, each returning the
    ready-to-send body. The controller/service layer only decides WHEN
    to send, the wording and styling live here.
*/
export function buildVerificationEmailHtml(verifyEmailToken, frontendUrl = null) {
    const baseUrl = (frontendUrl || ENVIRONMENT.URL_FRONTEND || 'http://localhost:5173').replace(/\/$/, '')
    const verifyEmailUrl = baseUrl + '/verify-email?verification_token=' + verifyEmailToken

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
export function buildVerificationEmailText(verifyEmailToken, frontendUrl = null) {
    const baseUrl = (frontendUrl || ENVIRONMENT.URL_FRONTEND || 'http://localhost:5173').replace(/\/$/, '')
    const verifyEmailUrl = baseUrl + '/verify-email?verification_token=' + verifyEmailToken

    return [
        'Welcome to our platform!',
        '',
        'To finish setting up your account, please confirm that this email address belongs to you:',
        verifyEmailUrl,
        '',
        'This link expires in 24 hours. If you did not request this email, you can safely ignore it.'
    ].join('\n')
}
