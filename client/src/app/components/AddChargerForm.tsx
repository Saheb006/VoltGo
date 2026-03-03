import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";

interface AddChargerFormProps {
    isDarkMode: boolean;
    onClose: () => void;
    onSubmit: (chargerData: {
        name: string;
        address: string;
        address_details?: string;
        latitude: number;
        longitude: number;
        charger_type: "AC" | "DC";
        status?: "active" | "inactive" | "maintenance";
        image: File;
    }) => Promise<void>;
    initialLocation?: { lat: string; lng: string; address: string };
    isLocationLoading?: boolean;
}

export function AddChargerForm({ isDarkMode, onClose, onSubmit, initialLocation, isLocationLoading }: AddChargerFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        address: initialLocation?.address || "",
        address_details: "",
        latitude: initialLocation?.lat || "",
        longitude: initialLocation?.lng || "",
        charger_type: "AC" as "AC" | "DC",
        status: "active" as "active" | "inactive" | "maintenance",
    });
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialLocation) {
            setFormData(prev => ({
                ...prev,
                address: initialLocation.address,
                latitude: initialLocation.lat,
                longitude: initialLocation.lng,
            }));
        }
    }, [initialLocation]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.name.trim()) {
            setError("Charger name is required");
            return;
        }
        if (!formData.address.trim()) {
            setError("Address is required");
            return;
        }
        if (!formData.latitude || !formData.longitude) {
            setError("Latitude and longitude are required");
            return;
        }
        if (!image) {
            setError("Charger image is required");
            return;
        }

        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);

        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            setError("Invalid latitude or longitude values");
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                ...formData,
                latitude: lat,
                longitude: lng,
                image,
                address_details: formData.address_details || undefined,
                status: formData.status === "active" ? undefined : formData.status,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create charger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-2xl border p-6 ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                        Add New Charger
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

                    {/* Name */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                            Charger Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="e.g., Downtown Charging Station"
                            required
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                            Address *
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="Street address"
                            required
                        />
                    </div>

                    {/* Address Details */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                            Address Details
                        </label>
                        <textarea
                            name="address_details"
                            value={formData.address_details}
                            onChange={handleInputChange}
                            rows={2}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="Additional location details (optional)"
                        />
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}>
                                Latitude *
                            </label>
                            {isLocationLoading ? (
                                <div className={`flex items-center justify-center px-3 py-2 rounded-lg border text-sm ${
                                    isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white"
                                        : "bg-white border-gray-300 text-gray-900"
                                }`}>
                                    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${
                                        isDarkMode ? "border-white" : "border-gray-900"
                                    }`} />
                                </div>
                            ) : (
                                <input
                                    type="number"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    step="any"
                                    min="-90"
                                    max="90"
                                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                        isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                    }`}
                                    placeholder="e.g., 12.9716"
                                    required
                                />
                            )}
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}>
                                Longitude *
                            </label>
                            {isLocationLoading ? (
                                <div className={`flex items-center justify-center px-3 py-2 rounded-lg border text-sm ${
                                    isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white"
                                        : "bg-white border-gray-300 text-gray-900"
                                }`}>
                                    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${
                                        isDarkMode ? "border-white" : "border-gray-900"
                                    }`} />
                                </div>
                            ) : (
                                <input
                                    type="number"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    step="any"
                                    min="-180"
                                    max="180"
                                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                        isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                    }`}
                                    placeholder="e.g., 77.5946"
                                    required
                                />
                            )}
                        </div>
                    </div>

                    {/* Charger Type */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                            Charger Type *
                        </label>
                        <select
                            name="charger_type"
                            value={formData.charger_type}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-white border-gray-300 text-gray-900"
                            }`}
                            required
                        >
                            <option value="AC">AC</option>
                            <option value="DC">DC</option>
                        </select>
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
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                            Charger Image *
                        </label>
                        <div className="space-y-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="charger-image"
                                required
                            />
                            <label
                                htmlFor="charger-image"
                                className={`flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                    isDarkMode
                                        ? "border-gray-600 hover:border-gray-500 bg-gray-700"
                                        : "border-gray-300 hover:border-gray-400 bg-gray-50"
                                }`}
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <Upload className={`w-6 h-6 mx-auto mb-1 ${
                                            isDarkMode ? "text-gray-400" : "text-gray-500"
                                        }`} />
                                        <p className={`text-sm ${
                                            isDarkMode ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                            Click to upload image
                                        </p>
                                    </div>
                                )}
                            </label>
                        </div>
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
                                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                        : "bg-emerald-500 hover:bg-emerald-400 text-white"
                            }`}
                        >
                            {loading ? "Creating..." : "Create Charger"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
