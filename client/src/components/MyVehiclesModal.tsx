import React, { useState, useEffect } from "react";
import { Car, Plus, X, Edit, Trash } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "../app/components/ui/dialog";
import axios from 'axios';

interface Vehicle {
    _id: string;
    company: string;
    model: string;
    launchYear: number;
    licensePlate: string;
    batteryCapacity: number;
    maxChargingPower: number;
    connectorType: string;
    owner: string;
    isSelected?: boolean;
}

interface NewCarForm {
    company: string;
    model: string;
    launchYear: string;
    licensePlate: string;
    batteryCapacity: string;
    maxChargingPower: string;
    connectorType: string;
}

interface MyVehiclesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCar: (carValue: string) => void;
    currentSelectedCar: string;
    isDarkMode: boolean;
}

export function MyVehiclesModal({
    isOpen,
    onClose,
    onSelectCar,
    currentSelectedCar,
    isDarkMode,
}: MyVehiclesModalProps) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [showAddCarForm, setShowAddCarForm] = useState(false);
    const [showUpdateCarForm, setShowUpdateCarForm] = useState(false);
    const [selectedCarForUpdate, setSelectedCarForUpdate] = useState<Vehicle | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [newCar, setNewCar] = useState<NewCarForm>({
        company: "",
        model: "",
        launchYear: "",
        licensePlate: "",
        batteryCapacity: "",
        maxChargingPower: "",
        connectorType: "Type 2",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUserVehicles();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedCarForUpdate) {
            setNewCar({
                company: selectedCarForUpdate.company || '',
                model: selectedCarForUpdate.model || '',
                launchYear: selectedCarForUpdate.launchYear ? selectedCarForUpdate.launchYear.toString() : '',
                licensePlate: selectedCarForUpdate.licensePlate || '',
                batteryCapacity: selectedCarForUpdate.batteryCapacity ? selectedCarForUpdate.batteryCapacity.toString() : '',
                maxChargingPower: selectedCarForUpdate.maxChargingPower ? selectedCarForUpdate.maxChargingPower.toString() : '',
                connectorType: Array.isArray(selectedCarForUpdate.connectorType) ? selectedCarForUpdate.connectorType[0] : selectedCarForUpdate.connectorType || 'Type 2',
            });
        }
    }, [selectedCarForUpdate]);

    const fetchUserVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:9000/api/v1/cars/my', {
                withCredentials: true
            });
            setVehicles(response.data.data);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setError('Failed to load vehicles. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectVehicle = (vehicle: Vehicle) => {
        let model = vehicle.model.toLowerCase();
        model = model.replace(/ev/gi, '').trim(); // remove 'ev' case insensitive
        model = model.replace(/\s+/g, '-'); // replace spaces with -
        const carValue = `${vehicle.company.toLowerCase()}-${model}`;
        onSelectCar(carValue);
        onClose();
    };

    const resetForm = () => {
        setNewCar({
            company: "",
            model: "",
            launchYear: "",
            licensePlate: "",
            batteryCapacity: "",
            maxChargingPower: "",
            connectorType: "Type 2",
        });
    };

    const handleUpdateCar = (vehicle: Vehicle) => {
        setSelectedCarForUpdate(vehicle);
        setShowUpdateCarForm(true);
        setShowAddCarForm(false);
    };

    const handleDeleteCar = (vehicle: Vehicle) => {
        onClose();
        setShowDeleteConfirm(true);
        setVehicleToDelete(vehicle);
    };

    const confirmDelete = async () => {
        if (!vehicleToDelete) return;
        console.log("Deleting car", vehicleToDelete._id);
        setDeleting(true);
        const timeout = setTimeout(() => setDeleting(false), 5000); // Reset after 5 seconds to prevent freeze
        try {
            await axios.delete(`http://localhost:9000/api/v1/cars/${vehicleToDelete._id}`, {
                withCredentials: true
            });
            // Refresh vehicles list
            await fetchUserVehicles();
            setShowDeleteConfirm(false);
            setVehicleToDelete(null);
        } catch (error) {
            console.error("Error deleting car:", error);
            setError('Failed to delete vehicle. Please try again.');
        } finally {
            clearTimeout(timeout);
            setDeleting(false);
        }
    };

    const cancelDelete = () => {
        console.log("Cancel delete");
        setShowDeleteConfirm(false);
        setVehicleToDelete(null);
    };

    const handleAddNewCar = () => {
        setShowAddCarForm(true);
        setShowUpdateCarForm(false);
        setSelectedCarForUpdate(null);
        resetForm();
    };

    const handleFormChange = (field: keyof NewCarForm, value: string) => {
        setNewCar(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitCar = async () => {
        try {
            const carData = {
                company: newCar.company,
                model: newCar.model,
                launchYear: parseInt(newCar.launchYear),
                licensePlate: newCar.licensePlate.toUpperCase(),
                batteryCapacityKwh: parseFloat(newCar.batteryCapacity),
                maxChargingPowerKw: parseFloat(newCar.maxChargingPower),
                connectorType: [newCar.connectorType],
            };

            if (selectedCarForUpdate) {
                // Update existing car
                await axios.patch(`http://localhost:9000/api/v1/cars/${selectedCarForUpdate._id}`, carData, {
                    withCredentials: true
                });
            } else {
                // Add new car
                await axios.post('http://localhost:9000/api/v1/cars/postcar', carData, {
                    withCredentials: true
                });
            }

            // Refresh vehicles list
            await fetchUserVehicles();
            
            setShowAddCarForm(false);
            setShowUpdateCarForm(false);
            setSelectedCarForUpdate(null);
            resetForm();
        } catch (error) {
            console.error(selectedCarForUpdate ? "Error updating car:" : "Error adding car:", error);
            setError(selectedCarForUpdate ? 'Failed to update vehicle. Please try again.' : 'Failed to add vehicle. Please try again.');
        }
    };

    const handleApply = () => {
        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent
                    className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm rounded-t-2xl border-t z-[10002] p-4 ${
                        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
                    style={{
                        maxHeight: "80vh",
                    }}
                >
                    {/* Visually hidden accessibility elements */}
                    <DialogTitle className="sr-only">My Vehicles</DialogTitle>
                    <DialogDescription className="sr-only">
                        Select your vehicle from the list or add a new vehicle
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
                            {showAddCarForm ? "Add New Vehicle" : showUpdateCarForm ? "Update Vehicle" : "My Vehicles"}
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
                                    onClick={fetchUserVehicles}
                                    className={`mt-2 text-sm font-medium ${
                                        isDarkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"
                                    }`}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : showAddCarForm || showUpdateCarForm ? (
                            /* Add New Car Form */
                            <div className="space-y-4">
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? "text-gray-200" : "text-gray-700"
                                        }`}
                                    >
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        value={newCar.company}
                                        onChange={(e) => handleFormChange('company', e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                        placeholder="e.g., Tata, MG, Hyundai"
                                    />
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? "text-gray-200" : "text-gray-700"
                                        }`}
                                    >
                                        Model
                                    </label>
                                    <input
                                        type="text"
                                        value={newCar.model}
                                        onChange={(e) => handleFormChange('model', e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                        placeholder="e.g., Nexon EV, ZS EV"
                                    />
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? "text-gray-200" : "text-gray-700"
                                        }`}
                                    >
                                        Launch Year
                                    </label>
                                    <input
                                        type="number"
                                        value={newCar.launchYear}
                                        onChange={(e) => handleFormChange('launchYear', e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                        placeholder="e.g., 2020, 2021"
                                        min="2000"
                                        max={new Date().getFullYear()}
                                    />
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? "text-gray-200" : "text-gray-700"
                                        }`}
                                    >
                                        License Plate
                                    </label>
                                    <input
                                        type="text"
                                        value={newCar.licensePlate}
                                        onChange={(e) => handleFormChange('licensePlate', e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                        placeholder="e.g., MH12AB1234"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? "text-gray-200" : "text-gray-700"
                                        }`}
                                    >
                                        Battery Capacity (kWh)
                                    </label>
                                    <input
                                        type="number"
                                        value={newCar.batteryCapacity}
                                        onChange={(e) => handleFormChange('batteryCapacity', e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                        placeholder="e.g., 40.5"
                                        min="1"
                                        step="0.1"
                                    />
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? "text-gray-200" : "text-gray-700"
                                        }`}
                                    >
                                        Max Charging Power (kW)
                                    </label>
                                    <input
                                        type="number"
                                        value={newCar.maxChargingPower}
                                        onChange={(e) => handleFormChange('maxChargingPower', e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                        placeholder="e.g., 50"
                                        min="1"
                                        step="1"
                                    />
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? "text-gray-200" : "text-gray-700"
                                        }`}
                                    >
                                        Connector Type
                                    </label>
                                    <select
                                        value={newCar.connectorType}
                                        onChange={(e) => handleFormChange('connectorType', e.target.value)}
                                        className={`w-full px-3 py-2.5 rounded-lg border appearance-none cursor-pointer transition-all duration-200 ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                                                : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-400"
                                        }`}
                                    >
                                        <option value="" disabled className="text-gray-500">
                                            Select connector type...
                                        </option>
                                        <option value="Type 1" className="font-medium">Type 1 (J1772)</option>
                                        <option value="Type 2" className="font-medium">Type 2 (Mennekes)</option>
                                        <option value="CCS1" className="font-medium">CCS1 (Combo)</option>
                                        <option value="CCS2" className="font-medium">CCS2 (Combo)</option>
                                        <option value="CHAdeMO" className="font-medium">CHAdeMO (Fast)</option>
                                        <option value="GB/T" className="font-medium">GB/T (Tesla)</option>
                                        <option value="Tesla" className="font-medium">Tesla (Proprietary)</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            /* Vehicle List */
                            <div className="space-y-2">
                                {vehicles.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Car className={`w-16 h-16 mx-auto mb-4 ${
                                            isDarkMode ? "text-gray-600" : "text-gray-400"
                                        }`} />
                                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                            No cars added yet
                                        </p>
                                        <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                                            Add your first vehicle to get started
                                        </p>
                                    </div>
                                ) : (
                                    vehicles.map((vehicle) => {
                                        const carValue = vehicle.company.toLowerCase() + '-' + vehicle.model.toLowerCase().replace(' ', '-').replace('ev', '').replace('-ev', '');
                                        const isSelected = carValue === currentSelectedCar;
                                        
                                        return (
                                            <div
                                                key={vehicle._id}
                                                onClick={() => handleSelectVehicle(vehicle)}
                                                className={`relative p-2.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                                                    isSelected
                                                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 shadow-lg dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-500 dark:shadow-emerald-500/20"
                                                        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 dark:hover:border-gray-600"
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                                            isSelected 
                                                                ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg" 
                                                                : "bg-gray-100 dark:bg-gray-700"
                                                        }`}
                                                    >
                                                        <Car className={`w-6 h-6 transition-colors duration-300 ${
                                                            isSelected ? "text-white" : "text-gray-600 dark:text-gray-400"
                                                        }`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3
                                                            className={`font-semibold text-base transition-colors duration-300 ${
                                                                isSelected 
                                                                    ? "text-emerald-800 dark:text-emerald-200" 
                                                                    : "text-gray-900 dark:text-gray-100"
                                                            }`}
                                                        >
                                                            {vehicle.company} {vehicle.model}
                                                        </h3>
                                                        <p
                                                            className={`text-sm mt-1 transition-colors duration-300 ${
                                                                isSelected 
                                                                    ? "text-emerald-600 dark:text-emerald-400" 
                                                                    : "text-gray-600 dark:text-gray-400"
                                                            }`}
                                                        >
                                                            Electric • {Array.isArray(vehicle.connectorType) ? vehicle.connectorType.join(', ') : vehicle.connectorType}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleUpdateCar(vehicle); }}
                                                    className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
                                                        isSelected ? "bg-emerald-500/20 hover:bg-emerald-500/30" : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
                                                    }`}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCar(vehicle); }}
                                                    className={`absolute top-10 right-2 p-1 rounded-full transition-colors ${
                                                        isSelected ? "bg-red-500/20 hover:bg-red-500/30" : "bg-gray-200 hover:bg-red-300 dark:bg-gray-600 dark:hover:bg-red-500"
                                                    }`}
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
                        {showAddCarForm || showUpdateCarForm ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setShowAddCarForm(false); setShowUpdateCarForm(false); setSelectedCarForUpdate(null); resetForm(); }}
                                    className={`flex-1 py-2 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02] ${
                                        isDarkMode
                                            ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                                            : "text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitCar}
                                    className="flex-1 py-2 rounded-2xl font-medium text-white transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl"
                                >
                                    {showUpdateCarForm ? "Update Vehicle" : "Add Vehicle"}
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleAddNewCar}
                                    className={`w-full py-2 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02] ${
                                        isDarkMode
                                            ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                            : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                    }`}
                                >
                                    Add New
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="w-full py-2 rounded-2xl font-medium text-white transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg hover:shadow-xl"
                                >
                                    Apply
                                </button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            {showDeleteConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-[10003]" onClick={cancelDelete}>
                    <div className={`p-6 rounded-lg max-w-sm mx-4 z-[10004] ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`} onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-2">Delete Vehicle</h3>
                        <p className="mb-4">Are you sure you want to delete this vehicle? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelDelete}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    isDarkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
