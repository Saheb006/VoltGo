import React, { useState } from "react";
import { Clock, MapPin, Car, Zap, Calendar, Plug } from "lucide-react";

interface ActivitySession {
    id: string;
    chargerName: string;
    chargerImage?: string;
    startTime: string;
    endTime: string | null;
    duration: number | null; // in minutes
    carModel: string;
    status: 'active' | 'completed';
    portType?: string;
    // ETA fields from backend
    etaMinutes?: number;
    formattedDuration?: string;
    formattedDistance?: string;
    distance?: number;
}

interface ActivityPageProps {
    isDarkMode: boolean;
    sessions: ActivitySession[];
    currentSession: ActivitySession | null;
}

export function ActivityPage({ 
    isDarkMode, 
    sessions, 
    currentSession 
}: ActivityPageProps) {
    // Car owners only see past sessions
    const pastSessions = currentSession 
        ? [currentSession, ...sessions.filter(session => session.status === 'completed')]
        : sessions.filter(session => session.status === 'completed');

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

    
    const renderSessionCard = (session: ActivitySession) => (
        <div
            key={session.id}
            className={`rounded-lg p-4 border transition-all duration-200 hover:shadow-md ${
                isDarkMode 
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        >
            {/* Charger Image */}
            {session.chargerImage && (
                <div className="mb-3">
                    <img 
                        src={session.chargerImage} 
                        alt={session.chargerName}
                        className="w-full h-32 object-cover rounded-lg"
                    />
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
                    session.status === 'completed'
                        ? isDarkMode 
                            ? 'bg-green-900/50 text-green-400' 
                            : 'bg-green-100 text-green-800'
                        : isDarkMode 
                            ? 'bg-blue-900/50 text-blue-400' 
                            : 'bg-blue-100 text-blue-800'
                }`}>
                    {session.status === 'completed' ? 'Completed' : 'Active'}
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
                {session.status === 'active' && session.formattedDuration && (
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
                {session.status === 'completed' && session.duration && (
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
                {session.status === 'active' && session.formattedDistance && (
                    <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Distance: {session.formattedDistance}
                        </span>
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
                    <h1 className={`text-2xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        Session History
                    </h1>
                    <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        Track your charging sessions
                    </p>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                <div className="space-y-4">
                    {pastSessions.length === 0 ? (
                        <div className="text-center py-12 rounded-lg border">
                            <Calendar className={`w-12 h-12 mx-auto mb-4 ${
                                isDarkMode ? "text-gray-600" : "text-gray-400"
                            }`} />
                            <p className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                                No past sessions
                            </p>
                            <p className={`text-xs mt-2 ${
                                isDarkMode ? "text-gray-500" : "text-gray-500"
                            }`}>
                                Completed charging sessions will appear here
                            </p>
                        </div>
                    ) : (
                        pastSessions.map(renderSessionCard)
                    )}
                </div>
            </div>
        </div>
    );
}
