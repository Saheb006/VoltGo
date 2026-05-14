import React, { useState, useEffect } from "react";
import { Clock, MapPin, Car, Zap, Calendar, Plug } from "lucide-react";
import { fetchChargingOwnerSessions, markSessionAsCompleted } from "../../services/api";

interface ChargerOwnerSession {
    _id: string;
    chargerName: string;
    chargerImage?: string;
    chargerId: string;
    carModel: string;
    portType?: string;
    startTime: string;
    endTime: string | null;
    status: string;
    reached: boolean;
    evOwnerLocation?: {
        type: string;
        coordinates: number[];
    };
    duration?: number | null;
    formattedStartTime?: string;
    isComing?: boolean;
    etaMinutes?: number;
    formattedDuration?: string;
    formattedDistance?: string;
    distance?: number;
    user: {
        _id: string;
        username: string;
        fullName: string;
        email: string;
        avatar: string;
    };
}

interface ChargerOwnerSessionHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
}

export function ChargerOwnerSessionHistory({
    isOpen,
    onClose,
    isDarkMode,
}: ChargerOwnerSessionHistoryProps) {
    const [currentSessions, setCurrentSessions] = useState<ChargerOwnerSession[]>([]);
    const [pastSessions, setPastSessions] = useState<ChargerOwnerSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
    const [completingSession, setCompletingSession] = useState<string | null>(null);

    const getPortIcon = (portType: string) => {
        const iconMap: Record<string, React.ReactElement> = {
            'Type 1': <Plug className="w-4 h-4" style={{color: '#f97316'}} />,
            'Type 2': <Plug className="w-4 h-4" style={{color: '#16a34a'}} />,
            'CCS1': <Zap className="w-4 h-4" style={{color: '#2563eb'}} />,
            'CCS2': <Zap className="w-4 h-4" style={{color: '#2563eb'}} />,
            'GB/T': <Zap className="w-4 h-4" style={{color: '#dc2626'}} />,
            'CHAdeMO': <Plug className="w-4 h-4" style={{color: '#9333ea'}} />,
            'Tesla': <Car className="w-4 h-4" style={{color: '#ea580c'}} />,
            'default': <Plug className="w-4 h-4" style={{color: '#4b5563'}} />
        };
        return iconMap[portType] || iconMap.default;
    };

    const formatCarName = (carValue: string) => {
        if (carValue && carValue.includes('-')) {
            const [company, ...modelParts] = carValue.split('-');
            const model = modelParts.join(' ').replace(/\b\w/g, l => l.toUpperCase());
            const companyFormatted = company.charAt(0).toUpperCase() + company.slice(1);
            return `${companyFormatted} ${model}`;
        }
        return carValue || 'Unknown Car';
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return 'Still active...';
        
        if (minutes < 60) {
            return `${minutes} minutes`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        if (isOpen) {
            fetchSessions();
        }
    }, [isOpen]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await fetchChargingOwnerSessions();
            setCurrentSessions(data.currentSessions || []);
            setPastSessions(data.pastSessions || []);
        } catch (err) {
            console.error('Error fetching charger owner sessions:', err);
            setError('Failed to load sessions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsCompleted = async (sessionId: string) => {
        try {
            setCompletingSession(sessionId);
            await markSessionAsCompleted(sessionId);
            
            // Refresh sessions after marking as completed
            await fetchSessions();
        } catch (err) {
            console.error('Error marking session as completed:', err);
            setError('Failed to mark session as completed. Please try again.');
        } finally {
            setCompletingSession(null);
        }
    };

    const renderSessionCard = (session: ChargerOwnerSession) => (
        <div
            key={session._id}
            className={`rounded-lg p-4 border transition-all duration-200 hover:shadow-md ${
                isDarkMode 
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        >
            {/* Car Owner Name - replacing charger image */}
            {session.user && (
                <div className="mb-3">
                    <div className={`text-center p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                        <p className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Car Owner
                        </p>
                        <p className={`text-lg font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            {session.user.fullName}
                        </p>
                    </div>
                </div>
            )}
            
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        {session.chargerName}
                    </h3>
                    <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        {formatTime(session.startTime)}
                    </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.isComing
                        ? isDarkMode 
                            ? 'bg-blue-900/50 text-blue-400' 
                            : 'bg-blue-100 text-blue-800'
                        : isDarkMode 
                            ? 'bg-green-900/50 text-green-400' 
                            : 'bg-green-100 text-green-800'
                }`}>
                    {session.isComing ? 'Coming' : 'Completed'}
                </span>
            </div>
            
            <div className="space-y-2">
                {/* Port Type with Icon */}
                {session.portType && (
                    <div className="flex items-center gap-3">
                        {getPortIcon(session.portType)}
                        <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Port: {session.portType}
                        </span>
                    </div>
                )}
                
                <div className="flex items-center gap-3">
                    <Car className="w-4 h-4 text-gray-500" />
                    <span className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                        {formatCarName(session.carModel)}
                    </span>
                </div>
                
                {/* ETA for current sessions */}
                {session.isComing && session.formattedDuration && (
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                            ETA: {session.formattedDuration}
                        </span>
                    </div>
                )}
                
                {/* Duration for past sessions */}
                {!session.isComing && session.duration && (
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Duration: {formatDuration(session.duration)}
                        </span>
                    </div>
                )}
                
                {/* Distance for current sessions */}
                {session.isComing && session.formattedDistance && (
                    <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Distance: {session.formattedDistance}
                        </span>
                    </div>
                )}
                
                {/* Mark as Completed Button - Only for current sessions */}
                {session.isComing && (
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => handleMarkAsCompleted(session._id)}
                            disabled={completingSession === session._id}
                            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                                completingSession === session._id
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : isDarkMode
                                        ? 'bg-green-600 hover:bg-green-500 text-white'
                                        : 'bg-green-500 hover:bg-green-400 text-white'
                            }`}
                        >
                            {completingSession === session._id ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Marking as Completed...
                                </span>
                            ) : (
                                'Mark as Completed'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4">
                <div className="text-center">
                    <h2 className={`text-lg font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                        Session History
                    </h2>
                    <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        {activeTab === 'current' ? 'See what cars are coming' : 'See how many cars already came'}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 px-6 pb-4">
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'current'
                                ? isDarkMode 
                                    ? 'bg-gray-600 text-white' 
                                    : 'bg-white text-gray-900 shadow-sm'
                                : isDarkMode 
                                    ? 'text-gray-400 hover:text-white' 
                                    : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Current ({currentSessions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'past'
                                ? isDarkMode 
                                    ? 'bg-gray-600 text-white' 
                                    : 'bg-white text-gray-900 shadow-sm'
                                : isDarkMode 
                                    ? 'text-gray-400 hover:text-white' 
                                    : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Past ({pastSessions.length})
                    </button>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                            isDarkMode ? "border-white" : "border-gray-900"
                        }`} />
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                            {error}
                        </p>
                        <button
                            onClick={fetchSessions}
                            className={`mt-2 text-sm font-medium ${
                                isDarkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"
                            }`}
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(activeTab === 'current' ? currentSessions : pastSessions).length === 0 ? (
                            <div className="text-center py-12 rounded-lg border">
                                <Calendar className={`w-12 h-12 mx-auto mb-4 ${
                                    isDarkMode ? "text-gray-600" : "text-gray-400"
                                }`} />
                                <p className={`text-sm ${
                                    isDarkMode ? "text-gray-400" : "text-gray-600"
                                }`}>
                                    {activeTab === 'current' ? 'No current sessions' : 'No past sessions'}
                                </p>
                                <p className={`text-xs mt-2 ${
                                    isDarkMode ? "text-gray-500" : "text-gray-500"
                                }`}>
                                    {activeTab === 'current' 
                                        ? 'Active charging sessions will appear here' 
                                        : 'Completed charging sessions will appear here'}
                                </p>
                            </div>
                        ) : (
                            (activeTab === 'current' ? currentSessions : pastSessions).map(renderSessionCard)
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
