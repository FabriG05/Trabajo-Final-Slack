import memberRepository from "../Repositories/MemberRepository.js"
import workspaceRepository from "../Repositories/WorkSpaceRepository.js"
import ServerError from "../Utils/Error.Utils.js"


/* 
Validar que el espacio de trabajo exista
Validar que quien consulta sea parte de este espacio de trabajo
    Revisar que sea miembro de este workspace (que tenga membresia)
Validar el rol de quien consulta
*/
function workspaceMiddleware(validRoles) {

    return async function
        (request, response, next) {

        const { workspace_id } = request.params
        const selectedWorkspace = await workspaceRepository.getById(workspace_id)

        const membership = await memberRepository.getMembershipByUserAndWorkspace(request.user.id, workspace_id)
        console.log('[WorkspaceMiddleware]:', membership, workspace_id, request.user)

        if (!selectedWorkspace) {
            throw new ServerError(
                'Workspace not found',
                404
            )
        }

        if (validRoles.length > 0 && !validRoles.includes(membership.role)) {
            throw new ServerError(
                'You do not have enough permissions to perform this operation',
                403
            )
        }
        request.workspace = selectedWorkspace
        next()
    }

}

export default workspaceMiddleware