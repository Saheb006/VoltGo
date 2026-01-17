# Backend Integration Guide

This guide explains how to integrate your custom backend with this EV Charger Finder application.

## Project Structure

```
/src
  /app
    App.tsx                 # Main application component
    /components
      StationCard.tsx       # Station card component
      /ui                   # UI components (shadcn)
  /services
    api.ts                  # API service layer (INTEGRATE YOUR BACKEND HERE)
  /constants
    options.ts              # Static dropdown options
  /styles
    theme.css               # Theme and styling
```

## Backend Integration Points

### 1. API Service Layer (`/src/services/api.ts`)

This is the **main file** where you'll integrate your backend. Replace the mock functions with your actual API calls.

#### Key Functions to Implement:

**`fetchNearbyStations()`**
- **Purpose**: Fetch charging stations based on distance, car type, and location
- **Parameters**: 
  - `distance: string` - Selected distance range (1, 2, 3, 5, 10 km)
  - `carType: string` - Selected car model
  - `location: { lat: number; lng: number }` - User's current location
- **Returns**: `Promise<Station[]>`
- **Example Integration**:
```typescript
export const fetchNearbyStations = async (
  distance: string,
  carType: string,
  location: { lat: number; lng: number }
): Promise<Station[]> => {
  const response = await fetch(`${YOUR_API_BASE_URL}/api/stations?distance=${distance}&carType=${carType}&lat=${location.lat}&lng=${location.lng}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch stations');
  return response.json();
};
```

**`getUserProfile()`**
- **Purpose**: Fetch current user's profile information
- **Returns**: `Promise<UserProfile>`
- **Example Integration**:
```typescript
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch(`${YOUR_API_BASE_URL}/api/user/profile`, {
    headers: {
      'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
    },
  });
  return response.json();
};
```

**`bookCharger()`**
- **Purpose**: Create a booking for a charging station
- **Parameters**:
  - `stationId: number` - ID of the selected station
  - `carType: string` - User's car model
  - `paymentMethod: string` - Selected payment method
- **Returns**: `Promise<{ success: boolean; bookingId?: string }>`
- **Example Integration**:
```typescript
export const bookCharger = async (
  stationId: number,
  carType: string,
  paymentMethod: string
): Promise<{ success: boolean; bookingId?: string }> => {
  const response = await fetch(`${YOUR_API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
    },
    body: JSON.stringify({ stationId, carType, paymentMethod }),
  });
  return response.json();
};
```

### 2. Type Definitions

The `Station` and `UserProfile` types are defined in `/src/services/api.ts`. Modify them to match your backend response structure:

```typescript
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
  // Add your custom fields here
}

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  avatar?: string;
  // Add your custom fields here
}
```

### 3. Authentication

To add authentication:

1. **Store auth token**: Use localStorage, sessionStorage, or a state management solution
```typescript
// Example: Store token after login
localStorage.setItem('authToken', token);

// Retrieve in api.ts
const token = localStorage.getItem('authToken');
```

2. **Add auth headers**: Include in all API calls
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
}
```

3. **Handle token expiry**: Add error handling for 401 responses
```typescript
if (response.status === 401) {
  // Redirect to login
  window.location.href = '/login';
}
```

### 4. Environment Variables

Create a `.env` file in the root directory:
```
VITE_API_BASE_URL=https://your-api.com
VITE_API_KEY=your-api-key
```

Access in code:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

### 5. Additional Backend Features to Implement

You may want to add these functions to `/src/services/api.ts`:

- `searchLocation(query: string)` - Search for locations
- `getUserLocation()` - Get user's current GPS location
- `getStationDetails(id: number)` - Get detailed info for a specific station
- `cancelBooking(bookingId: string)` - Cancel a booking
- `getUserBookings()` - Get user's booking history
- `updateUserProfile(data: Partial<UserProfile>)` - Update user profile
- `deleteUserAccount()` - Delete user account
- `createChargerAccount(data: ChargerAccountData)` - Create charger owner account

## State Management (Optional)

If you want to use Redux:

1. Install Redux Toolkit:
```bash
npm install @reduxjs/toolkit react-redux
```

2. Create store structure:
```
/src
  /store
    index.ts              # Configure store
    /slices
      authSlice.ts        # Auth state
      stationsSlice.ts    # Stations state
      userSlice.ts        # User profile state
```

3. Example auth slice:
```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.json();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
  },
});
```

## Current App Flow

1. **Initial Load**: User sees map with car selection dropdown
2. **Find Chargers**: Calls `fetchNearbyStations()` with selected distance/car
3. **Display Results**: Shows stations list with distance filter
4. **Book Charger**: Calls `bookCharger()` with selected station and payment method
5. **Account Page**: Displays user profile from `getUserProfile()`

## Testing Backend Integration

1. Replace mock data in `/src/services/api.ts`
2. Test each function independently
3. Handle loading states (already implemented with `isLoading`)
4. Add error handling and user feedback
5. Test authentication flow
6. Verify all API responses match expected types

## Contact

For questions about integration, refer to the code comments in `/src/services/api.ts` or check the component usage in `/src/app/App.tsx`.
