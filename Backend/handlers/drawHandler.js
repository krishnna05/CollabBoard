const { DRAW_LINE } = require('../utils/events');

module.exports = (io, socket) => {
  socket.on(DRAW_LINE, ({ prevPoint, currentPoint, color, width }) => {
    socket.broadcast.emit(DRAW_LINE, {
      prevPoint,
      currentPoint,
      color,
      width
    });
  });
};