import React, { useState } from "react";
import { X } from "lucide-react";
import { createChargerPort } from "../../services/api";

interface AddPortFormProps {
    chargerId: string;
    chargerName: string;
    isDarkMode: boolean;
    onClose: () => void;
    onSubmit: () => void; // To refresh the list
}

export function AddPortForm({ chargerId, chargerName, isDarkMode, onClose, onSubmit }: AddPortFormProps) {
    const [formData, setFormData] = useState({
        connector_type: "Type 2",
        max_power_kw: "",
        price_per_kwh: "",
        status: "available",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.connector_type) {
            setError("Connector type is required");
            return;
        }
        const power = parseFloat(formData.max_power_kw);
        if (isNaN(power) || power <= 0) {
            setError("Invalid max power value");
            return;
        }
        const price = parseFloat(formData.price_per_kwh);
        if (isNaN(price) || price <= 0) {
            setError("Invalid price per kWh");
            return;
        }

        setLoading(true);
        try {
            await createChargerPort(chargerId, {
                connector_type: formData.connector_type,
                max_power_kw: power,
                price_per_kwh: price,
                status: formData.status,
            });
            onSubmit(); // Refresh the list
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create port");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-2xl border p-6 ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                        Add New Port to {chargerName}
                    </h3>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-full ${
                            isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                    >
                        <X className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-100 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Connector Type */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                            Connector Type *
                        </label>
                        <select
                            name="connector_type"
                            value={formData.connector_type}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-white border-gray-300 text-gray-900"
                            }`}
                            required
                        >
                            <option value="Type 1">Type 1</option>
                            <option value="Type 2">Type 2</option>
                            <option value="CCS1">CCS1</option>
                            <option value="CCS2">CCS2</option>
                            <option value="CHAdeMO">CHAdeMO</option>
                            <option value="GB/T">GB/T</option>
                            <option value="Tesla">Tesla</option>
                        </select>
                    </div>

                    {/* Max Power */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                            Max Power (kW) *
                        </label>
                        <input
                            type="number"
                            name="max_power_kw"
                            value={formData.max_power_kw}
                            onChange={handleInputChange}
                            step="0.1"
                            min="0"
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="e.g., 22"
                            required
                        />
                    </div>

                    {/* Price per kWh */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                            Price per kWh (₹) *
                        </label>
                        <input
                            type="number"
                            name="price_per_kwh"
                            value={formData.price_per_kwh}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="e.g., 10"
                            required
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-white border-gray-300 text-gray-900"
                            }`}
                        >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="faulty">Faulty</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                                isDarkMode
                                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                                    : "text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                                loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : isDarkMode
                                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                                        : "bg-blue-500 hover:bg-blue-400 text-white"
                            }`}
                        >
                            {loading ? "Creating..." : "Create Port"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
