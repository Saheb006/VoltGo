// ============================================================================
// STATION CARD COMPONENT
// ============================================================================
// Displays individual charging station information:
// - Station image with availability badge
// - Name, address, and location details
// - Distance, time, and charger type
// - Pricing and parking information
// - Dark mode support
// ============================================================================

import { MapPin, Clock, Zap } from "lucide-react";

interface StationCardProps {
    name: string;
    available: boolean;
    address?: string;
    distance?: string;
    time?: string;
    chargerType?: string;
    price?: string;
    parking?: string;
    image?: string;
    isDarkMode?: boolean;
}

export function StationCard({
    name,
    available,
    address = "Location not specified",
    distance = "N/A",
    time = "N/A",
    chargerType = "Type not specified",
    price = "N/A",
    parking = "N/A",
    image = "https://via.placeholder.com/96",
    isDarkMode = false,
}: StationCardProps) {
    return (
        <div
            className={`flex gap-4 p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                isDarkMode
                    ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:shadow-lg hover:border-gray-300"
            }`}
        >
            <div className="relative w-24 h-24 flex-shrink-0">
                <img src={image} alt={name} className="w-full h-full object-cover rounded-lg" />
                {available && (
                    <div
                        className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium shadow-sm ${
                            isDarkMode ? "bg-green-500 text-white" : "bg-green-500 text-white"
                        }`}
                    >
                        Available
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3
                    className={`font-semibold mb-1.5 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                    {name}
                </h3>

                <div
                    className={`flex items-start gap-1.5 text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="truncate leading-tight">{address}</span>
                </div>

                <div
                    className={`flex items-center gap-4 text-xs mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                            {distance} • {time}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-yellow-500" />
                        <span>{chargerType}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                    <span
                        className={`font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                    >
                        {price}
                    </span>
                    <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                        {parking}
                    </span>
                </div>
            </div>
        </div>
    );
}
