import workspace_service from "../Services/WorkspaceServices.js";

/*
    To send information to an API we use the request body.

    GET requests have NO body.
    The body can be of several data types:
        Today we are using JSON, so our API must be prepared
        to receive that type of information.
*/

/*
    Workspace controllers. Thin HTTP layer: every handler only reads the
    data out of the request, hands it to the workspace service (which
    owns the business logic) and builds the response. Errors thrown by
    the service are handled by the error middleware.
*/

export async function getAllWorkspaces(request, response) {
    const obtainedWorkspaces = await workspace_service.getAllWorkspacesByUserId(request.user.id);

    return response.status(200).send({
        ok: true,
        message: "All data retrieved successfully",
        status: 200,
        data: {
            obtainedWorkspaces
        }
    });
}

export async function createWorkspace(request, response) {
    const { name, description } = request.body;

    const { createdWorkspace, ownerMembership, generalChannel } = await workspace_service.createWorkspace(
        request.user.id,
        name,
        description
    );

    return response.status(201).send(
        {
            ok: true,
            message: "Everything is fine so far",
            data: {
                createdWorkspace,
                ownerMembership,
                generalChannel
            }
        }
    );
}

export async function getWorkspaceById(request, response) {
    // The workspace is validated and attached to the request by the workspace middleware.
    return response.status(200).send({
        ok: true,
        message: "Workspace retrieved successfully",
        data: {
            selectedWorkspace: request.workspace
        }
    });
}

export async function deleteWorkspace(request, response) {
    const deletedWorkspace = await workspace_service.deleteWorkspace(request.workspace._id);

    return response.status(200).send({
        ok: true,
        message: "Workspace deleted successfully",
        data: {
            deletedWorkspace
        }
    });
}

export async function updateWorkspace(request, response) {
    const { name, description } = request.body;

    const updatedWorkspace = await workspace_service.updateWorkspace(
        request.workspace._id,
        name,
        description
    );

    return response.status(200).send({
        ok: true,
        message: "Workspace updated successfully",
        data: {
            updatedWorkspace
        }
    });
}

export async function getWorkspaceMembers(request, response) {
    const members = await workspace_service.getWorkspaceMembers(request.workspace._id);

    return response.status(200).send({
        ok: true,
        message: "Members retrieved successfully.",
        data: {
            members
        }
    });
}

export async function deleteWorkspaceMember(request, response) {
    const { member_id } = request.params;

    const deletedMember = await workspace_service.deleteWorkspaceMember(member_id);

    return response.status(200).send({
        ok: true,
        message: "Member deleted successfully.",
        data: {
            deletedMember
        }
    });
}

export async function joinWorkspace(request, response) {
    const { workspace_id } = request.params;
    const { invitation_token } = request.body;

    const joinSummary = await workspace_service.joinWorkspace(
        workspace_id,
        request.user.id,
        request.user.email,
        invitation_token
    );

    return response.status(200).send({
        ok: true,
        message: "Invitation accepted successfully.",
        data: {
            joinSummary
        }
    });
}

export async function createInvitations(request, response) {
    const { emails } = request.body;

    const invitationSummary = await workspace_service.createInvitations(
        request.workspace._id,
        request.user.name,
        emails
    );

    return response.status(201).send({
        ok: true,
        message: "Invitations processed successfully.",
        data: {
            invitationSummary
        }
    });
}
