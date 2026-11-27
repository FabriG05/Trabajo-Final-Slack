import message_service from "../Services/MessageServices.js";
import read_service from "../Services/ReadServices.js";
import {
    publishMessage,
    publishMessageDeleted,
    publishMessageUpdated
} from "../Realtime/SocketServer.js";

/*
    Message controllers. Thin HTTP layer for channel messages and
    direct messages; the message service owns the validation.
*/

export async function getChannelMessages(request, response) {
    const { channel_id } = request.params;

    const messages = await message_service.getChannelMessages(
        request.workspace._id,
        channel_id
    );

    return response.status(200).send({
        ok: true,
        message: "Messages retrieved successfully.",
        data: {
            messages
        }
    });
}

export async function createChannelMessage(request, response) {
    const { channel_id } = request.params;
    const { content, attachment } = request.body;

    const message = await message_service.createChannelMessage(
        request.workspace._id,
        channel_id,
        request.user.id,
        content,
        attachment
    );

    // Notify the rest of the workspace in real time.
    publishMessage(message);

    return response.status(201).send({
        ok: true,
        message: "Message sent successfully.",
        data: {
            message
        }
    });
}

/*
    Activity feed: channel messages where the signed-in user was
    mentioned. Unread direct messages are computed by the client.
*/
export async function getActivity(request, response) {
    const [mentions, readMap] = await Promise.all([
        message_service.getMentions(
            request.workspace._id,
            request.user.id,
            request.user.name
        ),
        read_service.getReadMap(request.workspace._id, request.user.id)
    ]);

    const fallbackSince = request.membership?.created_at
        ? new Date(request.membership.created_at)
        : new Date(0);

    return response.status(200).send({
        ok: true,
        message: "Activity retrieved successfully.",
        data: {
            mentions: mentions.map((message) => {
                const channelKey = message.channel_id
                    ? String(message.channel_id._id)
                    : null;
                const readSince = channelKey
                    ? (readMap[channelKey] || fallbackSince)
                    : fallbackSince;

                return {
                    id: message._id,
                    content: message.content,
                    created_at: message.created_at,
                    is_new: Boolean(channelKey)
                        && new Date(message.created_at) > readSince,
                    channel: message.channel_id
                        ? {
                            id: message.channel_id._id,
                            name: message.channel_id.name
                        }
                        : null,
                    sender: {
                        id: message.sender_id?._id,
                        name: message.sender_id?.name || message.sender_id?.email,
                        photo: message.sender_id?.profile_photo || null
                    }
                };
            })
        }
    });
}

export async function getDirectMessageSummaries(request, response) {
    const conversations = await message_service.getDirectMessageSummaries(
        request.workspace._id,
        request.user.id
    );

    return response.status(200).send({
        ok: true,
        message: "Direct message summaries retrieved successfully.",
        data: {
            conversations: conversations.map((conversation) => ({
                user_id: conversation._id,
                last_message: {
                    id: conversation.lastMessage?._id,
                    content: conversation.lastMessage?.content,
                    sender_id: conversation.lastMessage?.sender_id,
                    created_at: conversation.lastMessage?.created_at
                }
            }))
        }
    });
}

export async function getDirectMessages(request, response) {
    const { user_id } = request.params;

    const messages = await message_service.getDirectMessages(
        request.workspace._id,
        request.user.id,
        user_id
    );

    return response.status(200).send({
        ok: true,
        message: "Direct messages retrieved successfully.",
        data: {
            messages
        }
    });
}

/*
    Deletes one message. The workspace middleware already loaded the
    requester membership, so the role check does not need another query.
*/
export async function deleteMessage(request, response) {
    const { message_id } = request.params;

    const deletedMessage = await message_service.deleteMessage(
        request.workspace._id,
        message_id,
        request.user.id,
        request.membership?.role
    );

    // Notify the channel members, or both participants of the DM.
    publishMessageDeleted(deletedMessage);

    return response.status(200).send({
        ok: true,
        message: "Message deleted successfully.",
        data: {
            deletedMessage
        }
    });
}

export async function createDirectMessage(request, response) {
    const { user_id } = request.params;
    const { content, attachment } = request.body;

    const message = await message_service.createDirectMessage(
        request.workspace._id,
        request.user.id,
        user_id,
        content,
        attachment
    );

    // Notify both participants in real time.
    publishMessage(message);

    return response.status(201).send({
        ok: true,
        message: "Direct message sent successfully.",
        data: {
            message
        }
    });
}

export async function updateMessage(request, response) {
    const { message_id } = request.params;
    const { content } = request.body;

    const message = await message_service.updateMessage(
        request.workspace._id,
        message_id,
        request.user.id,
        content
    );

    publishMessageUpdated(message);

    return response.status(200).send({
        ok: true,
        message: "Message updated successfully.",
        data: {
            message
        }
    });
}

export async function searchWorkspace(request, response) {
    const { q } = request.query;

    const results = await message_service.searchWorkspace(
        request.workspace._id,
        request.user.id,
        q
    );

    return response.status(200).send({
        ok: true,
        message: "Search results retrieved successfully.",
        data: results
    });
}
