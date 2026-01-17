import { Search, MapPin, Car, CreditCard, ChevronDown, User, ClockIcon, Home, Edit, Trash2, Users, LogOut, ChevronRight, Moon, Sun, Zap as ZapIcon } from 'lucide-react';
import { StationCard } from './components/StationCard';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import { fetchNearbyStations, type Station } from '../services/api';
import { carOptions, paymentOptions, distanceOptions } from '../constants/options';

export default function App() {
  const [selectedCar, setSelectedCar] = useState('tata-nexon');
  const [selectedPayment, setSelectedPayment] = useState('google-pay');
  const [showChargers, setShowChargers] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'account'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState('5');
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load stations when user searches
  const handleFindChargers = async () => {
    setIsLoading(true);
    try {
      // Replace with actual location coordinates from user's location or search
      const mockLocation = { lat: 28.6139, lng: 77.2090 };
      const data = await fetchNearbyStations(selectedDistance, selectedCar, mockLocation);
      setStations(data);
      setShowChargers(true);
    } catch (error) {
      console.error('Error fetching stations:', error);
      // Handle error appropriately
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
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`px-6 py-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-900 text-white'}`}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <ZapIcon className="w-6 h-6" />
          <h1 className="text-xl">{currentPage === 'home' ? 'EV Charger Finder' : 'Account'}</h1>
        </div>
      </header>

      {currentPage === 'home' ? (
        <div className="max-w-2xl mx-auto px-6 py-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search location"
              className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          {/* Map Container */}
          <div className={`relative h-64 rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
          }`}>
            {/* Map Background with grid pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: isDarkMode 
                ? 'linear-gradient(rgba(75, 85, 99, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(75, 85, 99, 0.1) 1px, transparent 1px)'
                : 'linear-gradient(rgba(209, 213, 219, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(209, 213, 219, 0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>

            {/* User Location - Car Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="relative">
                <div className="w-3 h-3 bg-blue-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-75"></div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white relative z-10">
                  <Car className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Charger Locations - Green Dots (only show when chargers are found) */}
            {showChargers && (
              <>
                {/* Station 1 - top right */}
                <div className="absolute top-1/4 right-1/3 animate-in fade-in zoom-in duration-500">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-75"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full relative z-10 shadow-md border-2 border-white"></div>
                  </div>
                </div>
                
                {/* Station 2 - bottom left */}
                <div className="absolute bottom-1/3 left-1/4 animate-in fade-in zoom-in duration-500 delay-100">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-75"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full relative z-10 shadow-md border-2 border-white"></div>
                  </div>
                </div>
                
                {/* Station 3 - top left */}
                <div className="absolute top-1/3 left-1/3 animate-in fade-in zoom-in duration-500 delay-200">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-75"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full relative z-10 shadow-md border-2 border-white"></div>
                  </div>
                </div>
                
                {/* Station 4 - right side */}
                <div className="absolute top-2/3 right-1/4 animate-in fade-in zoom-in duration-500 delay-300">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-75"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full relative z-10 shadow-md border-2 border-white"></div>
                  </div>
                </div>
                
                {/* Station 5 - center bottom */}
                <div className="absolute bottom-1/4 left-1/2 animate-in fade-in zoom-in duration-500 delay-400">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-75"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full relative z-10 shadow-md border-2 border-white"></div>
                  </div>
                </div>
              </>
            )}

            {/* Label - only show when chargers are found */}
            {showChargers && (
              <div className="absolute bottom-4 left-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Car Selection - Always visible */}
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

          {/* Find Chargers Button - only show when chargers not found */}
          {!showChargers && (
            <button
              onClick={handleFindChargers}
              className={`w-full py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
            >
              <Search className="w-5 h-5" />
              Find Chargers
            </button>
          )}

          {/* Results section - only show after finding chargers */}
          {showChargers && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Station List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {stations.map((station) => (
                  <StationCard key={station.id} {...station} isDarkMode={isDarkMode} />
                ))}
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Method</span>
                </div>
                <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                  <SelectTrigger className={`w-full px-4 py-3 border rounded-lg ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                  }`}>
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentOptions.map((payment) => (
                      <SelectItem key={payment.value} value={payment.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-5 rounded ${payment.icon}`}></div>
                          <span>{payment.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Book Button */}
              <button className={`w-full py-4 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}>
                Book Charger
              </button>
            </div>
          )}
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