import { X } from "lucide-react";
import { Zap, Plug, BatteryCharging, Cable, Car } from "lucide-react";
import React, { memo, useState } from "react";
import { ConnectorBackend } from "../../types";
import { bookCharger } from "../../services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface ChargerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  connectors: ConnectorBackend[];
  stationName: string;
  isLoading?: boolean;
  userRole: string;
  chargerId: string;
  selectedCar: string;
}

function ChargerDetailsModalComponent({
  isOpen,
  onClose,
  isDarkMode,
  connectors,
  stationName,
  isLoading = false,
  userRole,
  chargerId,
  selectedCar,
}: ChargerDetailsModalProps) {
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookConfirm, setBookConfirm] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Clear messages when modal is closed
  const handleClose = () => {
    setBookingMessage(null);
    setAuthError(null);
    setBookConfirm(null);
    onClose();
  };

  // Handle port selection
  const handlePortClick = (connector: any) => {
    console.log('Port clicked:', { connectorId: connector.id, status: connector.status, type: connector.type, power: connector.power });
    // Clear any previous messages when selecting a new port
    setBookingMessage(null);
    setAuthError(null);
    if (connector.status === 'Available') {
      setBookConfirm(connector.id);
    }
  };

  // Map connector types to their respective icons
  const getConnectorIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'Type 1': <Plug className="w-6 h-6" style={{color: '#f97316'}} />,
      'Type 2': <Plug className="w-6 h-6" style={{color: '#16a34a'}} />,
      'CCS1': <Zap className="w-6 h-6" style={{color: '#2563eb'}} />,
      'CCS2': <Zap className="w-6 h-6" style={{color: '#2563eb'}} />,
      'GB/T': <BatteryCharging className="w-6 h-6" style={{color: '#dc2626'}} />,
      'CHAdeMO': <Cable className="w-6 h-6" style={{color: '#9333ea'}} />,
      'Tesla': <Car className="w-6 h-6" style={{color: '#ea580c'}} />,
      'default': <Zap className="w-6 h-6" style={{color: '#4b5563'}} />
    };

    return iconMap[type] || iconMap.default;
  };

  const handleBook = async (connectorId: string) => {
    if (!chargerId || !selectedCar) {
      setBookingMessage('Please select a car first');
      return;
    }

    // Clear previous messages
    setBookingMessage(null);
    setAuthError(null);
    setIsBooking(true);

    try {
      const response = await bookCharger(
        parseInt(chargerId),
        selectedCar,
        'credit_card' // Default payment method
      );

      if (response.success) {
        setBookingMessage('Booking successful!');
        // Close the modal after a short delay
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        // Handle specific error cases
        if (response.error?.includes('authenticated') || response.error?.includes('login') || response.error?.includes('401')) {
          setAuthError('Please log in to book a charger');
        } else {
          setBookingMessage(response.error || 'Failed to book charger');
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('not authenticated')) {
        setAuthError('Session expired. Please log in again.');
      } else {
        setBookingMessage(errorMessage);
      }
    } finally {
      setIsBooking(false);
    }
  };

  const transformConnectors = (connectors: ConnectorBackend[]) => {
    if (!connectors) return [];
    return connectors.map((connector: ConnectorBackend) => ({
      id: connector.id,
      type: connector.connector_type,
      status: connector.status === 'available' ? 'Available' : 
             connector.status === 'occupied' ? 'In Use' : 'Unavailable',
      power: `${connector.max_power_kw}kW`,
      price: `$${connector.price_per_kwh}/kWh`,
    }));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={handleClose}>
      <div 
        className={`relative w-full max-w-md rounded-xl p-6 shadow-2xl pointer-events-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
        style={{ marginTop: '20vh' }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className={`absolute right-4 top-4 p-1 rounded-full ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stationName}
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Available Connectors
          </p>
        </div>

        {/* Connectors List */}
        <div className="space-y-4">
{isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : connectors.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No connectors available for this station
            </div>
          ) : (
            transformConnectors(connectors).map((connector) => (
            <div 
              key={connector.id}
              className={`flex items-center p-4 rounded-lg cursor-pointer ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
              onClick={() => handlePortClick(connector)}
            >
              <div className="flex-shrink-0 mr-4 w-8 h-8 flex items-center justify-center">
                {getConnectorIcon(connector.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {connector.type}
                  </h3>
                  <span 
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      connector.status === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {connector.status}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Power: {connector.power}
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Price: {connector.price}
                </p>
              </div>
            </div>
            )))}
        </div>

        {authError && (
          <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-md">
            {authError}
          </div>
        )}

        {bookingMessage && (
          <div className="mt-4 p-2 bg-green-100 text-green-800 rounded-md">
            {bookingMessage}
          </div>
        )}

        {bookConfirm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
            <div 
              className={`relative w-full max-w-md rounded-xl p-6 shadow-2xl pointer-events-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setBookConfirm(null)}
                className={`absolute right-4 top-4 p-1 rounded-full ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Confirm Booking
                </h3>
                {selectedCar ? (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getConnectorIcon(connectors.find(c => c.id === bookConfirm)?.connector_type || 'default')}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Book {connectors.find(c => c.id === bookConfirm)?.connector_type || 'this port'} 
                        ({connectors.find(c => c.id === bookConfirm)?.max_power_kw || '--'}kW) - 
                        ${connectors.find(c => c.id === bookConfirm)?.price_per_kwh || '--'}/kWh for your {selectedCar}?
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Please select a car first
                  </p>
                )}
              </div>

              {authError && (
                <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md">
                  {authError}
                </div>
              )}

              {bookingMessage && (
                <div className={`p-3 rounded-md mb-4 ${
                  bookingMessage.includes('success') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {bookingMessage}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setBookConfirm(null)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  disabled={isBooking}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (bookConfirm) {
                      console.log('bookConfirm set to:', bookConfirm);
                      handleBook(bookConfirm);
                    }
                  }}
                  disabled={isBooking || !selectedCar}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isBooking
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isBooking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const ChargerDetailsModal = memo(ChargerDetailsModalComponent);
