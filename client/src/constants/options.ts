// ============================================================================
// CONSTANTS - DROPDOWN OPTIONS
// ============================================================================
// This file contains static data for dropdowns and selection menus.
// Add or modify options here to customize the app's choices.
// ============================================================================



export const paymentOptions = [
    { value: "google-pay", label: "Google Pay", icon: "bg-blue-500" },
    { value: "upi", label: "UPI", icon: "bg-purple-500" },
    { value: "paytm", label: "Paytm", icon: "bg-cyan-500" },
    { value: "credit-card", label: "Credit Card", icon: "bg-gray-700" },
    { value: "cash", label: "Cash", icon: "bg-green-500" },
];

export const distanceOptions = [
    { value: "1", label: "Within 1km" },
    { value: "2", label: "Within 2km" },
    { value: "3", label: "Within 3km" },
    { value: "5", label: "Within 5km" },
    { value: "10", label: "Within 10km" },
];

export const connectorColors: Record<string, string> = {
    'Type 1': 'text-blue-400',
    'Type 2': 'text-green-400',
    'CCS1': 'text-red-400',
    'CCS2': 'text-purple-400',
    'CHAdeMO': 'text-yellow-400',
    'GB/T': 'text-orange-400',
    'Tesla': 'text-cyan-400',
    'default': 'text-gray-400',
};
