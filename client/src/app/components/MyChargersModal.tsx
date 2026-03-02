import React, { useState, useEffect } from "react";
import { Zap, X, ChevronDown, Plug, Car } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import { fetchMyChargers, fetchChargerPorts } from "../../services/api";
import type { Station, ConnectorBackend } from "../../types";

interface MyChargersModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
}

export function MyChargersModal({
    isOpen,
    onClose,
    isDarkMode,
}: MyChargersModalProps) {
    const [chargers, setChargers] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedChargers, setExpandedChargers] = useState<Set<string>>(new Set());

    const getChargerIcon = (_chargerType: string) => {
        return <Zap className="w-3 h-3 text-yellow-500 inline mr-1" />;
    };

    const getConnectorIcon = (connectorType: string) => {
        switch (connectorType) {
            case 'Type 1':
                return <Plug className="w-4 h-4 text-blue-400" />;
            case 'Type 2':
                return <Plug className="w-4 h-4 text-green-400" />;
            case 'CCS1':
                return <Zap className="w-4 h-4 text-red-400" />;
            case 'CCS2':
                return <Zap className="w-4 h-4 text-blue-400" />;
            case 'CHAdeMO':
                return <Car className="w-4 h-4 text-yellow-400" />;
            case 'GB/T':
                return <Plug className="w-4 h-4 text-orange-400" />;
            case 'Tesla':
                return <Zap className="w-4 h-4 text-cyan-400" />;
            default:
                return <Zap className="w-4 h-4 text-gray-400" />;
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUserChargers();
        }
    }, [isOpen]);

    const toggleCharger = (chargerId: string) => {
        setExpandedChargers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chargerId)) {
                newSet.delete(chargerId);
            } else {
                newSet.add(chargerId);
            }
            return newSet;
        });
    };

    const fetchUserChargers = async () => {
        try {
            const data = await fetchMyChargers();

            // Fetch ports for each charger
            const chargersWithPorts = await Promise.all(
                data.map(async (charger: Station) => {
                    try {
                        const ports = await fetchChargerPorts(charger.id);
                        return { ...charger, connectors: ports };
                    } catch (portError) {
                        console.warn(`Failed to fetch ports for charger ${charger.id}:`, portError);
                        return { ...charger, connectors: [] };
                    }
                })
            );

            setChargers(chargersWithPorts);
        } catch (err) {
            console.error('Error fetching chargers:', err);
            setError('Failed to load chargers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const closeButtonClassName = `w-full py-2 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02] ${
        isDarkMode
            ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
            : "text-gray-600 hover:text-gray-700 hover:bg-gray-100"
    }`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm rounded-t-2xl border-t z-[10002] p-4 ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
                style={{
                    maxHeight: "80vh",
                }}
            >
                {/* Visually hidden accessibility elements */}
                <DialogTitle className="sr-only">My Chargers</DialogTitle>
                <DialogDescription className="sr-only">
                    View your listed chargers and their ports
                </DialogDescription>

                {/* Drag Handle */}
                <div className="flex justify-center py-3">
                    <div
                        className={`w-12 h-1 rounded-full ${
                            isDarkMode ? "bg-gray-600" : "bg-gray-300"
                        }`}
                    />
                </div>

                {/* Title */}
                <div className="px-3 pb-2">
                    <h2
                        className={`text-lg font-semibold text-center ${
                            isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                    >
                        My Chargers
                    </h2>
                </div>

                {/* Content */}
                <div className="px-3 pb-2 max-h-96 overflow-y-auto">
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
                                onClick={fetchUserChargers}
                                className={`mt-2 text-sm font-medium ${
                                    isDarkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"
                                }`}
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {chargers.length === 0 ? (
                                <div className="text-center py-8">
                                    <Zap className={`w-16 h-16 mx-auto mb-4 ${
                                        isDarkMode ? "text-gray-600" : "text-gray-400"
                                    }`} />
                                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                        No chargers listed yet
                                    </p>
                                    <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                                        Your listed charging stations will appear here
                                    </p>
                                </div>
                            ) : (
                                chargers.map((charger) => (
                                    <div
                                        key={charger.id}
                                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 hover:bg-gray-650"
                                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                        }`}
                                        onClick={() => toggleCharger(charger.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${
                                                    isDarkMode ? "bg-gray-600" : "bg-gray-200"
                                                }`}
                                            >
                                                <img
                                                    src={charger.image}
                                                    alt={charger.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3
                                                    className={`font-medium text-sm ${
                                                        isDarkMode ? "text-white" : "text-gray-900"
                                                    }`}
                                                >
                                                    {charger.name}
                                                </h3>
                                                <p
                                                    className={`text-xs mt-1 ${
                                                        isDarkMode ? "text-gray-400" : "text-gray-600"
                                                    }`}
                                                >
                                                    {charger.address}
                                                </p>
                                                <p
                                                    className={`text-xs mt-1 ${
                                                        isDarkMode ? "text-gray-400" : "text-gray-600"
                                                    }`}
                                                >
                                                    {getChargerIcon(charger.chargerType)} {charger.chargerType}
                                                </p>
                                            </div>
                                            <ChevronDown
                                                className={`w-5 h-5 transition-transform ${
                                                    expandedChargers.has(charger.id) ? 'rotate-180' : ''
                                                } ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                            />
                                        </div>
                                        {expandedChargers.has(charger.id) && (
                                            <div className={`mt-3 p-3 rounded-lg ${
                                                isDarkMode ? "bg-gray-600" : "bg-gray-100"
                                            }`}>
                                                {charger.connectors && charger.connectors.length > 0 ? (
                                                    <div>
                                                        <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                            Ports:
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {charger.connectors.map((port: ConnectorBackend) => (
                                                                <div
                                                                    key={port.id}
                                                                    className={`flex items-center p-3 rounded-lg ${
                                                                        isDarkMode ? "bg-gray-700" : "bg-white"
                                                                    }`}
                                                                >
                                                                    <div className="flex-shrink-0 mr-3 w-6 h-6 flex items-center justify-center">
                                                                        {getConnectorIcon(port.connector_type)}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between items-start">
                                                                            <h5 className={`text-sm font-medium ${
                                                                                isDarkMode ? "text-white" : "text-gray-900"
                                                                            }`}>
                                                                                Port {port.port_number}
                                                                            </h5>
                                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                                (port.status === 'available'
                                                                                    ? 'bg-green-100 text-green-800'
                                                                                    : port.status === 'occupied'
                                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                                    : 'bg-red-100 text-red-800')
                                                                            }`}>
                                                                                {port.status}
                                                                            </span>
                                                                        </div>
                                                                        <p className={`text-xs mt-1 ${
                                                                            isDarkMode ? "text-gray-300" : "text-gray-600"
                                                                        }`}>
                                                                            {port.connector_type} • {port.max_power_kw}kW
                                                                        </p>
                                                                        <p className={`text-xs mt-1 ${
                                                                            isDarkMode ? "text-gray-300" : "text-gray-600"
                                                                        }`}>
                                                                            ₹{port.price_per_kwh}/kWh
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                    No ports configured
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className={closeButtonClassName}
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
