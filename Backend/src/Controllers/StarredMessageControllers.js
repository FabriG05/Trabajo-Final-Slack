import starredMessageService from "../Services/StarredMessageServices.js";

export async function getStarredMessages(request, response) {
    const starred = await starredMessageService.getStarredMessages(
        request.workspace._id,
        request.user.id
    );

    return response.status(200).send({
        ok: true,
        message: "Starred messages retrieved successfully.",
        data: { starred }
    });
}

export async function getStarredMessageIds(request, response) {
    const ids = await starredMessageService.getStarredMessageIds(
        request.workspace._id,
        request.user.id
    );

    return response.status(200).send({
        ok: true,
        message: "Starred message IDs retrieved successfully.",
        data: { ids }
    });
}

export async function starMessage(request, response) {
    const { message_id } = request.params;

    const result = await starredMessageService.starMessage(
        request.workspace._id,
        request.user.id,
        message_id
    );

    return response.status(201).send({
        ok: true,
        message: "Message starred successfully.",
        data: result
    });
}

export async function unstarMessage(request, response) {
    const { message_id } = request.params;

    const result = await starredMessageService.unstarMessage(
        request.workspace._id,
        request.user.id,
        message_id
    );

    return response.status(200).send({
        ok: true,
        message: "Message unstarred successfully.",
        data: result
    });
}
