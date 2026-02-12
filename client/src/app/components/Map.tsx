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
}

export default function Map({
    center = [28.6139, 77.209], // Default to Delhi
    zoom = 13,
    stations = [],
    onStationSelect,
    isDarkMode = false,
}: MapProps) {
    const mapRef = useRef<L.Map | null>(null);
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
            });

            // Add tile layer (OpenStreetMap)
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);

            // Add zoom control
            L.control
                .zoom({
                    position: "bottomright",
                })
                .addTo(map);

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
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

        // Add user location marker
        const userMarker = L.marker(center, {
            icon: L.divIcon({
                className: "user-location-marker",
                html: `
          <div style="
            position: relative;
            width: 50px;
            height: 50px;
          ">
            <!-- Directional cone -->
            <div style="
              position: absolute;
              top: 3px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 12px solid transparent;
              border-right: 12px solid transparent;
              border-bottom: 20px solid rgba(59, 130, 246, 0.4);
              filter: blur(0.5px);
              z-index: 1;
            "></div>
            
            <!-- Blue circular base -->
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 20px;
              height: 20px;
              background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
              border-radius: 50%;
              border: 2px solid rgba(255, 255, 255, 0.9);
              box-shadow: 
                0 0 0 3px rgba(59, 130, 246, 0.2),
                0 2px 8px rgba(0, 0, 0, 0.15),
                0 0 15px rgba(59, 130, 246, 0.1);
              z-index: 2;
            "></div>
            
            <!-- Inner dot -->
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 6px;
              height: 6px;
              background: white;
              border-radius: 50%;
              z-index: 3;
            "></div>
          </div>
        `,
                iconSize: [50, 50],
                iconAnchor: [25, 25],
            }),
        }).addTo(map);
        markers.push(userMarker);

        // Add station markers
        stations.forEach((station) => {
            const marker = L.marker(station.position, {
                icon: L.divIcon({
                    className: "station-marker",
                    html: `<div style="font-size: 24px; text-align: center; line-height: 1;">🔌</div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    bgPos: [0, 0],
                }),
            });

            marker.on("click", () => {
                onStationSelect?.(station.id);
                // Center map on selected station
                map.setView(station.position, 15);
            });

            marker.addTo(map);
            markers.push(marker);

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

        // Don't auto-fit bounds to prevent unwanted zooming
        // if (stations.length > 0) {
        //   const group = new L.featureGroup([...markers]);
        //   map.fitBounds(group.getBounds().pad(0.1));
        // }

        // Cleanup markers on unmount or when stations change
        return () => {
            markers.forEach((marker) => marker.remove());
        };
    }, [stations, mapInitialized, onStationSelect]);

    return (
        <div
            ref={mapContainerRef}
            className="w-full h-full rounded-xl overflow-hidden"
            style={{ minHeight: "400px" }}
        />
    );
}
