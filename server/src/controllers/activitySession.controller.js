import ActivitySession from "../models/activitySession.model.js";
import User from "../models/user.model.js";
import Charger from "../models/charger.model.js";
import mongoose from "mongoose";
import { calculateRoute, convertDurationToMinutes, formatDuration, formatDistance } from "../utils/orsApi.js";

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
            
            // Lookup user details to get fullName
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails',
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                username: 1
                            }
                        }
                    ]
                }
            },
            
            // Unwind the userDetails array
            { $unwind: '$userDetails' },
            
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
                    evOwnerLocation: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    // Use stored duration or computed duration
                    duration: { $ifNull: ["$duration", "$computedDuration"] },
                    formattedStartTime: 1,
                    isActive: 1,
                    // Include user details
                    userDetails: 1
                }
            }
        ]);

        // Calculate ETA for active sessions where EV owner has provided location
        for (const session of sessions) {
            if (session.status === 'active' && session.evOwnerLocation && 
                session.evOwnerLocation.coordinates && 
                session.evOwnerLocation.coordinates[0] !== 0 && session.evOwnerLocation.coordinates[1] !== 0) {
                
                // Get charger location
                const charger = await Charger.findById(session.chargerId);
                if (charger && charger.location) {
                    const evOwnerLocation = {
                        lat: session.evOwnerLocation.coordinates[1],
                        lng: session.evOwnerLocation.coordinates[0]
                    };
                    const chargerLocation = {
                        lat: charger.location.coordinates[1],
                        lng: charger.location.coordinates[0]
                    };

                    // Calculate route using ORS API
                    const routeData = await calculateRoute(evOwnerLocation, chargerLocation);
                    
                    if (routeData) {
                        session.etaMinutes = convertDurationToMinutes(routeData.duration);
                        session.formattedDuration = formatDuration(routeData.duration);
                        session.formattedDistance = formatDistance(routeData.distance);
                        session.distance = routeData.distance;
                    }
                }
            }
        }

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

// Mark session as reached (when EV owner arrives at charger)
const markAsReached = async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log('markAsReached controller called with sessionId:', sessionId);
        console.log('User ID from token:', req.user.id);

        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        console.log('User found:', user._id);
        console.log('Looking for session with ID:', sessionId, 'for user:', user._id);

        const session = await ActivitySession.findOne({ _id: sessionId, user: user._id });
        if (!session) {
            console.log('Session not found for user');
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        console.log('Session found:', session._id, 'current status:', session.status);

        // Mark as reached and end the session
        session.reached = true;
        session.endTime = new Date();
        session.status = 'completed';
        
        // Calculate duration in minutes
        const startTime = new Date(session.startTime);
        const endTime = new Date(session.endTime);
        session.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60);
        
        await session.save();

        console.log('Session marked as reached and completed:', {
            sessionId: session._id,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
            status: session.status
        });

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        console.error('Error marking session as reached:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Calculate ETA from current location to charger
const calculateETA = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, error: 'Current location (lat, lng) is required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const session = await ActivitySession.findOne({ _id: sessionId, user: user._id });
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        // Get charger location
        const charger = await Charger.findById(session.chargerId);
        if (!charger || !charger.location) {
            return res.status(404).json({ success: false, error: 'Charger location not found' });
        }

        const chargerLocation = {
            lat: charger.location.coordinates[1],
            lng: charger.location.coordinates[0]
        };

        const currentLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };

        // Calculate route using ORS API
        const routeData = await calculateRoute(currentLocation, chargerLocation);

        if (!routeData) {
            return res.status(500).json({ success: false, error: 'Failed to calculate route' });
        }

        const etaMinutes = convertDurationToMinutes(routeData.duration);
        const formattedDuration = formatDuration(routeData.duration);
        const formattedDistance = formatDistance(routeData.distance);

        res.status(200).json({
            success: true,
            data: {
                etaMinutes,
                formattedDuration,
                formattedDistance,
                distance: routeData.distance,
                duration: routeData.duration
            }
        });
    } catch (error) {
        console.error('Error calculating ETA:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update EV owner's current location
const updateLocation = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, error: 'Location (lat, lng) is required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const session = await ActivitySession.findOne({ _id: sessionId, user: user._id });
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        // Update EV owner location (store as GeoJSON Point: [longitude, latitude])
        session.evOwnerLocation = {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
        };
        await session.save();

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export {
    createActivitySession,
    getUserActivitySessions,
    updateActivitySession,
    markAsReached,
    calculateETA,
    updateLocation
};
