const { CURSOR_MOVE, CURSOR_LEAVE } = require('../utils/events');

module.exports = (io, socket) => {
    socket.on(CURSOR_MOVE, ({ x, y, userId, userName, room }) => {
        // Broadcast cursor position to all users in the room except the sender
        socket.to(room).emit(CURSOR_MOVE, {
            x,
            y,
            userId,
            userName
        });
    });

    socket.on(CURSOR_LEAVE, ({ userId, room }) => {
        // Notify others in the room that this user's cursor left the canvas
        socket.to(room).emit(CURSOR_LEAVE, { userId });
    });
};
