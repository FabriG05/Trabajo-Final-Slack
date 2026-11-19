import ENVIRONMENT from "../../Config/Environment.config.js";

/*
    Email templates. One builder per email type, each returning the
    ready-to-send body. The controller/service layer only decides WHEN
    to send, the wording and styling live here.
*/

/* Link to the join page of the workspace, carrying the personal invitation token. */
function buildInvitationUrl(workspaceId, invitationToken) {
    return ENVIRONMENT.URL_FRONTEND + '/workspace/' + workspaceId + '/join?token=' + invitationToken
}

export function buildInvitationEmailHtml(inviterName, workspaceName, workspaceId, invitationToken) {
    const invitationUrl = buildInvitationUrl(workspaceId, invitationToken)

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
                                            You are invited to a workspace
                                        </h1>
                                    </td>
                                </tr>
                                <!-- Body -->
                                <tr>
                                    <td style="padding: 32px;">
                                        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #1d1c1d; font-weight: 700;">
                                            ${inviterName} invited you to join <strong>${workspaceName}</strong>
                                        </p>
                                        <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #1d1c1d;">
                                            Accept the invitation with the email address this message
                                            was sent to. If you do not have an account yet, create one
                                            with that email address and then open this link again.
                                            The link expires in 7 days.
                                        </p>
                                        <!-- Call-to-action button -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                                            <tr>
                                                <td style="border-radius: 4px; background-color: #481a54;" align="center">
                                                    <a href="${invitationUrl}"
                                                        style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none;">
                                                        Join ${workspaceName}
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- Plain-text URL fallback -->
                                        <p style="margin: 28px 0 0; font-size: 14px; line-height: 1.6; color: #616061;">
                                            If the button does not work, copy and paste this URL into your browser:
                                        </p>
                                        <p style="margin: 8px 0 0; font-size: 13px; line-height: 1.6; color: #1264a3; word-break: break-all;">
                                            <a href="${invitationUrl}" style="color: #1264a3;">${invitationUrl}</a>
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 20px 32px; border-top: 1px solid #ebeaeb;">
                                        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #616061;">
                                            If you were not expecting this invitation, you can safely ignore it.
                                            This message was sent because ${inviterName} added this address to the
                                            members of ${workspaceName}.
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
    Builds a plain-text version of the invitation email, shown by mail
    clients that do not render HTML or when the user disables it.
*/
export function buildInvitationEmailText(inviterName, workspaceName, workspaceId, invitationToken) {
    const invitationUrl = buildInvitationUrl(workspaceId, invitationToken)

    return [
        `${inviterName} invited you to join ${workspaceName}.`,
        '',
        'Accept the invitation with the email address this message was sent to.',
        'If you do not have an account yet, create one with that email address and then open this link again:',
        invitationUrl,
        '',
        'This link expires in 7 days. If you were not expecting this invitation, you can safely ignore it.'
    ].join('\n')
}
