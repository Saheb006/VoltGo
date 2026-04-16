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

import type { Station } from "../types";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:9000";

export interface UserProfile {
    name: string;

    email: string;

    initials: string;

    avatar?: string;

    role: string;
}

export interface CarModel {
    _id: string;
    companyName: string;
    modelName: string;
    slug: string;
    imageUrl: string;
}

// Get authentication token from cookies

const getAuthToken = (): string | null => {
    return (
        document.cookie

            .split("; ")

            .find((cookie) => cookie.trim().startsWith("accessToken="))

            ?.split("=")[1] || null
    );
};

// Fetch nearby chargers from backend

export const fetchNearbyStations = async (
    distance: string,

    carType: string,

    location: { lat: number; lng: number },
): Promise<Station[]> => {
    const token = getAuthToken();

    // Convert distance from km to meters for backend

    const radiusInMeters = parseFloat(distance) * 1000;

    const url = `${API_BASE_URL}/api/v1/chargers/nearby?lat=${location.lat}&lng=${location.lng}&radius=${radiusInMeters}`;

    console.log("🌐 API Request URL:", url);

    console.log("📡 Request params:", {
        lat: location.lat,

        lng: location.lng,

        radius: radiusInMeters,

        distanceKm: distance,
    });

    const response = await fetch(url, {
        method: "GET",

        credentials: "include",

        headers: {
            "Content-Type": "application/json",

            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    console.log("📥 Response status:", response.status, response.statusText);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Surface auth issues clearly so UI can react

        if (response.status === 401) {
            throw new Error("Authentication required");
        }

        const rawMessage =
            (typeof errorData?.message === "string" && errorData.message) ||
            (typeof errorData?.error === "string" && errorData.error) ||
            (typeof errorData === "string" && errorData) ||
            null;

        const message =
            rawMessage ??
            (errorData && typeof errorData === "object"
                ? JSON.stringify(errorData)
                : "Failed to fetch nearby chargers");

        throw new Error(message);
    }

    const data = await response.json();

    console.log("API Response:", data);

    // Handle empty or missing data

    if (!data || !data.data) {
        console.warn("No chargers found in response:", data);

        return [];
    }

    // Ensure data.data is an array

    if (!Array.isArray(data.data)) {
        console.error("Expected array but got:", typeof data.data, data.data);

        return [];
    }

    // Map backend response to frontend Station interface

    return data.data.map((charger: any) => {
        // Handle MongoDB _id (could be ObjectId or string)

        const chargerId = charger._id?.toString() || charger._id || charger.id;

        // Ensure location coordinates exist

        const coordinates = charger.location?.coordinates || [];

        if (coordinates.length !== 2) {
            console.warn("Invalid coordinates for charger:", chargerId, coordinates);
        }

        return {
            id: chargerId,

            name: charger.name || "Unnamed Charger",

            address: charger.address || "Address not available",

            distance: `${Math.round(charger.distance || 0)}m`,

            time: `${Math.round((charger.distance || 0) / 100)}min`,

            chargerType: charger.charger_type || "AC",

            price: "₹12/kWh", // You can add pricing to backend later

            parking: "+₹20 parking",

            image:
                charger.image_url ||
                "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwxfHx8fDE3Njc1OTQ3OTF8MA&ixlib=rb-4.1.0&q=80&w=400",

            available: charger.status === "active",

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
            method: "GET",

            credentials: "include",

            headers: {
                "Content-Type": "application/json",

                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        },
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.message || "Failed to fetch user profile");
    }

    const data = await response.json();

    return {
        name: data.data.fullName || "User",
        email: data.data.email || "user@example.com",
        initials: data.data.fullName
            ? data.data.fullName
                  .split(" ")
                  .map((n: string) => n[0]?.toUpperCase() || "")
                  .join("")
            : "U",
        avatar: data.data.avatar,
        role: data.data.role || "vehicle_owner",
    };
};

export const loginUser = async (
    usernameOrParams: string | { username?: string; email?: string; password: string },

    passwordArg?: string,
): Promise<{ success: boolean; user?: any; token?: string }> => {
    const params =
        typeof usernameOrParams === "string"
            ? { username: usernameOrParams, password: passwordArg ?? "" }
            : usernameOrParams;

    const { username, email, password } = params;

    if ((!username || username.trim() === "") && (!email || email.trim() === "")) {
        throw new Error("Username or email is required");
    }

    if (!password || password.trim() === "") {
        throw new Error("Password is required");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/v1/users/login`,

        {
            method: "POST",

            credentials: "include",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({ username, email, password }),
        },
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Try to extract a meaningful error message from common shapes

        const rawMessage =
            (typeof errorData?.message === "string" && errorData.message) ||
            (typeof errorData?.error === "string" && errorData.error) ||
            (typeof errorData === "string" && errorData) ||
            null;

        // Fallback: JSON‑stringify objects instead of ending up with "[object Object]"

        const message =
            rawMessage ??
            (errorData && typeof errorData === "object"
                ? JSON.stringify(errorData)
                : "Login failed");

        throw new Error(message);
    }

    const data = await response.json();

    // Store tokens in cookies (handled by backend Set-Cookie headers)

    if (data.success) {
        return {
            success: true,

            user: data.data.user,

            token: data.data.accessToken,
        };
    } else {
        throw new Error(data.message || "Login failed");
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

    formData.append("fullName", userData.fullName);

    formData.append("email", userData.email);

    formData.append("username", userData.username);

    formData.append("password", userData.password);

    formData.append("role", userData.role);

    if (userData.avatar) {
        formData.append("avatar", userData.avatar);
    }

    const response = await fetch(
        `${API_BASE_URL}/api/v1/users/register`,

        {
            method: "POST",

            body: formData,
        },
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.message || "Registration failed");
    }

    const data = await response.json();

    return {
        success: data.success,

        user: data.data,
    };
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
        // Using OpenStreetMap Nominatim API (free, no API key required)

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,

            {
                method: "GET",

                headers: {
                    "User-Agent": "VoltGo EV Charging App", // Required by Nominatim usage policy
                },
            },
        );

        if (!response.ok) {
            console.warn("Reverse geocoding failed, using coordinates");

            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }

        const data = await response.json();

        // Try to get a meaningful locality name

        if (data.display_name) {
            // Extract the most relevant part (usually locality/suburb)

            const address = data.address;

            if (address?.suburb || address?.neighbourhood || address?.city_district) {
                return address.suburb || address.neighbourhood || address.city_district;
            }

            if (address?.city || address?.town || address?.village) {
                return address.city || address.town || address.village;
            }

            // Fallback to full address but truncate if too long

            const fullName = data.display_name;

            return fullName.length > 50 ? fullName.substring(0, 47) + "..." : fullName;
        }

        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
        console.warn("Error in reverse geocoding:", error);

        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
};

export const logoutUser = async (): Promise<{ success: boolean }> => {
    const response = await fetch(
        `${API_BASE_URL}/api/v1/users/logout`,

        {
            method: "POST",

            credentials: "include",

            headers: {
                "Content-Type": "application/json",
            },
        },
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.message || "Logout failed");
    }

    const data = await response.json();

    return {
        success: data.success,
    };
};

export const updateUserProfile = async (userData: {
    username?: string;

    email?: string;

    fullName?: string;
}): Promise<{ success: boolean; user?: any }> => {
    const token = getAuthToken();

    const response = await fetch(
        `${API_BASE_URL}/api/v1/users/update-account`,

        {
            method: "POST",

            credentials: "include",

            headers: {
                "Content-Type": "application/json",

                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },

            body: JSON.stringify(userData),
        },
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.message || "Failed to update user profile");
    }

    const data = await response.json();

    return {
        success: data.success,

        user: data.data,
    };
};

export const changePassword = async (
    oldPassword: string,
    newPassword: string,
): Promise<{ success: boolean }> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/users/change-password`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to change password");
    }

    const data = await response.json();

    return {
        success: data.success,
    };
};

export const updateAvatar = async (
    avatarFile: File,
): Promise<{ success: boolean; avatar?: string }> => {
    const token = getAuthToken();

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await fetch(`${API_BASE_URL}/api/v1/users/update-avatar`, {
        method: "POST",
        credentials: "include",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update avatar");
    }

    const data = await response.json();

    return {
        success: data.success,
        avatar: data.data?.avatar,
    };
};

export const bookCharger = async (
    stationId: number,

    carType: string,

    paymentMethod: string,
): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
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

    return { success: true, bookingId: "BK123456" };
};

export interface Connector {
    id: string;
    port_number: number;
    connector_type: string;
    max_power_kw: number;
    price_per_kwh: number;
    status: 'available' | 'occupied' | 'out_of_order';
}

// Fetch charger ports from backend
export const fetchChargerPorts = async (chargerId: string): Promise<Connector[]> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/chargers/${chargerId}/ports`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch charger ports");
    }

    const data = await response.json();

    // Handle empty or missing data
    if (!data || !data.data) {
        console.warn("No ports found in response:", data);
        return [];
    }

    // Ensure data.data is an array
    if (!Array.isArray(data.data)) {
        console.error("Expected array but got:", typeof data.data, data.data);
        return [];
    }

    // Map backend response to frontend Connector interface
    return data.data.map((port: any) => ({
        id: port._id?.toString() || port._id || port.id,
        port_number: port.port_number || 0,
        connector_type: port.connector_type || "AC",
        max_power_kw: port.max_power_kw || 0,
        price_per_kwh: port.price_per_kwh || 0,
        status: port.status || "available",
    }));
};

// Fetch user's own chargers
export const fetchMyChargers = async (): Promise<Station[]> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/chargers/my`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch my chargers");
    }

    const data = await response.json();

    // Handle empty or missing data
    if (!data || !data.data) {
        console.warn("No chargers found in response:", data);
        return [];
    }

    // Ensure data.data is an array
    if (!Array.isArray(data.data)) {
        console.error("Expected array but got:", typeof data.data, data.data);
        return [];
    }

    // Map backend response to frontend Station interface
    return data.data.map((charger: any) => {
        // Handle MongoDB _id (could be ObjectId or string)
        const chargerId = charger._id?.toString() || charger._id || charger.id;

        // Ensure location coordinates exist
        const coordinates = charger.location?.coordinates || [];

        if (coordinates.length !== 2) {
            console.warn("Invalid coordinates for charger:", chargerId, coordinates);
        }

        return {
            id: chargerId,
            name: charger.name || "Unnamed Charger",
            address: charger.address || "Address not available",
            distance: `${Math.round(charger.distance || 0)}m`,
            time: `${Math.round((charger.distance || 0) / 100)}min`,
            chargerType: charger.charger_type || "AC",
            price: "₹12/kWh", // You can add pricing to backend later
            parking: "+₹20 parking",
            image: charger.image_url || "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwxfHx8fDE3Njc1OTQ3OTF8MA&ixlib=rb-4.1.0&q=80&w=400",
            available: charger.status === "active",
            lat: coordinates[1] || 0,
            lng: coordinates[0] || 0,
        };
    });
};

// Create a new charger
export const createCharger = async (chargerData: {
    name: string;
    address: string;
    address_details?: string;
    latitude: number;
    longitude: number;
    charger_type: "AC" | "DC";
    status?: "active" | "inactive" | "maintenance";
    image: File;
}): Promise<{ success: boolean; charger?: Station }> => {
    const token = getAuthToken();

    const formData = new FormData();
    formData.append("name", chargerData.name);
    formData.append("address", chargerData.address);
    if (chargerData.address_details) {
        formData.append("address_details", chargerData.address_details);
    }
    formData.append("latitude", chargerData.latitude.toString());
    formData.append("longitude", chargerData.longitude.toString());
    formData.append("charger_type", chargerData.charger_type);
    if (chargerData.status) {
        formData.append("status", chargerData.status);
    }
    formData.append("image", chargerData.image);

    const response = await fetch(`${API_BASE_URL}/api/v1/chargers`, {
        method: "POST",
        credentials: "include",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create charger");
    }

    const data = await response.json();

    return {
        success: true,
        charger: {
            id: data.data._id?.toString() || data.data._id || data.data.id,
            name: data.data.name,
            address: data.data.address,
            distance: "0m",
            time: "0min",
            chargerType: data.data.charger_type,
            price: "₹12/kWh",
            parking: "+₹20 parking",
            image: data.data.image_url || "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwxfHx8fDE3Njc1OTQ3OTF8MA&ixlib=rb-4.1.0&q=80&w=400",
            available: data.data.status === "active",
            lat: data.data.location?.coordinates?.[1] || 0,
            lng: data.data.location?.coordinates?.[0] || 0,
        },
    };
};

// Create a new charger port
export const createChargerPort = async (
    chargerId: string,
    portData: {
        connector_type: string;
        max_power_kw: number;
        price_per_kwh: number;
        status?: string;
    },
): Promise<Connector> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/chargers/${chargerId}/ports`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(portData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create charger port");
    }

    const data = await response.json();

    // Map to Connector interface
    return {
        id: data.data._id?.toString() || data.data._id || data.data.id,
        port_number: data.data.port_number || 0,
        connector_type: data.data.connector_type || "AC",
        max_power_kw: data.data.max_power_kw || 0,
        price_per_kwh: data.data.price_per_kwh || 0,
        status: data.data.status || "available",
    };
};

// Update port status
export const updatePortStatus = async (
    chargerId: string,
    portId: string,
    status: string,
): Promise<Connector> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/chargers/${chargerId}/ports/${portId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update port status");
    }

    const data = await response.json();

    // Map to Connector interface
    return {
        id: data.data._id?.toString() || data.data._id || data.data.id,
        port_number: data.data.port_number || 0,
        connector_type: data.data.connector_type || "AC",
        max_power_kw: data.data.max_power_kw || 0,
        price_per_kwh: data.data.price_per_kwh || 0,
        status: data.data.status || "available",
    };
};

// Delete a charger
export const deleteCharger = async (chargerId: string): Promise<{ success: boolean }> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/chargers/${chargerId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete charger");
    }

    const data = await response.json();

    return {
        success: data.success,
    };
};

// Delete a charger port
export const deleteChargerPort = async (chargerId: string, portId: string): Promise<{ success: boolean }> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/chargers/${chargerId}/ports/${portId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete charger port");
    }

    const data = await response.json();

    return {
        success: data.success,
    };
};

// Subscription APIs
export const getSubscriptionPlans = async (): Promise<any[]> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/plans`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to get subscription plans");
    }

    const data = await response.json();

    return data.data || [];
};

