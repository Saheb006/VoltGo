import ActivitySession from "../models/activitySession.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// Create or update activity session
const createActivitySession = async (req, res) => {
    try {
        const { chargerName, chargerImage, carModel, portType, chargerId, status } = req.body;
        
        // Get user from token
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Always create a new session when booking a charger
        const session = new ActivitySession({
            user: user._id,
            chargerName,
            chargerImage,
            startTime: new Date(),
            carModel,
            portType,
            chargerId,
            status: status || 'active'
        });
        await session.save();

        res.status(201).json({ success: true, data: session });
    } catch (error) {
        console.error('Error creating activity session:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get user's activity sessions using aggregation pipeline
const getUserActivitySessions = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const sessions = await ActivitySession.aggregate([
            // Match sessions for the current user
            { $match: { user: userId } },
            
            // Sort by startTime descending (most recent first)
            { $sort: { startTime: -1 } },
            
            // Limit to last 50 sessions
            { $limit: 50 },
            
            // Add computed fields
            {
                $addFields: {
                    // Calculate actual duration if not set but both times exist
                    computedDuration: {
                        $cond: {
                            if: { $and: ["$endTime", "$startTime"] },
                            then: {
                                $round: [
                                    { $divide: [{ $subtract: ["$endTime", "$startTime"] }, 60000] },
                                    0
                                ]
                            },
                            else: null
                        }
                    },
                    // Format date for display
                    formattedStartTime: {
                        $dateToString: { format: "%Y-%m-%d %H:%M", date: "$startTime" }
                    },
                    // Check if session is currently active
                    isActive: {
                        $cond: {
                            if: { $eq: ["$status", "active"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            
            // Project final shape - merge computed duration with stored duration
            {
                $project: {
                    _id: 1,
                    user: 1,
                    chargerName: 1,
                    chargerImage: 1,
                    chargerId: 1,
                    carModel: 1,
                    portType: 1,
                    startTime: 1,
                    endTime: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    // Use stored duration or computed duration
                    duration: { $ifNull: ["$duration", "$computedDuration"] },
                    formattedStartTime: 1,
                    isActive: 1
                }
            }
        ]);

        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error fetching activity sessions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update activity session (for ending session)
const updateActivitySession = async (req, res) => {
    try {
        // FIX: Get sessionId from URL params, not body
        const { sessionId } = req.params;
        const { endTime, duration, status } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const session = await ActivitySession.findOne({ _id: sessionId, user: user._id });
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        if (endTime) session.endTime = new Date(endTime);
        if (duration) session.duration = duration;
        if (status) session.status = status;
        
        await session.save();

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        console.error('Error updating activity session:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export {
    createActivitySession,
    getUserActivitySessions,
    updateActivitySession
};
