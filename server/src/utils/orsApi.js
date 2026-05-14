/**
 * OpenRouteService (ORS) API utility for calculating ETA and distance
 * between two points
 */

const ORS_API_KEY = process.env.ORS_API_KEY;
const ORS_BASE_URL = 'https://api.openrouteservice.org';

/**
 * Calculate ETA and distance between origin and destination using ORS API
 * @param {Object} origin - { lat, lng } starting point
 * @param {Object} destination - { lat, lng } ending point
 * @param {String} profile - Transport profile (driving-car, cycling-regular, foot-walking, etc.)
 * @returns {Promise<Object>} - { duration (seconds), distance (meters) }
 */
export const calculateRoute = async (origin, destination, profile = 'driving-car') => {
    try {
        if (!ORS_API_KEY) {
            console.warn('ORS_API_KEY not found in environment variables');
            return null;
        }

        const url = `${ORS_BASE_URL}/v2/directions/${profile}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': ORS_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
            },
            body: JSON.stringify({
                coordinates: [
                    [origin.lng, origin.lat], // ORS expects [longitude, latitude]
                    [destination.lng, destination.lat]
                ],
                format: 'json'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ORS API Error:', response.status, errorText);
            return null;
        }

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            return {
                duration: route.summary.duration, // in seconds
                distance: route.summary.distance  // in meters
            };
        }

        return null;
    } catch (error) {
        console.error('Error calculating route with ORS:', error);
        return null;
    }
};

/**
 * Calculate ETA in minutes from duration in seconds
 * @param {Number} durationSeconds - Duration in seconds
 * @returns {Number} - Duration in minutes (rounded)
 */
export const convertDurationToMinutes = (durationSeconds) => {
    if (!durationSeconds) return null;
    return Math.round(durationSeconds / 60);
};

/**
 * Calculate ETA in human-readable format
 * @param {Number} durationSeconds - Duration in seconds
 * @returns {String} - Human-readable duration (e.g., "5 minutes", "1 hour 30 minutes")
 */
export const formatDuration = (durationSeconds) => {
    if (!durationSeconds) return 'Unknown';
    
    const minutes = Math.round(durationSeconds / 60);
    
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

/**
 * Calculate distance in human-readable format
 * @param {Number} distanceMeters - Distance in meters
 * @returns {String} - Human-readable distance (e.g., "500 m", "2.5 km")
 */
export const formatDistance = (distanceMeters) => {
    if (!distanceMeters) return 'Unknown';
    
    if (distanceMeters < 1000) {
        return `${Math.round(distanceMeters)} m`;
    }
    
    const km = (distanceMeters / 1000).toFixed(1);
    return `${km} km`;
};