export const startSubscription = async (planId: string): Promise<{ success: boolean; subscription?: any }> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/start`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ planId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to start subscription");
    }

    const data = await response.json();

    return {
        success: data.success,
        subscription: data.data,
    };
};

export const getMySubscription = async (): Promise<any> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/me`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to get my subscription");
    }

    const data = await response.json();

    return data.data;
};

export const listMySubscriptions = async (): Promise<any[]> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/history`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to get subscription history");
    }

    const data = await response.json();

    return data.data || [];
};

// Get all car models from database
export const getAllCarModels = async (): Promise<CarModel[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/carmodels/all`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch car models");
    }

    const data = await response.json();
    return data || [];
};

// Activity Session API functions
export const createActivitySession = async (sessionData: {
    chargerName: string;
    chargerImage?: string;
    carModel: string;
    portType?: string;
    chargerId: string;
    status?: string;
    endTime?: string;
    duration?: number;
}): Promise<any> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/activity-sessions`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(sessionData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create activity session");
    }

    const data = await response.json();
    return data;
};

export const fetchActivitySessions = async (): Promise<any[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/activity-sessions`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch activity sessions");
    }

    const data = await response.json();
    return data.data || [];
};

export const updateActivitySession = async (sessionId: string, updateData: {
    endTime?: string;
    duration?: number;
    status?: string;
}): Promise<any> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/activity-sessions/${sessionId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update activity session");
    }

    const data = await response.json();
    return data;
};
