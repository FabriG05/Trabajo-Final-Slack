import Channel from "../Models/ChannelModel.js";

class ChannelRepository {
    async create(workspaceId, name, createdBy) {
        try {
            const channel = await Channel.create({
                workspace_id: workspaceId,
                name,
                created_by: createdBy
            });
            return channel;
        } catch (error) {
            console.error('Error in ChannelRepository.create:', error.message);
            throw error;
        }
    }

    async getByWorkspaceId(workspaceId) {
        try {
            return await Channel
                .find({ workspace_id: workspaceId })
                .sort({ created_at: 1 });
        } catch (error) {
            console.error('Error in ChannelRepository.getByWorkspaceId:', error.message);
            throw error;
        }
    }

    async getByWorkspaceAndName(workspaceId, name) {
        try {
            return await Channel.findOne({ workspace_id: workspaceId, name });
        } catch (error) {
            console.error('Error in ChannelRepository.getByWorkspaceAndName:', error.message);
            throw error;
        }
    }

    async getById(channelId) {
        try {
            return await Channel.findById(channelId);
        } catch (error) {
            console.error('Error in ChannelRepository.getById:', error.message);
            throw error;
        }
    }

    async deleteById(channelId) {
        try {
            return await Channel.findByIdAndDelete(channelId);
        } catch (error) {
            console.error('Error in ChannelRepository.deleteById:', error.message);
            throw error;
        }
    }

    async deleteByWorkspaceId(workspaceId) {
        try {
            const result = await Channel.deleteMany({ workspace_id: workspaceId });
            return result.deletedCount;
        } catch (error) {
            console.error('Error in ChannelRepository.deleteByWorkspaceId:', error.message);
            throw error;
        }
    }

    async updateById(channelId, updateFields) {
        try {
            return await Channel.findByIdAndUpdate(
                channelId,
                updateFields,
                { new: true, runValidators: true }
            )
        } catch (error) {
            console.error('Error in ChannelRepository.updateById:', error.message)
            throw error
        }
    }

    async searchByWorkspaceId(workspaceId, query, limit = 10) {
        try {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            return await Channel.find({
                workspace_id: workspaceId,
                name: { $regex: escapedQuery, $options: 'i' }
            })
                .sort({ name: 1 })
                .limit(limit)
        } catch (error) {
            console.error('Error in ChannelRepository.searchByWorkspaceId:', error.message)
            throw error
        }
    }
}

const channelRepository = new ChannelRepository();
export default channelRepository;

