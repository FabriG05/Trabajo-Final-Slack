import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import ENVIRONMENT from "../Config/Environment.config.js";
import memberRepository from "../Repositories/MemberRepository.js";
import ServerError from "../Utils/Error.Utils.js";

/*
    Realtime layer (Socket.IO).

    The HTTP API stays the source of truth: every message/channel is stored
    in MongoDB through the repositories and then published here. Sockets
    only carry notifications to the clients that are already allowed to
    read that data.

    Rooms:
        user:<user_id>            -> one socket per logged-in user (direct messages)
        workspace:<workspace_id>  -> members of a workspace (channels, typing)
*/

let io = null;

const userRoom = (userId) => `user:${userId}`;
const workspaceRoom = (workspaceId) => `workspace:${workspaceId}`;

function readHandshakeToken(socket) {
    const authToken = socket.handshake.auth?.token;

    if (authToken) {
        return authToken;
    }

    const authHeader = socket.handshake.headers?.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }

    return null;
}

async function isWorkspaceMember(userId, workspaceId) {
    const membership = await memberRepository.getMembershipByUserAndWorkspace(
        userId,
        workspaceId
    );

    return Boolean(membership && membership.invitation_accepted);
}

async function handleTyping(socket, eventName, payload = {}) {
    try {
        const { workspaceId, scope, channelId, userId } = payload;

        // Typing is only accepted for workspaces this socket already joined.
        if (!workspaceId || !socket.data.joinedWorkspaces.has(String(workspaceId))) {
            return;
        }

        const typingPayload = {
            scope,
            channelId: channelId ?? null,
            userId: socket.user.id,
            user: {
                _id: socket.user.id,
                name: socket.user.name
            }
        };

        if (scope === "direct") {
            if (!userId) {
                return;
            }

            // The other side must still be an active member of the workspace.
            const targetIsMember = await isWorkspaceMember(userId, workspaceId);

            if (!targetIsMember) {
                return;
            }

            io.to(userRoom(userId)).emit(eventName, typingPayload);
            return;
        }

        // Channel typing goes to the rest of the workspace, not the sender.
        socket.to(workspaceRoom(workspaceId)).emit(eventName, typingPayload);
    } catch (error) {
        console.error("[Socket typing]", error.message);
    }
}

export function initSocketServer(httpServer) {
    if (!httpServer) {
        return null;
    }

    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.use((socket, next) => {
        try {
            const authToken = readHandshakeToken(socket);

            if (!authToken) {
                return next(new Error("Auth token is required."));
            }

            const { id, name, email } = jwt.verify(
                authToken,
                ENVIRONMENT.JWT_SECRET_KEY
            );

            socket.user = { id, name, email };
            next();
        } catch {
            next(new Error("Auth token is invalid."));
        }
    });

    io.on("connection", (socket) => {
        socket.data.joinedWorkspaces = new Set();

        // Every client listens to its own room, so direct messages can be
        // delivered without joining a conversation first.
        socket.join(userRoom(socket.user.id));

        socket.on("workspace:join", async (payload = {}, acknowledge) => {
            try {
                const workspaceId = payload.workspaceId;

                if (!workspaceId) {
                    throw new ServerError("workspaceId is required.", 400);
                }

                if (!(await isWorkspaceMember(socket.user.id, workspaceId))) {
                    throw new ServerError(
                        "You are not a member of this workspace",
                        403
                    );
                }

                socket.join(workspaceRoom(workspaceId));
                socket.data.joinedWorkspaces.add(String(workspaceId));

                if (typeof acknowledge === "function") {
                    acknowledge({ ok: true });
                }
            } catch (error) {
                if (typeof acknowledge === "function") {
                    acknowledge({ ok: false, message: error.message });
                }
            }
        });

        socket.on("typing:start", (payload) => handleTyping(socket, "typing:start", payload));
        socket.on("typing:stop", (payload) => handleTyping(socket, "typing:stop", payload));

        socket.on("disconnect", () => {
            socket.data.joinedWorkspaces.clear();
        });
    });

    return io;
}

/* Publishes a stored message to everyone who is allowed to see it. */
export function publishMessage(message) {
    if (!io || !message) {
        return;
    }

    if (message.message_type === "direct") {
        const senderId = message.sender_id?._id ?? message.sender_id;
        const receiverId = message.receiver_id?._id ?? message.receiver_id;
        const payload = { scope: "direct", message };

        if (senderId) {
            io.to(userRoom(senderId)).emit("message:created", payload);
        }

        if (receiverId) {
            io.to(userRoom(receiverId)).emit("message:created", payload);
        }

        return;
    }

    const workspaceId = message.workspace_id?._id ?? message.workspace_id;

    if (!workspaceId) {
        return;
    }

    io.to(workspaceRoom(workspaceId)).emit("message:created", {
        scope: "channel",
        channelId: message.channel_id,
        message
    });
}

/* Publishes a newly created channel to the members of its workspace. */
export function publishChannel(workspaceId, channel) {
    if (!io || !workspaceId || !channel) {
        return;
    }

    io.to(workspaceRoom(workspaceId)).emit("channel:created", { channel });
}

/* Tells every reader that a message was deleted, so it disappears live. */
export function publishMessageDeleted(message) {
    if (!io || !message) {
        return;
    }

    const messageId = message._id;

    if (message.message_type === "direct") {
        const senderId = message.sender_id?._id ?? message.sender_id;
        const receiverId = message.receiver_id?._id ?? message.receiver_id;
        const payload = { scope: "direct", messageId, message };

        if (senderId) {
            io.to(userRoom(senderId)).emit("message:deleted", payload);
        }

        if (receiverId) {
            io.to(userRoom(receiverId)).emit("message:deleted", payload);
        }

        return;
    }

    const workspaceId = message.workspace_id?._id ?? message.workspace_id;

    if (!workspaceId) {
        return;
    }

    io.to(workspaceRoom(workspaceId)).emit("message:deleted", {
        scope: "channel",
        channelId: message.channel_id,
        messageId,
        message
    });
}

/* Publishes a deleted channel to the members of its workspace. */
export function publishChannelDeleted(workspaceId, channel) {
    if (!io || !workspaceId || !channel) {
        return;
    }

    io.to(workspaceRoom(workspaceId)).emit("channel:deleted", {
        channelId: channel._id,
        channel
    });
}

/* Tells the members that the workspace no longer exists. */
export function publishWorkspaceDeleted(workspaceId) {
    if (!io || !workspaceId) {
        return;
    }

    io.to(workspaceRoom(workspaceId)).emit("workspace:deleted", { workspaceId });
}
