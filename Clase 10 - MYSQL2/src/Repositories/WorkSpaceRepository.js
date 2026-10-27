import pool from "../Config/MySQL.config.js"


class WorkspaceRepository {
    async create(name, description, creatorUserId) {
        try {
            const sqlQuery = 'INSERT INTO workspaces (name, description, creator_user_id) VALUES (?, ?, ?)'
            const [result] = await pool.execute(sqlQuery, [name, description, creatorUserId])
            const createdWorkspace = {
                _id: result.insertId,
                name,
                description,
                creator_user_id: creatorUserId
            }
            console.log('Workspace created successfully:', createdWorkspace);
            return createdWorkspace;
        } catch (error) {
            console.error('Error in WorkspaceRepository:', error.message);
            throw error;
        }
    }

    //Alias para mantener compatibilidad con WorkspaceRouter que llama a createWorkspace
    async createWorkspace(name, description, creatorUserId) {
        return this.create(name, description, creatorUserId)
    }

    async getById(workspaceId) {
        try {
            const sqlQuery = 'SELECT * FROM workspaces WHERE id = ?'
            const [result] = await pool.execute(sqlQuery, [workspaceId])
            if (result.length === 0) {
                return null
            }
            const workspace = result[0]
            return {
                _id: workspace.id,
                name: workspace.name,
                description: workspace.description,
                creator_user_id: workspace.creator_user_id,
                created_at: workspace.created_at,
                updated_at: workspace.updated_at
            }
        } catch (error) {
            console.error('Error in WorkspaceRepository:', error.message);
            throw error;
        }
    }

    async deleteById(workspaceId) {
        try {
            const sqlQuery = 'DELETE FROM workspaces WHERE id = ?'
            const [result] = await pool.execute(sqlQuery, [workspaceId])
            console.log('Workspace deleted successfully, affected rows:', result.affectedRows);
            return result
        } catch (error) {
            console.error('Error in WorkspaceRepository:', error.message);
            throw error;
        }
    }

    async updateById(workspaceId, name, description) {
        try {
            const sqlQuery = 'UPDATE workspaces SET name = ?, description = ? WHERE id = ?'
            const [result] = await pool.execute(sqlQuery, [name, description, workspaceId])
            console.log('Workspace updated successfully, affected rows:', result.affectedRows);

            //Retornamos el workspace actualizado
            if (result.affectedRows === 0) {
                return null
            }
            return await this.getById(workspaceId)
        } catch (error) {
            console.error('Error in WorkspaceRepository:', error.message);
            throw error;
        }
    }
}

const workspaceRepository = new WorkspaceRepository()
export default workspaceRepository