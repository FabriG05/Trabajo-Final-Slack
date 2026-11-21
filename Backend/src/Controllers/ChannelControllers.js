import channel_service from "../Services/ChannelServices.js";
import { publishChannel } from "../Realtime/SocketServer.js";

/*
    Channel controllers. Thin HTTP layer: they read the data out of the
    request, hand it to the channel service and build the response.
    Errors thrown by the service are handled by the error middleware.
*/

export async function getChannels(request, response) {
    const channels = await channel_service.getChannels(request.workspace._id);

    return response.status(200).send({
        ok: true,
        message: "Channels retrieved successfully.",
        data: {
            channels
        }
    });
}

export async function createChannel(request, response) {
    const { name } = request.body;

    const channel = await channel_service.createChannel(
        request.workspace._id,
        name,
        request.user.id
    );

    // Notify the rest of the workspace in real time.
    publishChannel(request.workspace._id, channel);

    return response.status(201).send({
        ok: true,
        message: "Channel created successfully.",
        data: {
            channel
        }
    });
}

export async function deleteChannel(request, response) {
    const { channel_id } = request.params;

    const deletedChannel = await channel_service.deleteChannel(
        request.workspace._id,
        channel_id
    );

    return response.status(200).send({
        ok: true,
        message: "Channel deleted successfully.",
        data: {
            deletedChannel
        }
    });
}
