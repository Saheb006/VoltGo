import React, { useState, useEffect } from "react";
import { Zap, X, Plug, Car, MoreVertical } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import { fetchMyChargers, fetchChargerPorts, createCharger, reverseGeocode, updatePortStatus, deleteCharger, deleteChargerPort } from "../../services/api";
import type { Station, ConnectorBackend } from "../../types";
import { AddChargerForm } from "./AddChargerForm";
import { AddPortForm } from "./AddPortForm";

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
    const [showAddForm, setShowAddForm] = useState(false);
    const [initialLocation, setInitialLocation] = useState<{ lat: string; lng: string; address: string } | undefined>(undefined);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [showAddPortForm, setShowAddPortForm] = useState(false);
    const [selectedChargerId, setSelectedChargerId] = useState<string>("");
    const [selectedChargerName, setSelectedChargerName] = useState<string>("");
    const [editingPortId, setEditingPortId] = useState<string | null>(null);
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [chargerToDelete, setChargerToDelete] = useState<Station | null>(null);
    const [showDeletionResult, setShowDeletionResult] = useState(false);
    const [deletionSuccess, setDeletionSuccess] = useState(false);
    const [deletionMessage, setDeletionMessage] = useState("");
    const [menuOpenForPort, setMenuOpenForPort] = useState<string | null>(null);

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

    const handleAddChargerClick = () => {
        setShowAddForm(true);
        setIsGettingLocation(true);
        onClose(); // Close the modal
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    try {
                        const address = await reverseGeocode(lat, lng);
                        setInitialLocation({ lat: lat.toString(), lng: lng.toString(), address });
                    } catch (geocodeError) {
                        console.error("Error reverse geocoding:", geocodeError);
                        setInitialLocation({ lat: lat.toString(), lng: lng.toString(), address: "" });
                    }
                    setIsGettingLocation(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsGettingLocation(false);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            setIsGettingLocation(false);
        }
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

    const handleAddChargerSubmit = async (chargerData: {
        name: string;
        address: string;
        address_details?: string;
        latitude: number;
        longitude: number;
        charger_type: "AC" | "DC";
        status?: "active" | "inactive" | "maintenance";
        image: File;
    }) => {
        await createCharger(chargerData);
        // Refresh the chargers list after successful creation
        await fetchUserChargers();
    };

    const closeButtonClassName = `w-full py-2 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02] ${
        isDarkMode
            ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
            : "text-gray-600 hover:text-gray-700 hover:bg-gray-100"
    }`;

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

    const handleAddPort = (chargerId: string) => {
        const charger = chargers.find(c => c.id === chargerId);
        setSelectedChargerId(chargerId);
        setSelectedChargerName(charger?.name || "Unknown Charger");
        setShowAddPortForm(true);
        onClose(); // Close the modal
    };

    const handleDeleteCharger = (chargerId: string) => {
        const charger = chargers.find(c => c.id === chargerId);
        setChargerToDelete(charger || null);
        setShowDeleteConfirmation(true);
    };

    const handleDeletePort = async (chargerId: string, portId: string) => {
        try {
            await deleteChargerPort(chargerId, portId);
            fetchUserChargers(); // Refresh list
        } catch (error) {
            console.error("Failed to delete port:", error);
        }
    };

    const handleUpdatePort = (chargerId: string, portId: string) => {
        console.log("Update port:", chargerId, portId);
        // TODO: Implement update port functionality
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent
                    className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm rounded-t-2xl border-t z-[10000] p-4 ${
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
                        <div className="flex items-center justify-between">
                            <h2
                                className={`text-lg font-semibold ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                            >
                                My Chargers
                            </h2>
                            <button
                                onClick={handleAddChargerClick}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                                    isDarkMode
                                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                        : "bg-emerald-500 hover:bg-emerald-400 text-white"
                                }`}
                            >
                                + Add Charger
                            </button>
                        </div>
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
                                            className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                                                isDarkMode
                                                    ? "bg-gray-700 border-gray-600 hover:bg-gray-650"
                                                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                            }`}
                                            onClick={() => toggleCharger(charger.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${
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
                                                        className={`font-medium text-base ${
                                                            isDarkMode ? "text-white" : "text-gray-900"
                                                        }`}
                                                    >
                                                        {charger.name}
                                                    </h3>
                                                    <p
                                                        className={`text-sm mt-1 ${
                                                            isDarkMode ? "text-gray-400" : "text-gray-600"
                                                        }`}
                                                    >
                                                        {charger.address}
                                                    </p>
                                                    <p
                                                        className={`text-sm mt-1 ${
                                                            isDarkMode ? "text-gray-400" : "text-gray-600"
                                                        }`}
                                                    >
                                                        {getChargerIcon(charger.chargerType)} {charger.chargerType}
                                                    </p>
                                                </div>
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMenuOpenFor(menuOpenFor === charger.id ? null : charger.id);
                                                        }}
                                                        className={`p-1 rounded transition-colors ${
                                                            isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                                                        }`}
                                                    >
                                                        <MoreVertical className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                                                    </button>
                                                    {menuOpenFor === charger.id && (
                                                        <div className={`absolute right-0 top-full mt-1 w-32 rounded-lg shadow-lg border z-[10005] ${
                                                            isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                                                        }`}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAddPort(charger.id);
                                                                    setMenuOpenFor(null);
                                                                }}
                                                                className={`block w-full text-left px-3 py-2 text-sm rounded-t-lg transition-colors ${
                                                                    isDarkMode ? "text-white hover:bg-gray-600" : "text-gray-900 hover:bg-gray-100"
                                                                }`}
                                                            >
                                                                Add Port
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteCharger(charger.id);
                                                                    setMenuOpenFor(null);
                                                                }}
                                                                className={`block w-full text-left px-3 py-2 text-sm rounded-b-lg transition-colors ${
                                                                    isDarkMode ? "text-white hover:bg-gray-600" : "text-red-400 hover:bg-gray-600"
                                                                }`}
                                                            >
                                                                Delete Charger
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {expandedChargers.has(charger.id) && (
                                                <div className={`mt-3 p-3 rounded-lg ${
                                                    isDarkMode ? "bg-gray-600" : "bg-gray-100"
                                                }`}>
                                                    {charger.connectors && charger.connectors.length > 0 ? (
                                                        <div>
                                                            <h4 className={`text-base font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                                Ports:
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {charger.connectors.map((port: ConnectorBackend) => (
                                                                    <div
                                                                        key={port.id}
                                                                        className={`relative flex items-center p-3 rounded-lg ${
                                                                            isDarkMode ? "bg-gray-700" : "bg-white"
                                                                        }`}
                                                                    >
                                                                        <div className="flex-shrink-0 mr-3 w-6 h-6 flex items-center justify-center">
                                                                            {getConnectorIcon(port.connector_type)}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex justify-between items-start relative">
                                                                                <h5 className={`text-base font-medium ${
                                                                                    isDarkMode ? "text-white" : "text-gray-900"
                                                                                }`}>
                                                                                    Port {port.port_number}
                                                                                </h5>
                                                                                {editingPortId === port.id ? (
                                                                                    <div className="absolute top-full right-0 flex flex-col gap-1 bg-white dark:bg-gray-700 p-1 rounded shadow border z-[10005]">
                                                                                        {['available', 'occupied', 'faulty', 'unavailable'].map(status => (
                                                                                            <span
                                                                                                key={status}
                                                                                                onClick={async (e) => {
                                                                                                    e.stopPropagation();
                                                                                                    try {
                                                                                                        await updatePortStatus(charger.id, port.id, status);
                                                                                                        await fetchUserChargers();
                                                                                                        setEditingPortId(null);
                                                                                                    } catch (error) {
                                                                                                        console.error("Failed to update port status:", error);
                                                                                                        setEditingPortId(null);
                                                                                                    }
                                                                                                }}
                                                                                                className="cursor-pointer px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                                                                            >
                                                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <span
                                                                                        className={`px-2 py-1 text-sm font-medium rounded-full cursor-pointer ${
                                                                                            (port.status === 'available'
                                                                                                ? 'bg-green-100 text-green-800'
                                                                                                : port.status === 'occupied'
                                                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                                                : 'bg-red-100 text-red-800')
                                                                                        }`}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setEditingPortId(editingPortId === port.id ? null : port.id);
                                                                                        }}
                                                                                    >
                                                                                        {port.status}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <p className={`text-sm mt-1 ${
                                                                                isDarkMode ? "text-gray-300" : "text-gray-600"
                                                                            }`}>
                                                                                {port.connector_type} • {port.max_power_kw}kW
                                                                            </p>
                                                                            <p className={`text-sm mt-1 ${
                                                                                isDarkMode ? "text-gray-300" : "text-gray-600"
                                                                            }`}>
                                                                                ₹{port.price_per_kwh}/kWh
                                                                            </p>
                                                                        </div>
                                                                        <div className="absolute bottom-2 right-2">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setMenuOpenForPort(menuOpenForPort === port.id ? null : port.id);
                                                                                }}
                                                                                className={`p-1 rounded transition-colors ${
                                                                                    isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                                                                                }`}
                                                                            >
                                                                                <MoreVertical className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                                                                            </button>
                                                                            {menuOpenForPort === port.id && (
                                                                                <div className={`absolute right-0 top-full mt-1 w-32 rounded-lg shadow-lg border z-[10005] ${
                                                                                    isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                                                                                }`}>
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleUpdatePort(charger.id, port.id);
                                                                                            setMenuOpenForPort(null);
                                                                                        }}
                                                                                        className={`block w-full text-left px-3 py-2 text-sm rounded-t-lg transition-colors ${
                                                                                            isDarkMode ? "text-white hover:bg-gray-600" : "text-gray-900 hover:bg-gray-100"
                                                                                        }`}
                                                                                    >
                                                                                        Update Port
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleDeletePort(charger.id, port.id);
                                                                                            setMenuOpenForPort(null);
                                                                                        }}
                                                                                        className={`block w-full text-left px-3 py-2 text-sm rounded-b-lg transition-colors ${
                                                                                            isDarkMode ? "text-white hover:bg-gray-600" : "text-red-400 hover:bg-gray-600"
                                                                                        }`}
                                                                                    >
                                                                                        Delete Port
                                                                                    </button>
                                                                                </div>
                                                                            )}
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

            {/* Add Charger Form */}
            {showAddForm && (
                <AddChargerForm
                    isDarkMode={isDarkMode}
                    onClose={() => setShowAddForm(false)}
                    onSubmit={handleAddChargerSubmit}
                    initialLocation={initialLocation}
                    isLocationLoading={isGettingLocation}
                />
            )}

            {/* Add Port Form */}
            {showAddPortForm && (
                <AddPortForm
                    chargerId={selectedChargerId}
                    chargerName={selectedChargerName}
                    isDarkMode={isDarkMode}
                    onClose={() => setShowAddPortForm(false)}
                    onSubmit={() => { fetchUserChargers(); setShowAddPortForm(false); }}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
                <DialogContent className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-sm z-[10010] rounded-lg border shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <DialogTitle className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Delete Charger {chargerToDelete?.name}?
                    </DialogTitle>
                    <DialogDescription className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Are you sure you want to delete "{chargerToDelete?.name}"? This action cannot be undone.
                    </DialogDescription>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => setShowDeleteConfirmation(false)}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                isDarkMode
                                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                if (!chargerToDelete) return;
                                try {
                                    await deleteCharger(chargerToDelete.id);
                                    setDeletionSuccess(true);
                                    setDeletionMessage("Charger " + chargerToDelete.name + " along with all ports deleted successfully");
                                    setShowDeletionResult(true);
                                    fetchUserChargers(); // Refresh list
                                    setShowDeleteConfirmation(false);
                                    setChargerToDelete(null);
                                } catch (error) {
                                    console.error("Failed to delete charger:", error);
                                    setDeletionSuccess(false);
                                    setDeletionMessage("Charger deletion of " + chargerToDelete.name + " unsuccessful. Try again");
                                    setShowDeletionResult(true);
                                    setShowDeleteConfirmation(false);
                                    setChargerToDelete(null);
                                }
                            }}
                            className="flex-1 py-2 px-4 rounded-lg font-medium bg-red-600 text-white hover:bg-red-500 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Deletion Result Dialog */}
            <Dialog open={showDeletionResult} onOpenChange={setShowDeletionResult}>
                <DialogContent className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-sm z-[10020] rounded-lg border shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <DialogTitle className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {deletionMessage}
                    </DialogTitle>
                    <DialogDescription className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {deletionSuccess ? "This charger won't be shown to car owners from now." : ""}
                    </DialogDescription>
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={() => setShowDeletionResult(false)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                isDarkMode
                                    ? "bg-blue-600 text-white hover:bg-blue-500"
                                    : "bg-blue-500 text-white hover:bg-blue-400"
                            }`}
                        >
                            OK
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
