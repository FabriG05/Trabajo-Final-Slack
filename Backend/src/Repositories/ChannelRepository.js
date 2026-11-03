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
            return await Channel.find({ workspace_id: workspaceId });
        } catch (error) {
            console.error('Error in ChannelRepository.getByWorkspaceId:', error.message);
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
}

const channelRepository = new ChannelRepository();
export default channelRepository;

