const { DRAW_LINE, CLEAR_BOARD } = require('../utils/events');
const Stroke = require('../models/Stroke');

module.exports = (io, socket) => {
  socket.on(DRAW_LINE, ({ prevPoint, currentPoint, color, width, room, isErasing }) => {
    socket.to(room).emit(DRAW_LINE, {
      prevPoint,
      currentPoint,
      color,
      width,
      isErasing
    });
    try {
      const stroke = new Stroke({
        roomId: room,
        prevPoint: prevPoint || currentPoint,
        currentPoint,
        color,
        width,
        isErasing
      });
      stroke.save().catch(err => console.error("Error saving stroke:", err));
    } catch (err) {
      console.error("Error preparing stroke save:", err);
    }
  });

  socket.on(CLEAR_BOARD, async (room) => {
    try {
      await Stroke.deleteMany({ roomId: room });
    } catch (err) {
      console.error("Error clearing board:", err);
    }
    socket.to(room).emit(CLEAR_BOARD);
  });
};