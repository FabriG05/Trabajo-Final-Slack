import pool from "../Config/MySQL.config.js"

class MemberRepository {
    async create(userId, workspaceId, role) {
        try {
            const sqlQuery = 'INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)'
            // Mapeamos los roles del modelo Mongoose a los ENUM de MySQL
            const mysqlRole = this.#mapRole(role)
            const [result] = await pool.execute(sqlQuery, [workspaceId, userId, mysqlRole])
            const createdMember = {
                _id: result.insertId,
                user_id: userId,
                workspace_id: workspaceId,
                role: mysqlRole
            }
            console.log('Member created successfully DB:', createdMember);
            return createdMember;
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }

    async deleteById(memberId) {
        try {
            const sqlQuery = 'DELETE FROM workspace_members WHERE id = ?'
            const [result] = await pool.execute(sqlQuery, [memberId])
            console.log('Member deleted successfully from DB, affected rows:', result.affectedRows);
            return result
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }

    async updateRoleById(memberId, role) {
        try {
            const mysqlRole = this.#mapRole(role)
            const sqlQuery = 'UPDATE workspace_members SET role = ? WHERE id = ?'
            const [result] = await pool.execute(sqlQuery, [mysqlRole, memberId])
            console.log('Role updated successfully in DB, affected rows:', result.affectedRows);

            const [updated] = await pool.execute('SELECT * FROM workspace_members WHERE id = ?', [memberId]) //Retornamos el miembro actualizado.
            return updated[0] || null
        } catch (error) {
            console.error('Error in MemberRepository:', error.message);
            throw error;
        }
    }

    async getAllWorkspacesByUserId(userId) {
        //Reemplaza el .populate() de Mongoose con un JOIN de SQL.
        const sqlQuery = `
            SELECT wm.*, w.name AS workspace_name, w.created_at AS workspace_created_at
            FROM workspace_members wm
            JOIN workspaces w ON wm.workspace_id = w.id
            WHERE wm.user_id = ?
        `
        const [result] = await pool.execute(sqlQuery, [userId])
        console.log(result)
        return result
    }

    async getAllMembershipsByWorkspaceId(workspaceId) {
        //Reemplaza el .populate() de Mongoose con un JOIN de SQL.
        const sqlQuery = `
            SELECT wm.*, u.username AS name, u.email
            FROM workspace_members wm
            JOIN users u ON wm.user_id = u.id
            WHERE wm.workspace_id = ?
        `
        const [result] = await pool.execute(sqlQuery, [workspaceId])
        console.log('Members of the workspace: ', result)
        return result
    }

    async getMembershipByUserAndWorkspace(userId, workspaceId) {
        const sqlQuery = 'SELECT * FROM workspace_members WHERE user_id = ? AND workspace_id = ?'
        const [result] = await pool.execute(sqlQuery, [userId, workspaceId])
        return result[0] || null
    }

    //Método privado para mapear roles del modelo Mongoose a los ENUM de MySQL3.
    #mapRole(role) {
        const roleMap = {
            'Owner': 'OWNER',
            'Admin': 'ADMIN',
            'User': 'MEMBER',
            'OWNER': 'OWNER',
            'ADMIN': 'ADMIN',
            'MEMBER': 'MEMBER'
        }
        return roleMap[role] || 'MEMBER'
    }
}

const memberRepository = new MemberRepository()

export default memberRepository;
