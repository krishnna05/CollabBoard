const mongoose = require('mongoose');

const StrokeSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true
    },
    prevPoint: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    currentPoint: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    color: {
        type: String,
        required: true
    },
    width: {
        type: Number,
        required: true
    },
    isErasing: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Stroke', StrokeSchema);
