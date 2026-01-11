const { DRAW_LINE, CLEAR_BOARD } = require('../utils/events');

module.exports = (io, socket) => {
  socket.on(DRAW_LINE, ({ prevPoint, currentPoint, color, width, isErasing }) => {
    socket.broadcast.emit(DRAW_LINE, {
      prevPoint,
      currentPoint,
      color,
      width,
      isErasing
    });
  });

  socket.on(CLEAR_BOARD, () => {
    socket.broadcast.emit(CLEAR_BOARD);
  });
};