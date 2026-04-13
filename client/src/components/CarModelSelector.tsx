import { useState, useEffect } from "react";
import { Car, Search } from "lucide-react";
import { getAllCarModels, type CarModel } from "../services/api";

interface CarModelSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCar: (carModel: CarModel) => void;
    isDarkMode: boolean;
    currentSelectedCar?: string;
}

export function CarModelSelector({
    isOpen,
    onClose,
    onSelectCar,
    isDarkMode,
    currentSelectedCar,
}: CarModelSelectorProps) {
    const [carModels, setCarModels] = useState<CarModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchCarModels();
        }
    }, [isOpen]);

    const fetchCarModels = async () => {
        setLoading(true);
        setError(null);
        try {
            const models = await getAllCarModels();
            setCarModels(models);
        } catch (err) {
            console.error('Error fetching car models:', err);
            setError('Failed to load car models. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredModels = carModels.filter(model =>
        model.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.modelName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectCar = (carModel: CarModel) => {
        onSelectCar(carModel);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="w-full h-80 flex flex-col">
            {/* Search Bar */}
            <div className="relative mb-4">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                }`} />
                <input
                    type="text"
                    placeholder="Search by company or model..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                            isDarkMode ? "border-white" : "border-gray-900"
                        }`} />
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className={`text-sm mb-4 ${
                            isDarkMode ? "text-red-400" : "text-red-600"
                        }`}>
                            {error}
                        </p>
                        <button
                            onClick={fetchCarModels}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                isDarkMode 
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                            }`}
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredModels.length === 0 ? (
                    <div className="text-center py-12">
                        <Car className={`w-16 h-16 mx-auto mb-4 ${
                            isDarkMode ? "text-gray-600" : "text-gray-400"
                        }`} />
                        <p className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}>
                            {searchTerm ? "No car models found matching your search" : "No car models available"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredModels.map((model) => {
                            // Check if this car is currently selected
                            let modelSlug = model.modelName.toLowerCase();
                            modelSlug = modelSlug.replace(/ev/gi, '').trim();
                            modelSlug = modelSlug.replace(/\s+/g, '-');
                            const carValue = `${model.companyName.toLowerCase()}-${modelSlug}`;
                            const isSelected = carValue === currentSelectedCar;
                            
                            return (
                            <div
                                key={model._id}
                                onClick={() => handleSelectCar(model)}
                                className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isSelected
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg"
                                        : isDarkMode
                                            ? "border-gray-700 hover:border-emerald-500 bg-gray-700"
                                            : "border-gray-200 hover:border-emerald-400 bg-white"
                                }`}
                            >
                                <div className="aspect-square relative bg-gray-100">
                                    <img
                                        src={model.imageUrl}
                                        alt={`${model.companyName} ${model.modelName}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                </div>
                                <div className="p-3">
                                    <h3 className={`font-semibold text-sm truncate ${
                                        isDarkMode ? "text-white" : "text-gray-900"
                                    }`}>
                                        {model.companyName}
                                    </h3>
                                    <p className={`text-xs mt-1 truncate ${
                                        isDarkMode ? "text-gray-300" : "text-gray-600"
                                    }`}>
                                        {model.modelName}
                                    </p>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
