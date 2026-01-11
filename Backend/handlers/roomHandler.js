const { JOIN_ROOM, UPDATE_USERS, DISCONNECT, CANVAS_STATE, LEAVE_ROOM } = require('../utils/events');
const Stroke = require('../models/Stroke');

const users = {};

const getUsersInRoom = (roomId) => {
    return Object.values(users).filter(user => user.roomId === roomId);
};

module.exports = (io, socket) => {
    socket.on(JOIN_ROOM, async ({ roomId, username }) => {
        if (users[socket.id]) {
            const oldRoom = users[socket.id].roomId;
            socket.leave(oldRoom);
            delete users[socket.id];
            io.to(oldRoom).emit(UPDATE_USERS, getUsersInRoom(oldRoom));
            console.log(`User ${username} auto-left room ${oldRoom} to join ${roomId}`);
        }

        socket.join(roomId);
        users[socket.id] = { username, roomId };

        io.to(roomId).emit(UPDATE_USERS, getUsersInRoom(roomId));

        try {
            const strokes = await Stroke.find({ roomId }).sort({ createdAt: 1 });
            console.log(`Loading ${strokes.length} strokes for room ${roomId}`);
            socket.emit(CANVAS_STATE, strokes);
        } catch (err) {
            console.error("Error loading canvas state:", err);
        }
    });

    socket.on(LEAVE_ROOM, ({ roomId }) => {
        const user = users[socket.id];
        if (user) {
            delete users[socket.id];
            socket.leave(roomId);
            io.to(roomId).emit(UPDATE_USERS, getUsersInRoom(roomId));
            console.log(`User ${user.username} left room ${roomId}`);
        }
    });

    socket.on(DISCONNECT, () => {
        const user = users[socket.id];
        if (user) {
            const { roomId } = user;
            delete users[socket.id];
            io.to(roomId).emit(UPDATE_USERS, getUsersInRoom(roomId));
        }
    });
};
