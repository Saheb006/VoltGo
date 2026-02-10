import { Search, MapPin, Car, CreditCard, ChevronDown, User, Clock as ClockIcon, Home, Edit, Trash2, Users, LogOut, ChevronRight, Moon, Sun, Zap as ZapIcon, Filter } from 'lucide-react';
import { StationCard } from './components/StationCard';
import LoginPage from './components/LoginPage';
import Map from './components/Map';
import { useState, useEffect, useRef, useCallback } from 'react';

import type { Station } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import { fetchNearbyStations } from '../services/api';
import { carOptions, paymentOptions, distanceOptions } from '../constants/options';

export default function App() {
  const [selectedCar, setSelectedCar] = useState('tata-nexon');
  const [selectedPayment, setSelectedPayment] = useState('google-pay');
  const [showChargers, setShowChargers] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'account'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState('10');
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([11.3493, 142.1996]);
  const [userLocationAccuracy, setUserLocationAccuracy] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasReceivedLocationRef = useRef(false);
  const searchPlaceholderRef = useRef('Search location');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Request location permission and get user location on mount
  useEffect(() => {

    if (!('geolocation' in navigator)) {
      console.log('Geolocation is not supported by this browser');
      setUserLocation([11.3493, 142.1996]);
      return;
    }

    let watchId: number | null = null;
    let retryTimer: number | null = null;
    let attempts = 0;
    let coarseFallbackTimer: number | null = null;

    const onPosition = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;

      setUserLocationAccuracy(accuracy);

      // Always accept the first reading so you don't remain stuck on the default.
      // After that, ignore very low-quality fixes to reduce random jumps.
      if (!hasReceivedLocationRef.current) {
        hasReceivedLocationRef.current = true;
        setUserLocation([latitude, longitude]);
        return;
      }

      if (Number.isFinite(accuracy) && accuracy > 150) return;

      setUserLocation([latitude, longitude]);
    };

    const onError = (error: GeolocationPositionError) => {
      console.error('Error getting location:', {
        code: error.code,
        message: error.message,
      });

      // If permission denied, keep default fallback and stop trying.
      if (error.code === error.PERMISSION_DENIED) {
        setUserLocation([11.3493, 142.1996]);
        return;
      }

      // If we still don't have any fix, allow a coarse fallback after errors.
      if (!hasReceivedLocationRef.current) {
        setUserLocationAccuracy(null);
      }
    };

    const requestOnce = () => {
      navigator.geolocation.getCurrentPosition(onPosition, onError, {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      });
    };

    // First attempt immediately
    requestOnce();

    // Retry a few times until we get the first fix (some devices need time to lock GPS).
    retryTimer = window.setInterval(() => {
      if (hasReceivedLocationRef.current) {
        if (retryTimer !== null) window.clearInterval(retryTimer);
        retryTimer = null;
        return;
      }

      attempts += 1;
      if (attempts >= 5) {
        if (retryTimer !== null) window.clearInterval(retryTimer);
        retryTimer = null;
        return;
      }

      requestOnce();
    }, 4000);

    watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    });

    // If high-accuracy GPS doesn't resolve quickly (common indoors), fall back to a coarse fix
    // so you at least see a non-default location.
    coarseFallbackTimer = window.setTimeout(() => {
      if (hasReceivedLocationRef.current) return;

      navigator.geolocation.getCurrentPosition(onPosition, onError, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      });
    }, 8000);

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      if (retryTimer !== null) {
        window.clearInterval(retryTimer);
      }

      if (coarseFallbackTimer !== null) {
        window.clearTimeout(coarseFallbackTimer);
      }
    };
  }, []);

  // Animated placeholder text
  useEffect(() => {
    const placeholders = ['Search location', 'VoltGo', 'Find chargers', 'Explore stations'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % placeholders.length;
      searchPlaceholderRef.current = placeholders[index];
      if (searchInputRef.current) {
        searchInputRef.current.placeholder = placeholders[index];
      }
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Load stations when user searches
  const handleFindChargers = async () => {
    setIsLoading(true);
    try {
      // Get fresh location before searching
      const getCurrentLocation = (): Promise<[number, number]> => {
        return new Promise((resolve, reject) => {
          if (!('geolocation' in navigator)) {
            console.warn('Geolocation not available, using stored location');
            resolve(userLocation);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              console.log('📍 Current GPS location:', { latitude, longitude });
              resolve([latitude, longitude]);
            },
            (error) => {
              console.warn('Failed to get fresh location, using stored:', error);
              resolve(userLocation);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000, // Accept location up to 1 minute old
            }
          );
        });
      };

      // Get fresh location
      const currentLocation = await getCurrentLocation();
      const userLocationObj = { lat: currentLocation[0], lng: currentLocation[1] };
      
      console.log('🔍 Searching for chargers:', {
        distance: `${selectedDistance}km`,
        location: `[${userLocationObj.lat.toFixed(6)}, ${userLocationObj.lng.toFixed(6)}]`,
        radius: `${parseFloat(selectedDistance) * 1000}m`,
        carType: selectedCar
      });
      
      const data = await fetchNearbyStations(selectedDistance, selectedCar, userLocationObj);
      console.log('✅ Found stations:', data);
      console.log('📊 Number of stations:', data.length);
      
      if (data.length === 0) {
        alert(`No charging stations found within ${selectedDistance}km of your location [${userLocationObj.lat.toFixed(4)}, ${userLocationObj.lng.toFixed(4)}]. Try increasing the search radius.`);
      }
      
      setStations(data);
      setShowChargers(true);
    } catch (error: unknown) {
      console.error('❌ Error fetching stations:', error);
      // Show user-friendly error message
      if (error instanceof Error && error.message === 'Authentication required') {
        alert('Please login to search for nearby chargers');
      } else {
        alert(`Failed to find nearby chargers: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reload stations when distance changes
  useEffect(() => {
    if (showChargers) {
      handleFindChargers();
    }
  }, [selectedDistance]);

  return (
    // Show login page if not authenticated, otherwise show main app
    !isAuthenticated ? (
      <LoginPage 
        onLoginSuccess={() => setIsAuthenticated(true)} 
        isDarkMode={isDarkMode} 
      />
    ) : (
      <div className={`min-h-screen pb-20 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

        {currentPage === 'home' ? (
          <div className="">
            {/* Map Container */}
            <div className="relative h-screen">
              {/* Search */}
              <div className="absolute top-4 left-4 z-[1000] animate-in fade-in slide-in-from-top-2 duration-500" style={{ width: '320px' }}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={searchPlaceholderRef.current}
                    className={`w-full pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800/90 border-gray-700 text-white placeholder-gray-400 backdrop-blur-sm' 
                        : 'bg-white/90 border-gray-200 text-gray-900 backdrop-blur-sm'
                    }`}
                  />
                </div>
              </div>
            
            {/* Filter Button */}
            <div className="absolute top-4 left-[340px] z-[1000] animate-in fade-in slide-in-from-top-2 duration-500">
              <button className={`p-3 rounded-full transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800/90 text-gray-200 hover:bg-gray-700 backdrop-blur-sm' 
                  : 'bg-white/90 text-gray-600 hover:bg-gray-100 backdrop-blur-sm'
              }`}>
                <Filter className="w-5 h-5" />
              </button>
            </div>

            <Map 
              center={userLocation}
              zoom={13}
              stations={showChargers ? stations.map((station: Station) => ({
                id: station.id.toString(),
                position: [station.lat, station.lng] as [number, number],
                name: station.name,
                available: station.available
              })) : []}
              onStationSelect={(stationId) => {
                // Handle station selection
                console.log('Selected station:', stationId);
              }}
              isDarkMode={isDarkMode}
            />
            
            {/* Distance selector */}
            {showChargers && (
              <div className="absolute top-20 left-4 z-[1000] animate-in fade-in slide-in-from-top-2 duration-500">
                <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                  <SelectTrigger className={`px-3 py-2 rounded-md shadow-sm text-sm border-0 ${
                    isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-600'
                  }`}>
                    <SelectValue placeholder="Select distance range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nearby Stations (1km)</SelectItem>
                    <SelectItem value="2">Nearby Stations (2km)</SelectItem>
                    <SelectItem value="3">Nearby Stations (3km)</SelectItem>
                    <SelectItem value="4">Nearby Stations (4km)</SelectItem>
                    <SelectItem value="5">Nearby Stations (5km)</SelectItem>
                    <SelectItem value="10">Nearby Stations (10km)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Station List - Horizontal Scroll */}
            {showChargers && (
              <div className="absolute bottom-0 left-0 w-full z-[1000] p-4 overflow-x-auto flex space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {stations.map((station: Station) => (
                  <div key={station.id} className="flex-none w-80">
                    <StationCard {...station} isDarkMode={isDarkMode} />
                  </div>
                ))}
              </div>
            )}
            
            {/* Car Selection - Always visible above charger cards */}
            <div className="absolute bottom-36 left-0 w-full z-[1000] p-4">
              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Car className="w-4 h-4" />
                  <span>Select Your Car</span>
                </div>
                <Select value={selectedCar} onValueChange={setSelectedCar}>
                  <SelectTrigger className={`w-full px-4 py-3 border rounded-lg ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                  }`}>
                    <SelectValue placeholder="Select a car" />
                  </SelectTrigger>
                  <SelectContent>
                    {carOptions.map((car) => (
                      <SelectItem key={car.value} value={car.value}>
                        {car.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Find Chargers Button - only show when chargers not found */}
            {!showChargers && (
              <div className="absolute bottom-4 left-4 right-4 z-[1000] space-y-2">
                {/* Location indicator */}
                <div className={`px-4 py-2 rounded-lg text-xs ${
                  isDarkMode 
                    ? 'bg-gray-800/90 text-gray-300 backdrop-blur-sm' 
                    : 'bg-white/90 text-gray-600 backdrop-blur-sm'
                }`}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>Searching from: {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}</span>
                  </div>
                </div>
                <button
                  onClick={handleFindChargers}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Find Chargers
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <AccountPage isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
      )}

      {/* Bottom Navigation - Fixed at bottom like Uber */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-around">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`flex flex-col items-center gap-1 transition-colors py-2 ${
              currentPage === 'home' 
                ? isDarkMode ? 'text-white' : 'text-gray-900'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className={`text-xs ${currentPage === 'home' ? 'font-medium' : ''}`}>Home</span>
          </button>
          <button className={`flex flex-col items-center gap-1 transition-colors py-2 ${
            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}>
            <ClockIcon className="w-6 h-6" />
            <span className="text-xs">Activity</span>
          </button>
          <button 
            onClick={() => setCurrentPage('account')}
            className={`flex flex-col items-center gap-1 transition-colors py-2 ${
              currentPage === 'account'
                ? isDarkMode ? 'text-white' : 'text-gray-900'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-6 h-6" />
            <span className={`text-xs ${currentPage === 'account' ? 'font-medium' : ''}`}>Account</span>
          </button>
        </div>
      </nav>
    </div>
  ) // Added closing parenthesis here
  );
}

function AccountPage({ isDarkMode, onToggleDarkMode }: { isDarkMode: boolean, onToggleDarkMode: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
      {/* User Profile Card */}
      <div className={`rounded-lg p-6 shadow-sm border transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-4">
          {/* Profile Picture */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
            RK
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rahul Kumar</h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>rahul.kumar@example.com</p>
          </div>
        </div>
      </div>

      {/* Account Options */}
      <div className="space-y-2">
        <button className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
          isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Profile</span>
          </div>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-500 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-600'}`} />
        </button>

        {/* Theme Toggle with Switch */}
        <div className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-yellow-900' : 'bg-indigo-100'
            }`}>
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </div>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          {/* Toggle Switch */}
          <button
            onClick={onToggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
          isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <ZapIcon className="w-5 h-5 text-green-600" />
            </div>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Charger Account</span>
          </div>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-500 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-600'}`} />
        </button>

        <button className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
          isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Switch Account</span>
          </div>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-500 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-600'}`} />
        </button>

        <button className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
          isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-red-900/20' : 'bg-white border-gray-200 hover:bg-red-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-red-600 font-medium">Delete Account</span>
          </div>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-500 group-hover:text-red-400' : 'text-gray-400 group-hover:text-red-400'}`} />
        </button>

        <button className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
          isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-gray-600" />
            </div>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sign Out</span>
          </div>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-500 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-600'}`} />
        </button>
      </div>
    </div>
  );
}