import mongoose from "mongoose";

const activitySessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chargerName: {
        type: String,
        required: true
    },
    chargerImage: {
        type: String,
        default: null
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // in minutes
        default: null
    },
    carModel: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    portType: {
        type: String,
        default: null
    },
    chargerId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
activitySessionSchema.index({ user: 1, startTime: -1 });

export default mongoose.model('ActivitySession', activitySessionSchema);
