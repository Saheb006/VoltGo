// ============================================================================
// API SERVICE LAYER - BACKEND INTEGRATION
// ============================================================================
// This file contains all API calls to your backend server.
// Replace the mock functions below with your actual API endpoints.
// 
// TO INTEGRATE YOUR BACKEND:
// 1. Add your API base URL (e.g., const API_URL = 'https://api.yourapp.com')
// 2. Replace fetch() calls with your actual endpoints
// 3. Add authentication headers where needed
// 4. Update response types to match your API
// ============================================================================

// API Service Layer - Replace these with your actual backend endpoints

export interface Station {
  id: number;
  name: string;
  address: string;
  distance: string;
  time: string;
  chargerType: string;
  price: string;
  parking: string;
  image: string;
  available: boolean;
  lat: number;
  lng: number;
}

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  avatar?: string;
}

// Mock data - Replace with actual API calls
export const fetchNearbyStations = async (
  distance: string,
  carType: string,
  location: { lat: number; lng: number }
): Promise<Station[]> => {
  // TODO: Replace with your actual API endpoint
  // const response = await fetch(`${API_BASE_URL}/stations?distance=${distance}&carType=${carType}`, {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  // return response.json();

  // Mock data for now
  return [
    {
      id: 1,
      name: 'Green Energy Hub',
      address: 'MG Road, Sector 14',
      distance: '450m',
      time: '5min',
      chargerType: 'Type 2',
      price: '₹12/kWh',
      parking: '+₹20 parking',
      image: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwxfHx8fDE3Njc1OTQ3OTF8MA&ixlib=rb-4.1.0&q=80&w=400',
      available: true,
      lat: 28.6139,
      lng: 77.2090,
    },
    {
      id: 2,
      name: 'City Charge Point',
      address: 'Civil Lines, Near Mall',
      distance: '1.2km',
      time: '8min',
      chargerType: 'CCS',
      price: '₹15/kWh',
      parking: '+₹30 parking',
      image: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhciUyMGNoYXJnZXJ8ZW58MXx8fHwxNzY3NTk1MDIwfDA&ixlib=rb-4.1.0&q=80&w=400',
      available: true,
      lat: 28.6239,
      lng: 77.2190,
    },
    {
      id: 3,
      name: 'Power Station Plus',
      address: 'Park Street, Block A',
      distance: '2.3km',
      time: '12min',
      chargerType: 'Type 2',
      price: '₹10/kWh',
      parking: '+₹15 parking',
      image: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwxfHx8fDE3Njc1OTQ3OTF8MA&ixlib=rb-4.1.0&q=80&w=400',
      available: false,
      lat: 28.6039,
      lng: 77.1990,
    },
  ];
};

export const getUserProfile = async (): Promise<UserProfile> => {
  // TODO: Replace with your actual API endpoint
  // const response = await fetch(`${API_BASE_URL}/user/profile`, {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  // return response.json();

  return {
    name: 'Rahul Kumar',
    email: 'rahul.kumar@example.com',
    initials: 'RK',
  };
};

export const bookCharger = async (
  stationId: number,
  carType: string,
  paymentMethod: string
): Promise<{ success: boolean; bookingId?: string }> => {
  // TODO: Replace with your actual API endpoint
  // const response = await fetch(`${API_BASE_URL}/bookings`, {
  //   method: 'POST',
  //   headers: { 
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${token}` 
  //   },
  //   body: JSON.stringify({ stationId, carType, paymentMethod })
  // });
  // return response.json();

  return { success: true, bookingId: 'BK123456' };
};