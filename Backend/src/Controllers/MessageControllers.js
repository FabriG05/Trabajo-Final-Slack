import message_service from "../Services/MessageServices.js";
import {
    publishMessage,
    publishMessageDeleted
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
    const { content } = request.body;

    const message = await message_service.createChannelMessage(
        request.workspace._id,
        channel_id,
        request.user.id,
        content
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
    const { content } = request.body;

    const message = await message_service.createDirectMessage(
        request.workspace._id,
        request.user.id,
        user_id,
        content
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
