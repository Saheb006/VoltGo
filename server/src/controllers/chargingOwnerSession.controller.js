import ActivitySession from "../models/activitySession.model.js";
import User from "../models/user.model.js";
import Charger from "../models/charger.model.js";
import mongoose from "mongoose";
import { calculateRoute, convertDurationToMinutes, formatDuration, formatDistance } from "../utils/orsApi.js";

// Get charging owner's sessions for their chargers
const getChargingOwnerSessions = async (req, res) => {
    try {
        // Verify user is a charger owner
        if (req.user.role !== "charger_owner") {
            return res.status(403).json({ success: false, error: 'Only charger owners can view charging sessions' });
        }

        // Get all chargers owned by this user
        const chargers = await Charger.find({ owner_id: req.user._id });
        const chargerIds = chargers.map(c => c._id.toString());

        console.log('🔍 Charging Owner Sessions Debug:');
        console.log('User ID:', req.user._id);
        console.log('User Role:', req.user.role);
        console.log('Found chargers:', chargers.length);
        console.log('Charger IDs:', chargerIds);

        if (chargerIds.length === 0) {
            return res.status(200).json({ 
                success: true, 
                data: { currentSessions: [], pastSessions: [] } 
            });
        }

        // Get all activity sessions for these chargers
        const sessions = await ActivitySession.aggregate([
            // Match sessions for the charger's chargers
            { $match: { chargerId: { $in: chargerIds } } },
            
            // Sort by startTime descending (most recent first)
            { $sort: { startTime: -1 } },
            
            // Limit to last 100 sessions
            { $limit: 100 },
            
            // Lookup user information (EV owner)
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            
            // Unwind the userDetails array
            { $unwind: '$userDetails' },
            
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
                    // Check if session is currently active and not reached (coming)
                    isComing: {
                        $cond: {
                            if: { $and: [{ $eq: ["$status", "active"] }, { $eq: ["$reached", false] }] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            
            // Project final shape
            {
                $project: {
                    _id: 1,
                    chargerName: 1,
                    chargerImage: 1,
                    chargerId: 1,
                    carModel: 1,
                    portType: 1,
                    startTime: 1,
                    endTime: 1,
                    status: 1,
                    reached: 1,
                    evOwnerLocation: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    duration: { $ifNull: ["$duration", "$computedDuration"] },
                    formattedStartTime: 1,
                    isComing: 1,
                    // Include user details
                    user: {
                        _id: '$userDetails._id',
                        username: '$userDetails.username',
                        fullName: '$userDetails.fullName',
                        email: '$userDetails.email',
                        avatar: '$userDetails.avatar'
                    }
                }
            }
        ]);

        console.log('🔍 Found sessions:', sessions.length);
        console.log('🔍 Sessions sample:', sessions.slice(0, 2));

        // Separate into current sessions (coming) and past sessions
        const currentSessions = sessions.filter(session => session.isComing);
        const pastSessions = sessions.filter(session => !session.isComing);

        console.log('🔍 Current sessions:', currentSessions.length);
        console.log('🔍 Past sessions:', pastSessions.length);

        // Calculate ETA for current sessions (where EV owner has provided location)
        for (const session of currentSessions) {
            if (session.evOwnerLocation && session.evOwnerLocation.coordinates && 
                session.evOwnerLocation.coordinates[0] !== 0 && session.evOwnerLocation.coordinates[1] !== 0) {
                
                // Get charger location
                const charger = chargers.find(c => c._id.toString() === session.chargerId);
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
                        session.duration = routeData.duration;
                    }
                }
            }
        }

        res.status(200).json({ 
            success: true, 
            data: { 
                currentSessions, 
                pastSessions 
            } 
        });
    } catch (error) {
        console.error('Error fetching charging owner sessions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get sessions for a specific charger
const getChargerSessions = async (req, res) => {
    try {
        const { chargerId } = req.params;

        // Verify user is a charger owner
        if (req.user.role !== "charger_owner") {
            return res.status(403).json({ success: false, error: 'Only charger owners can view charging sessions' });
        }

        // Verify the charger belongs to this user
        const charger = await Charger.findOne({ _id: chargerId, owner_id: req.user._id });
        if (!charger) {
            return res.status(404).json({ success: false, error: 'Charger not found or not owned by you' });
        }

        // Get all activity sessions for this specific charger
        const sessions = await ActivitySession.aggregate([
            // Match sessions for this charger
            { $match: { chargerId: chargerId } },
            
            // Sort by startTime descending (most recent first)
            { $sort: { startTime: -1 } },
            
            // Limit to last 100 sessions
            { $limit: 100 },
            
            // Lookup user information (EV owner)
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            
            // Unwind the userDetails array
            { $unwind: '$userDetails' },
            
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
                    // Check if session is currently active and not reached (coming)
                    isComing: {
                        $cond: {
                            if: { $and: [{ $eq: ["$status", "active"] }, { $eq: ["$reached", false] }] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            
            // Project final shape
            {
                $project: {
                    _id: 1,
                    chargerName: 1,
                    chargerImage: 1,
                    chargerId: 1,
                    carModel: 1,
                    portType: 1,
                    startTime: 1,
                    endTime: 1,
                    status: 1,
                    reached: 1,
                    evOwnerLocation: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    duration: { $ifNull: ["$duration", "$computedDuration"] },
                    formattedStartTime: 1,
                    isComing: 1,
                    // Include user details
                    user: {
                        _id: '$userDetails._id',
                        username: '$userDetails.username',
                        fullName: '$userDetails.fullName',
                        email: '$userDetails.email',
                        avatar: '$userDetails.avatar'
                    }
                }
            }
        ]);

        // Separate into current sessions (coming) and past sessions
        const currentSessions = sessions.filter(session => session.isComing);
        const pastSessions = sessions.filter(session => !session.isComing);

        // Calculate ETA for current sessions (where EV owner has provided location)
        for (const session of currentSessions) {
            if (session.evOwnerLocation && session.evOwnerLocation.coordinates && 
                session.evOwnerLocation.coordinates[0] !== 0 && session.evOwnerLocation.coordinates[1] !== 0) {
                
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
                    session.duration = routeData.duration;
                }
            }
        }

        res.status(200).json({ 
            success: true, 
            data: { 
                currentSessions, 
                pastSessions 
            } 
        });
    } catch (error) {
        console.error('Error fetching charger sessions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Mark a session as completed
const markSessionAsCompleted = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Verify user is a charger owner
        if (req.user.role !== "charger_owner") {
            return res.status(403).json({ success: false, error: 'Only charger owners can mark sessions as completed' });
        }

        // Find the session
        const session = await ActivitySession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        // Verify the session belongs to this charger owner
        const charger = await Charger.findOne({ _id: session.chargerId, owner_id: req.user._id });
        if (!charger) {
            return res.status(403).json({ success: false, error: 'Session does not belong to your charger' });
        }

        // Update session status to completed and set end time
        session.status = 'completed';
        session.endTime = new Date();
        session.reached = true;
        await session.save();

        res.status(200).json({ 
            success: true, 
            message: 'Session marked as completed successfully',
            data: session
        });
    } catch (error) {
        console.error('Error marking session as completed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export {
    getChargingOwnerSessions,
    getChargerSessions,
    markSessionAsCompleted
};
