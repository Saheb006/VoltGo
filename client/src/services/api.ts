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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

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

// Get authentication token from cookies
const getAuthToken = (): string | null => {
  return document.cookie
    .split('; ')
    .find(cookie => cookie.trim().startsWith('accessToken='))
    ?.split('=')[1] || null;
};

// Fetch nearby chargers from backend
export const fetchNearbyStations = async (
  distance: string,
  carType: string,
  location: { lat: number; lng: number }
): Promise<Station[]> => {
  const token = getAuthToken();

  // Convert distance from km to meters for backend
  const radiusInMeters = parseFloat(distance) * 1000;
  
  const url = `${API_BASE_URL}/api/v1/chargers/nearby?lat=${location.lat}&lng=${location.lng}&radius=${radiusInMeters}`;
  console.log('🌐 API Request URL:', url);
  console.log('📡 Request params:', {
    lat: location.lat,
    lng: location.lng,
    radius: radiusInMeters,
    distanceKm: distance
  });
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  
  console.log('📥 Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Surface auth issues clearly so UI can react
    if (response.status === 401) {
      throw new Error('Authentication required');
    }

    const rawMessage =
      (typeof errorData?.message === 'string' && errorData.message) ||
      (typeof errorData?.error === 'string' && errorData.error) ||
      (typeof errorData === 'string' && errorData) ||
      null;

    const message =
      rawMessage ??
      (errorData && typeof errorData === 'object'
        ? JSON.stringify(errorData)
        : 'Failed to fetch nearby chargers');

    throw new Error(message);
  }

  const data = await response.json();
  
  console.log('API Response:', data);
  
  // Handle empty or missing data
  if (!data || !data.data) {
    console.warn('No chargers found in response:', data);
    return [];
  }
  
  // Ensure data.data is an array
  if (!Array.isArray(data.data)) {
    console.error('Expected array but got:', typeof data.data, data.data);
    return [];
  }
  
  // Map backend response to frontend Station interface
  return data.data.map((charger: any) => {
    // Handle MongoDB _id (could be ObjectId or string)
    const chargerId = charger._id?.toString() || charger._id || charger.id;
    
    // Ensure location coordinates exist
    const coordinates = charger.location?.coordinates || [];
    if (coordinates.length !== 2) {
      console.warn('Invalid coordinates for charger:', chargerId, coordinates);
    }
    
    return {
      id: chargerId,
      name: charger.name || 'Unnamed Charger',
      address: charger.address || 'Address not available',
      distance: `${Math.round(charger.distance || 0)}m`,
      time: `${Math.round((charger.distance || 0) / 100)}min`,
      chargerType: charger.charger_type || 'AC',
      price: '₹12/kWh', // You can add pricing to backend later
      parking: '+₹20 parking',
      image: charger.image_url || 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwxfHx8fDE3Njc1OTQ3OTF8MA&ixlib=rb-4.1.0&q=80&w=400',
      available: charger.status === 'active',
      lat: coordinates[1] || 0, // MongoDB stores [lng, lat], we need lat
      lng: coordinates[0] || 0, // MongoDB stores [lng, lat], we need lng
    };
  });
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/me`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }

  const data = await response.json();
  
  return {
    name: data.data.fullName || 'User',
    email: data.data.email || 'user@example.com',
    initials: data.data.fullName ? data.data.fullName.split(' ').map((n: string) => n[0]).toUpperCase() : 'U',
    avatar: data.data.avatar
  };
};

export const loginUser = async (
  usernameOrParams: string | { username?: string; email?: string; password: string },
  passwordArg?: string
): Promise<{ success: boolean; user?: any; token?: string }> => {
  const params =
    typeof usernameOrParams === 'string'
      ? { username: usernameOrParams, password: passwordArg ?? '' }
      : usernameOrParams;

  const { username, email, password } = params;

  if ((!username || username.trim() === '') && (!email || email.trim() === '')) {
    throw new Error('Username or email is required');
  }

  if (!password || password.trim() === '') {
    throw new Error('Password is required');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/login`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Try to extract a meaningful error message from common shapes
    const rawMessage =
      (typeof errorData?.message === 'string' && errorData.message) ||
      (typeof errorData?.error === 'string' && errorData.error) ||
      (typeof errorData === 'string' && errorData) ||
      null;

    // Fallback: JSON‑stringify objects instead of ending up with "[object Object]"
    const message =
      rawMessage ??
      (errorData && typeof errorData === 'object'
        ? JSON.stringify(errorData)
        : 'Login failed');

    throw new Error(message);
  }

  const data = await response.json();
  
  // Store tokens in cookies (handled by backend Set-Cookie headers)
  if (data.success) {
    return { 
      success: true, 
      user: data.data.user,
      token: data.data.accessToken 
    };
  } else {
    throw new Error(data.message || 'Login failed');
  }
};

export const registerUser = async (userData: {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: string;
  avatar?: File;
}): Promise<{ success: boolean; user?: any }> => {
  const formData = new FormData();
  formData.append('fullName', userData.fullName);
  formData.append('email', userData.email);
  formData.append('username', userData.username);
  formData.append('password', userData.password);
  formData.append('role', userData.role);
  if (userData.avatar) {
    formData.append('avatar', userData.avatar);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/register`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
  }

  const data = await response.json();
  
  return { 
    success: data.success, 
    user: data.data 
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