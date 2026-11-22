import read_service from "../Services/ReadServices.js";

/*
    Read-state controllers: marking a conversation as read and rebuilding
    the unread badges when the workspace loads.
*/

export async function markConversationRead(request, response) {
    const { conversation_key } = request.params;
    const { type } = request.body;

    const read = await read_service.markConversationRead(
        request.workspace._id,
        request.user.id,
        conversation_key,
        type
    );

    return response.status(200).send({
        ok: true,
        message: "Conversation marked as read.",
        data: {
            read
        }
    });
}

export async function getUnreadCounts(request, response) {
    const counts = await read_service.getUnreadCounts(
        request.workspace._id,
        request.user.id,
        request.membership?.created_at
    );

    return response.status(200).send({
        ok: true,
        message: "Unread counts retrieved successfully.",
        data: {
            counts
        }
    });
}
