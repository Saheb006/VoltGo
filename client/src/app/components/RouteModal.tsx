import { X, Navigation, Clock, Zap, MapPin, User, Car } from "lucide-react";
import React, { memo, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { apiClient } from "../../services/apiClient";

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  userLocation: [number, number];
  chargerLocation: [number, number];
  chargerName: string;
  chargerAddress: string;
  connectorType: string;
  power: string;
  price: string;
  carModel: string;
  bookingId?: string;
}

function RouteModalComponent({
  isOpen,
  onClose,
  isDarkMode,
  userLocation,
  chargerLocation,
  chargerName,
  chargerAddress,
  connectorType,
  power,
  price,
  carModel,
  bookingId,
}: RouteModalProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeControlRef = useRef<any>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [userVehicles, setUserVehicles] = useState<any[]>([]);

  // Format car value to readable name
  const formatCarName = (carValue: string) => {
    console.log('RouteModal - Formatting car value:', carValue); // Debug log
    
    // Check if it's from user vehicles first
    const selectedVehicle = userVehicles.find(vehicle => {
      let model = vehicle.model.toLowerCase();
      model = model.replace(/ev/gi, '').trim();
      model = model.replace(/\s+/g, '-');
      return `${vehicle.company.toLowerCase()}-${model}` === carValue;
    });
    
    if (selectedVehicle) {
      console.log('RouteModal - Found in user vehicles:', selectedVehicle); // Debug log
      return `${selectedVehicle.company} ${selectedVehicle.model}`;
    }
    
    // If not found in user vehicles, format from the car value
    if (carValue && carValue.includes('-')) {
      const [company, ...modelParts] = carValue.split('-');
      const model = modelParts.join(' ').replace(/\b\w/g, l => l.toUpperCase());
      const companyFormatted = company.charAt(0).toUpperCase() + company.slice(1);
      const formattedName = `${companyFormatted} ${model}`;
      console.log('RouteModal - Formatted from car value:', formattedName); // Debug log
      return formattedName;
    }
    
    console.log('RouteModal - Using fallback'); // Debug log
    return carValue || 'Unknown Car';
  };

  // Fetch user vehicles on mount
  useEffect(() => {
    const fetchUserVehicles = async () => {
      try {
        const response = await apiClient.get('/api/v1/cars/my');
        setUserVehicles(response.data.data || []);
      } catch (error) {
        console.error('Error fetching user vehicles:', error);
      }
    };
    fetchUserVehicles();
  }, []);

  if (!isOpen) return null;

  // Initialize map and route
  useEffect(() => {
    if (mapContainerRef.current && isOpen) {
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: userLocation,
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      // Add tile layer
      L.tileLayer(
        isDarkMode
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '',
          maxZoom: 19,
        },
      ).addTo(map);

      // Custom icons
      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 16px;
              height: 16px;
              background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
              border-radius: 50%;
              border: 2px solid rgba(255, 255, 255, 0.9);
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const chargerIcon = L.divIcon({
        className: "charger-location-marker",
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          ">
            <span style="font-size: 20px;">🔌</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Add markers
      L.marker(userLocation, { icon: userIcon }).addTo(map)
        .bindPopup('<b>Your Location</b>');

      L.marker(chargerLocation, { icon: chargerIcon }).addTo(map)
        .bindPopup(`<b>${chargerName}</b><br>${chargerAddress}`);

      // Add routing control
      const routingControl = (L as any).Routing.control({
        waypoints: [
          L.latLng(userLocation[0], userLocation[1]),
          L.latLng(chargerLocation[0], chargerLocation[1])
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: () => null, // Don't create additional markers
        lineOptions: {
          styles: [
            {
              color: '#3B82F6',
              weight: 6,
              opacity: 0.8
            }
          ]
        },
        show: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
      }).on('routesfound', function(e: any) {
        const routes = e.routes;
        const summary = routes[0].summary;
        
        // Convert distance to km and duration to minutes
        const distanceInKm = (summary.totalDistance / 1000).toFixed(1);
        const durationInMin = Math.round(summary.totalTime / 60);
        
        setRouteInfo({
          distance: `${distanceInKm} km`,
          duration: `${durationInMin} min`
        });
      }).addTo(map);

      routeControlRef.current = routingControl;
      mapRef.current = map;

      // Cleanup
      return () => {
        if (routeControlRef.current) {
          map.removeControl(routeControlRef.current);
        }
        map.remove();
      };
    }
  }, [isOpen, isDarkMode, userLocation, chargerLocation, chargerName, chargerAddress]);

  const handleStartNavigation = () => {
    setIsNavigating(true);
    // In a real app, this would start GPS navigation
    setTimeout(() => {
      setIsNavigating(false);
    }, 3000);
  };

  const handleCancelTrip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div 
        className={`relative w-full max-w-4xl rounded-xl shadow-2xl pointer-events-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
        style={{ height: '90vh', maxHeight: '800px' }}
      >
        {/* Header */}
        <div className={`absolute top-0 left-0 right-0 z-10 p-4 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Navigate to Charger
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {bookingId && `Booking #${bookingId}`}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'}`}>
              {isNavigating ? 'Navigating' : 'Ready'}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="h-full pt-20 pb-48">
          <div
            ref={mapContainerRef}
            className="w-full h-full"
          />
        </div>

        {/* Bottom Info Panel */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Route Info */}
          {routeInfo && (
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {routeInfo.distance}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {routeInfo.duration}
                  </span>
                </div>
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Fastest route
              </div>
            </div>
          )}

          {/* Destination Details */}
          <div className="mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {chargerName}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {chargerAddress}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className={`px-2 py-1 rounded-md ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    {connectorType}
                  </span>
                  <span className={`px-2 py-1 rounded-md ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    {power}
                  </span>
                  <span className={`px-2 py-1 rounded-md ${isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
                    {price}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <Car className="w-4 h-4 text-gray-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Vehicle: {formatCarName(carModel)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancelTrip}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancel Trip
            </button>
            <button
              onClick={handleStartNavigation}
              disabled={isNavigating}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                isNavigating
                  ? "bg-blue-600 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Navigation className="w-4 h-4" />
              {isNavigating ? 'Navigating...' : 'Start Navigation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const RouteModal = memo(RouteModalComponent);
