import Workspace from "../Models/WorkSpaceModel.js";

class WorkspaceRepository {
    async create(name, description) {
        return await this.createWorkspace(name, description);
    }

    async createWorkspace(name, description) {
        try {
            const createdWorkspace = await Workspace.create({ name, description });
            console.log('Workspace created successfully:', createdWorkspace);
            return createdWorkspace; 
        } catch (error) {
            console.error('Error in WorkspaceRepository:', error.message);
            throw error; 
        }
    }

    async getById(workspaceId) {
        try {
            const workspace = await Workspace.findById(workspaceId);
            return workspace;
        } catch (error) {
            console.error('Error in WorkspaceRepository:', error.message);
            throw error;
        }
    }

    async deleteById(workspaceId) {
        try {
            const deletedWorkspace = await Workspace.findByIdAndDelete(workspaceId);
            console.log('Workspace deleted successfully:', deletedWorkspace);
            return deletedWorkspace;
        } catch (error) {
            console.error('Error in WorkspaceRepository:', error.message);
            throw error;
        }
    }

    async updateById(workspaceId, nameOrData, description) {
        try {
            let updateFields = {};
            if (typeof nameOrData === 'object' && nameOrData !== null) {
                updateFields = nameOrData;
            } else {
                if (nameOrData !== undefined) updateFields.name = nameOrData;
                if (description !== undefined) updateFields.description = description;
            }

            const updatedWorkspace = await Workspace.findByIdAndUpdate(
                workspaceId,
                updateFields,
                { new: true, runValidators: true }
            );
            console.log('Workspace updated successfully:', updatedWorkspace);
            return updatedWorkspace;
        } catch (error) {
            console.error('Error in WorkspaceRepository:', error.message);
            throw error;
        }
    }

    async getAll() {
        try {
            const workspaces = await Workspace.find();
            return workspaces;
        } catch (error) {
            console.error('Error in WorkspaceRepository:', error.message);
            throw error;
        }
    }
}

const WorkSpace_Repository = new WorkspaceRepository()
export default WorkSpace_Repository
