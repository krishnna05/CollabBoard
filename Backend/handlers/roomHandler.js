const { JOIN_ROOM, UPDATE_USERS, DISCONNECT } = require('../utils/events');

const users = {}; // socketId -> { username, roomId }

const getUsersInRoom = (roomId) => {
    return Object.values(users).filter(user => user.roomId === roomId);
};

module.exports = (io, socket) => {
    socket.on(JOIN_ROOM, ({ roomId, username }) => {
        socket.join(roomId);
        users[socket.id] = { username, roomId };

        io.to(roomId).emit(UPDATE_USERS, getUsersInRoom(roomId));
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
