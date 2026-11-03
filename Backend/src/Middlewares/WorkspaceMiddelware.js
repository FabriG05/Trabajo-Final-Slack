import memberRepository from "../Repositories/MemberRepository.js"
import workspaceRepository from "../Repositories/WorkSpaceRepository.js"
import ServerError from "../Utils/Error.Utils.js"


/* 
Validar que el espacio de trabajo exista.
Validar que quien consulta sea parte de este espacio de trabajo.
    Revisar que sea miembro de este workspace (que tenga membresia)
Validar el rol de quien consulta.
*/

function workspaceMiddleware(validRoles = []) {

    return async function
        (request, response, next) {

        const { workspace_id } = request.params
        const selectedWorkspace = await workspaceRepository.getById(workspace_id)

        if (!selectedWorkspace) {
            throw new ServerError(
                'Workspace not found',
                404
            )
        }

        const membership = await memberRepository.getMembershipByUserAndWorkspace(request.user.id, workspace_id)
        console.log('[WorkspaceMiddleware]:', membership, workspace_id, request.user)

        if (!membership) {
            throw new ServerError(
                'You are not a member of this workspace',
                403
            )
        }

        if (validRoles.length > 0 && !validRoles.includes(membership.role)) {
            throw new ServerError(
                'You do not have enough permissions to perform this operation',
                403
            )
        }

        request.workspace = selectedWorkspace
        request.membership = membership
        next()
    }

}

export default workspaceMiddleware
