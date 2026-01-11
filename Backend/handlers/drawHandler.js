const { DRAW_LINE, CLEAR_BOARD, JOIN_ROOM } = require('../utils/events');

module.exports = (io, socket) => {
  /* socket.on(JOIN_ROOM) moved to roomHandler to track users */

  socket.on(DRAW_LINE, ({ prevPoint, currentPoint, color, width, room, isErasing }) => {
    socket.to(room).emit(DRAW_LINE, {
      prevPoint,
      currentPoint,
      color,
      width,
      isErasing
    });
  });

  socket.on(CLEAR_BOARD, (room) => {
    socket.to(room).emit(CLEAR_BOARD);
  });
};