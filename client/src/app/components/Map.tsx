import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Vite
const defaultIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface MapProps {
    center?: [number, number];
    zoom?: number;
    stations?: Array<{
        id: string;
        position: [number, number];
        name: string;
        available: boolean;
    }>;
    onStationSelect?: (stationId: string) => void;
    isDarkMode?: boolean;
    routeData?: {
        start: [number, number];
        end: [number, number];
        showRoute: boolean;
    } | null;
    onClearRoute?: () => void;
    onMarkAsReached?: () => void;
}

export default function Map({
    center = [28.6139, 77.209], // Default to Delhi
    zoom = 13,
    stations = [],
    onStationSelect,
    isDarkMode = false,
    routeData,
    onClearRoute,
    onMarkAsReached,
}: MapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const routeLayerRef = useRef<L.Polyline | null>(null);
    const [routeInfo, setRouteInfo] = useState<{
        distance: string;
        duration: string;
    } | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapInitialized, setMapInitialized] = useState(false);

    // Initialize map
    useEffect(() => {
        if (mapContainerRef.current && !mapInitialized) {
            // Create map instance
            const map = L.map(mapContainerRef.current, {
                center,
                zoom,
                zoomControl: false,
                attributionControl: false,
                dragging: true,
                touchZoom: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                boxZoom: true,
                keyboard: true,
            });

            // Add tile layer (OpenStreetMap)
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '',
                maxZoom: 19,
            }).addTo(map);

            // No zoom control - removed for cleaner look

            mapRef.current = map;
            setMapInitialized(true);

            // Cleanup
            return () => {
                map.remove();
            };
        }
    }, []);

    // Update tile layer when dark mode changes
    useEffect(() => {
        if (mapRef.current && mapInitialized) {
            // Remove existing tile layers
            mapRef.current.eachLayer((layer) => {
                if (layer instanceof L.TileLayer) {
                    mapRef.current?.removeLayer(layer);
                }
            });

            // Add new tile layer based on theme
            L.tileLayer(
                isDarkMode
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    attribution: '',
                    maxZoom: 19,
                },
            ).addTo(mapRef.current);
        }
    }, [isDarkMode, mapInitialized]);

    // Update map center when *location changes*.
    // Do NOT try to control zoom from React props, otherwise user zoom interactions will be reset.
    useEffect(() => {
        if (!mapRef.current || !mapInitialized) return;

        const currentCenter = mapRef.current.getCenter();
        if (currentCenter.lat !== center[0] || currentCenter.lng !== center[1]) {
            mapRef.current.setView(center, mapRef.current.getZoom(), { animate: false });
        }
    }, [center, mapInitialized]);

    // Add/update markers when stations change
    useEffect(() => {
        if (!mapRef.current || !mapInitialized) return;

        const markers: L.Marker[] = [];
        const map = mapRef.current;

        // Clear all existing markers first
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add user location marker - hide when route is active
        if (map && !routeData?.showRoute) {
            const userMarker = L.marker(center, {
                icon: L.divIcon({
                    className: "user-location-marker",
                    html: `
            <div style="
              position: relative;
              width: 18px;
              height: 18px;
            ">
              <!-- Outer ring with pulse -->
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 18px;
                height: 18px;
                background: rgba(59, 130, 246, 0.2);
                border-radius: 50%;
                animation: pulse 2s infinite;
              "></div>
              
              <!-- Main circle -->
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 12px;
                height: 12px;
                background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                border-radius: 50%;
                border: 2px solid rgba(255, 255, 255, 0.9);
                box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
              "></div>
              
              <!-- Inner dot -->
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 3px;
                height: 3px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
        `,
                    iconSize: [18, 18],
                    iconAnchor: [9, 9],
                }),
            }).addTo(map);
            markers.push(userMarker);
        }

        // Add station markers
        if (map && !routeData?.showRoute) {
            const stationMarkers: L.Marker[] = [];
            
            stations.forEach(station => {
                const marker = L.marker(station.position, {
                    icon: L.divIcon({
                        className: "custom-marker",
                        html: `
                            <div style="
                                position: relative;
                                width: 24px;
                                height: 24px;
                            ">
                                <div style="
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    width: 24px;
                                    height: 24px;
                                    background: ${
                                        station.available
                                            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                            : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                                    };
                                    border-radius: 50%;
                                    border: 2px solid rgba(255, 255, 255, 0.9);
                                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                                "></div>
                                <svg style="
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    width: 12px;
                                    height: 12px;
                                    color: white;
                                " fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                </svg>
                            </div>
                        `,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                    }),
                });

                marker.on("click", () => {
                    onStationSelect?.(station.id);
                    // Center map on selected station
                    map.setView(station.position, 15);
                });

                marker.addTo(map);
                stationMarkers.push(marker);

                // Add popup
                marker.bindPopup(`
                    <div class="p-2">
                        <h3 class="font-semibold">${station.name}</h3>
                        <p>Status: <span class="${station.available ? "text-green-600" : "text-red-600"}">
                            ${station.available ? "Available" : "Unavailable"}
                        </span></p>
                    </div>
                `);
            });

            // Cleanup station markers on unmount or when stations change
            return () => {
                stationMarkers.forEach((marker) => map.removeLayer(marker));
            };
        }

        // Don't auto-fit bounds to prevent unwanted zooming
        // if (stations.length > 0) {
        //   const group = new L.featureGroup([...markers]);
        //   map.fitBounds(group.getBounds().pad(0.1));
        // }

        // Cleanup markers on unmount or when stations change
        return () => {
            markers.forEach((marker) => {
                if (map.hasLayer(marker)) {
                    map.removeLayer(marker);
                }
            });
        };
    }, [mapRef.current, stations, onStationSelect, isDarkMode]);

    // Handle route display with direct OpenRouteService API
    useEffect(() => {
        const fetchRoute = async () => {
            if (!mapRef.current || !routeData || !routeData.showRoute) {
                // Clear existing route if any
                if (routeLayerRef.current && mapRef.current) {
                    mapRef.current.removeLayer(routeLayerRef.current);
                    routeLayerRef.current = null;
                }
                setRouteInfo(null);
                return;
            }

            const map = mapRef.current; // Store reference to avoid null checks

            try {
                // Close any open popups
                map.eachLayer((layer) => {
                    if ((layer as any).closePopup) {
                        (layer as any).closePopup();
                    }
                });

                // Clear existing route if any
                if (routeLayerRef.current) {
                    map.removeLayer(routeLayerRef.current);
                    routeLayerRef.current = null;
                }

                // Get API key
                const apiKey = import.meta.env.VITE_ORS_API_KEY || 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImYyMmE2MzdkMTg1NjRiMzk5MDhkNzI5M2JhNTNmMmM1IiwiaCI6Im11cm11cjY0In0=';
                
                // Call OpenRouteService API directly
                const response = await fetch(
                    `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${routeData.start[1]},${routeData.start[0]}&end=${routeData.end[1]},${routeData.end[0]}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.features && data.features.length > 0) {
                    const route = data.features[0];
                    const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                    const summary = route.properties.summary;
                    
                    // Create route polyline
                    const routePolyline = L.polyline(coordinates, {
                        color: '#3B82F6',
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '10, 5',
                        lineCap: 'round',
                        lineJoin: 'round'
                    });
                    
                    routePolyline.addTo(map);
                    routeLayerRef.current = routePolyline;
                    
                    // Update route info
                    const distanceInKm = (summary.distance / 1000).toFixed(1);
                    const durationInMin = Math.round(summary.duration / 60);
                    
                    setRouteInfo({
                        distance: `${distanceInKm} km`,
                        duration: `${durationInMin} min`
                    });
                    
                    // Fit map to route
                    const bounds = L.latLngBounds(coordinates);
                    map.fitBounds(bounds, { padding: [50, 50] });
                } else {
                    throw new Error('No route found');
                }
            } catch (error) {
                console.error('Error fetching route:', error);
                setRouteInfo(null);
            }
        };

        fetchRoute();
    }, [routeData, mapRef.current]);

    return (
        <div className="relative w-full h-full">
            <div
                ref={mapContainerRef}
                className="w-full h-full rounded-xl overflow-hidden"
                style={{ 
                    minHeight: "400px",
                    pointerEvents: routeData?.showRoute ? "auto" : "auto"
                }}
            />
            
            {/* Hide attribution and popup controls when route is active */}
            {routeData?.showRoute && (
                <style>
                    {`
                        .leaflet-control-attribution {
                            display: none !important;
                        }
                        .leaflet-control-scale {
                            display: none !important;
                        }
                        .leaflet-popup-content-wrapper {
                            display: none !important;
                        }
                        .leaflet-popup-tip {
                            display: none !important;
                        }
                    `}
                </style>
            )}
            
            {/* Route Info Overlay */}
            {routeInfo && routeData?.showRoute && (
                <div className="absolute top-4 left-4 z-[1000]">
                    <div className={`px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
                        isDarkMode ? 'bg-gray-900/90 text-white border border-gray-700/50' : 'bg-white/90 text-gray-900 border border-gray-200/50'
                    }`}>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50"></div>
                                <span className="text-sm font-medium">
                                    {routeInfo.distance}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">
                                    {routeInfo.duration}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Ride Control Buttons */}
            {routeData?.showRoute && (
                <div className="absolute bottom-8 left-4 right-4 z-[1000]">
                    <div className="flex gap-3 max-w-sm mx-auto">
                        <button
                            onClick={onClearRoute}
                            className={`flex-1 px-4 py-3 text-sm font-medium rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm ${
                                isDarkMode 
                                    ? 'bg-red-500/90 hover:bg-red-600/90 text-white border border-red-400/30' 
                                    : 'bg-red-500/95 hover:bg-red-600/95 text-white border border-red-400/20'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel Ride
                            </div>
                        </button>
                        <button
                            onClick={onMarkAsReached}
                            className={`flex-1 px-4 py-3 text-sm font-medium rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm ${
                                isDarkMode 
                                    ? 'bg-green-500/90 hover:bg-green-600/90 text-white border border-green-400/30' 
                                    : 'bg-green-500/95 hover:bg-green-600/95 text-white border border-green-400/20'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Mark as Reached
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
