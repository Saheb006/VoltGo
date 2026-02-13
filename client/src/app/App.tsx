import {
    Search,
    MapPin,
    Car,
    CreditCard,
    ChevronDown,
    User,
    Clock as ClockIcon,
    Home,
    Edit,
    Trash2,
    Users,
    LogOut,
    ChevronRight,
    Moon,
    Sun,
    Zap as ZapIcon,
    Filter,
    ChevronLeft,
    Key,
    Shield,
} from "lucide-react";

import axios from 'axios';

import LoginPage from "./components/LoginPage";
import MapComponent from "./components/Map";
import { StationCard } from "./components/StationCard";
import { MyVehiclesModal } from "../components/MyVehiclesModal";

import React, { useState, useEffect, useRef, useCallback } from "react";

import type { Station } from "../types";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./components/ui/select";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./components/ui/dialog";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./components/ui/alert-dialog";

import {
    fetchNearbyStations,
    reverseGeocode,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    updateAvatar,
    type UserProfile,
} from "../services/api";

import { paymentOptions, distanceOptions} from "../constants/options";

function UpdateAccountModal({
    isOpen,

    onClose,

    onUpdate,

    form,

    onFormChange,

    isDarkMode,
}: {
    isOpen: boolean;

    onClose: () => void;

    onUpdate: () => void;

    form: { username: string; email: string; fullName: string };

    onFormChange: (field: string, value: string) => void;

    isDarkMode: boolean;
}) {
    const [isLoading, setIsLoading] = useState(false);

    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
        null,
    );

    const handleUpdateAccount = async () => {
        try {
            setMessage(null);

            // Validate form fields

            if (!form.username || !form.email || !form.fullName) {
                setMessage({ type: "error", text: "Please fill in all fields" });

                return;
            }

            setIsLoading(true);

            const result = await updateUserProfile({
                username: form.username,

                email: form.email,

                fullName: form.fullName,
            });

            if (result.success) {
                setMessage({ type: "success", text: "Account updated successfully" });

                // Close modal after a short delay

                setTimeout(() => {
                    onClose();

                    onUpdate(); // Trigger any refresh logic
                }, 2000);
            } else {
                throw new Error("Failed to update account");
            }
        } catch (error) {
            console.error("Update account error:", error);

            setMessage({
                type: "error",

                text:
                    error instanceof Error
                        ? error.message
                        : "Failed to update account. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className={`sm:max-w-md ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
                <DialogHeader>
                    <DialogTitle
                        className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        Update Account
                    </DialogTitle>

                    <DialogDescription
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                        Update your account information below.
                    </DialogDescription>
                </DialogHeader>

                {/* Message Display Area */}

                {message && (
                    <div
                        className={`p-3 rounded-md text-sm ${
                            message.type === "success"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="fullName"
                            className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                        >
                            Full Name
                        </label>

                        <input
                            id="fullName"
                            type="text"
                            value={form.fullName}
                            onChange={(e) => onFormChange("fullName", e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="username"
                            className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={form.username}
                            onChange={(e) => onFormChange("username", e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => onFormChange("email", e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="Enter your email"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            isDarkMode
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleUpdateAccount}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            isLoading
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        {isLoading ? "Updating..." : "Update Account"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteAccountModal({
    isOpen,

    onClose,

    onDelete,

    form,

    onFormChange,

    isDarkMode,
}: {
    isOpen: boolean;

    onClose: () => void;

    onDelete: () => void;

    form: { username: string; email: string; password: string };

    onFormChange: (field: string, value: string) => void;

    isDarkMode: boolean;
}) {
    const [isLoading, setIsLoading] = useState(false);

    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
        null,
    );

    const handleDeleteAccount = async () => {
        try {
            // Clear any previous messages

            setMessage(null);

            // Validate form fields

            if (!form.username || !form.email || !form.password) {
                setMessage({
                    type: "error",
                    text: "Please fill in all fields to delete your account",
                });

                return;
            }

            setIsLoading(true);

            // Get authentication token from cookies

            const getAuthToken = (): string | null => {
                return (
                    document.cookie

                        .split("; ")

                        .find((cookie) => cookie.trim().startsWith("accessToken="))

                        ?.split("=")[1] || null
                );
            };

            const token = getAuthToken();

            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

            // Call delete account API

            const response = await fetch(
                `${API_BASE_URL}/api/v1/users/delete-account`,

                {
                    method: "DELETE",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json",

                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },

                    body: JSON.stringify({
                        email: form.email,

                        username: form.username,

                        password: form.password,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw new Error(errorData.message || "Failed to delete account");
            }

            const data = await response.json();

            if (data.success) {
                // Show success message

                setMessage({ type: "success", text: "Your account has been successfully deleted" });

                // Logout the user by clearing authentication and redirecting to login after a short delay

                setTimeout(() => {
                    document.cookie =
                        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                    window.location.reload();
                }, 2000);
            } else {
                throw new Error(data.message || "Failed to delete account");
            }
        } catch (error) {
            console.error("Delete account error:", error);

            setMessage({
                type: "error",

                text:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete account. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className={`sm:max-w-md ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
                <DialogHeader>
                    <DialogTitle
                        className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        Delete Account
                    </DialogTitle>

                    <DialogDescription
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                        This action cannot be undone. This will permanently delete your account and
                        remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>

                {/* Message Display Area */}

                {message && (
                    <div
                        className={`p-3 rounded-md text-sm ${
                            message.type === "success"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="username"
                            className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={form.username}
                            onChange={(e) => onFormChange("username", e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => onFormChange("email", e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={form.password}
                            onChange={(e) => onFormChange("password", e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="Enter your password"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            isDarkMode
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            isLoading
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                    >
                        {isLoading ? "Deleting..." : "Delete Account"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ChangePasswordModal({
    isOpen,
    onClose,
    isDarkMode,
}: {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
        null,
    );
    const [showWarning, setShowWarning] = useState(false);
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleFormChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleChangePassword = async () => {
        try {
            setMessage(null);

            // Validate form fields
            if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
                setMessage({ type: "error", text: "Please fill in all fields" });
                return;
            }

            if (form.newPassword !== form.confirmPassword) {
                setMessage({ type: "error", text: "New passwords do not match" });
                return;
            }

            if (form.newPassword.length < 6) {
                setMessage({
                    type: "error",
                    text: "New password must be at least 6 characters long",
                });
                return;
            }

            // Show warning dialog before proceeding
            setShowWarning(true);
        } catch (error) {
            console.error("Change password validation error:", error);
            setMessage({
                type: "error",
                text: "Validation failed. Please try again.",
            });
        }
    };

    const confirmChangePassword = async () => {
        try {
            setIsLoading(true);
            setShowWarning(false);

            const result = await changePassword(form.currentPassword, form.newPassword);

            if (result.success) {
                setMessage({ type: "success", text: "Password changed successfully" });
                // Reset form
                setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                // Close modal after a short delay
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                throw new Error("Failed to change password");
            }
        } catch (error) {
            console.error("Change password error:", error);
            setMessage({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Failed to change password. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent
                    className={`sm:max-w-md ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                    <DialogHeader>
                        <DialogTitle
                            className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            Change Password
                        </DialogTitle>
                        <DialogDescription
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                            Enter your current password and choose a new password.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Message Display Area */}
                    {message && (
                        <div
                            className={`p-3 rounded-md text-sm ${
                                message.type === "success"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="currentPassword"
                                className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                            >
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={form.currentPassword}
                                onChange={(e) =>
                                    handleFormChange("currentPassword", e.target.value)
                                }
                                className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                    isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                                placeholder="Enter your current password"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="newPassword"
                                className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                            >
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={form.newPassword}
                                onChange={(e) => handleFormChange("newPassword", e.target.value)}
                                className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                    isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                                placeholder="Enter your new password"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="confirmPassword"
                                className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                            >
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={form.confirmPassword}
                                onChange={(e) =>
                                    handleFormChange("confirmPassword", e.target.value)
                                }
                                className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                    isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                                placeholder="Confirm your new password"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                isDarkMode
                                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleChangePassword}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                isLoading
                                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    : "bg-orange-600 text-white hover:bg-orange-700"
                            }`}
                        >
                            {isLoading ? "Changing..." : "Change Password"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Warning Dialog */}
            <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                <AlertDialogContent
                    className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle
                            className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            Are you sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                            Changing your password will require you to login again on all devices.
                            Are you sure you want to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                isDarkMode
                                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmChangePassword}
                            className="bg-orange-600 text-white hover:bg-orange-700"
                        >
                            Yes, Change Password
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function EditProfilePage({
    isDarkMode,

    setCurrentPage,
    setUserProfile,
    userProfile,
}: {
    isDarkMode: boolean;

    setCurrentPage: (page: "home" | "account" | "edit-profile") => void;
    setUserProfile: (profile: any) => void;
    userProfile: any;
}): React.JSX.Element {
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showUpdateAvatarModal, setShowUpdateAvatarModal] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [avatarSuccessMessage, setAvatarSuccessMessage] = useState<string | null>(null);
    const [avatarErrorMessage, setAvatarErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [updateForm, setUpdateForm] = useState({
        username: "",

        email: "",

        fullName: "",
    });

    const handleUpdateFormChange = (field: string, value: string) => {
        setUpdateForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateAvatar = async () => {
        if (!selectedAvatarFile) return;

        try {
            setIsUpdatingAvatar(true);
            const result = await updateAvatar(selectedAvatarFile);

            if (result.success) {
                // Refresh user profile to get new avatar
                const updatedProfile = await getUserProfile();
                if (updatedProfile) {
                    setUserProfile(updatedProfile);
                }

                // Close modal and reset state
                setShowUpdateAvatarModal(false);
                setAvatarPreview(null);
                setSelectedAvatarFile(null);

                // Show success message
                setAvatarSuccessMessage("Avatar updated successfully!");
                setTimeout(() => {
                    setAvatarSuccessMessage(null);
                }, 3000);
            } else {
                throw new Error("Failed to update avatar");
            }
        } catch (error: unknown) {
            console.error("Update avatar error:", error);
            setAvatarErrorMessage(
                error instanceof Error ? error.message : "Failed to update avatar",
            );
            setTimeout(() => {
                setAvatarErrorMessage(null);
            }, 5000);
        } finally {
            setIsUpdatingAvatar(false);
        }
    };

    const handleUpdateSuccess = () => {
        // Refresh user profile or any other logic
        // For now, just close and perhaps show a message
    };

    return (
        <React.Fragment>
            <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
                {/* Header with Back Button */}

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setCurrentPage("account")}
                        className={`p-2 rounded-full transition-colors ${
                            isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                    >
                        <ChevronLeft
                            className={`w-5 h-5 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        />
                    </button>

                    <h1
                        className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        Edit Profile
                    </h1>
                </div>

                {/* Success Message */}
                {avatarSuccessMessage && (
                    <div className="bg-green-100 text-green-800 border border-green-200 p-3 rounded-md text-sm">
                        {avatarSuccessMessage}
                    </div>
                )}

                {/* Error Message */}
                {avatarErrorMessage && (
                    <div className="bg-red-100 text-red-800 border border-red-200 p-3 rounded-md text-sm">
                        {avatarErrorMessage}
                    </div>
                )}

                {/* Profile Options */}

                <div className="space-y-2">
                    <button
                        onClick={() => setShowUpdateModal(true)}
                        className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
                            isDarkMode
                                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>

                            <span
                                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                                Update Account
                            </span>
                        </div>

                        <ChevronRight
                            className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                        />
                    </button>

                    <button
                        onClick={() => {
                            console.log("Update Avatar button clicked");
                            setShowUpdateAvatarModal(true);
                        }}
                        className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
                            isDarkMode
                                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                            </div>
                            <span
                                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                                Update Avatar
                            </span>
                        </div>
                        <ChevronRight
                            className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                        />
                    </button>

                    <button
                        onClick={() => setShowChangePasswordModal(true)}
                        className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
                            isDarkMode
                                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Key className="w-5 h-5 text-orange-600" />
                            </div>
                            <span
                                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                                Reset Password
                            </span>
                        </div>
                        <ChevronRight
                            className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                        />
                    </button>

                    <button
                        className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
                            isDarkMode
                                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-purple-600" />
                            </div>

                            <span
                                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                                Reset Password with OTP
                            </span>
                        </div>

                        <ChevronRight
                            className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                        />
                    </button>
                </div>
            </div>

            <UpdateAccountModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                onUpdate={handleUpdateSuccess}
                form={updateForm}
                onFormChange={handleUpdateFormChange}
                isDarkMode={isDarkMode}
            />

            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
                isDarkMode={isDarkMode}
            />

            <Dialog
                open={showUpdateAvatarModal}
                onOpenChange={() => setShowUpdateAvatarModal(false)}
            >
                <DialogContent
                    className={`sm:max-w-md ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                    <DialogHeader>
                        <DialogTitle
                            className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            Update Avatar
                        </DialogTitle>
                        <DialogDescription
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                            Choose a new avatar image to update your profile.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Current Avatar */}
                        <div className="flex items-center justify-center mb-4">
                            <div className="text-sm font-medium mb-2">Current Avatar</div>
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {userProfile?.avatar ? (
                                    <img
                                        src={userProfile.avatar}
                                        alt="Current avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-gray-400" />
                                )}
                            </div>
                        </div>

                        {/* New Avatar Preview */}
                        <div className="flex items-center justify-center mb-4">
                            <div className="text-sm font-medium mb-2">New Avatar Preview</div>
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="New avatar preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-gray-400" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                            >
                                Choose New Avatar
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <button
                            onClick={() => setShowUpdateAvatarModal(false)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                isDarkMode
                                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateAvatar}
                            disabled={isUpdatingAvatar || !selectedAvatarFile}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                isUpdatingAvatar || !selectedAvatarFile
                                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                        >
                            {isUpdatingAvatar ? "Updating..." : "Update Avatar"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}

export default function App() {
    const [selectedCar, setSelectedCar] = useState("tata-nexon");

    const [selectedPayment, setSelectedPayment] = useState("google-pay");

    const [showVehiclesModal, setShowVehiclesModal] = useState(false);

    const [showChargers, setShowChargers] = useState(false);

    const [currentPage, setCurrentPage] = useState<"home" | "account" | "edit-profile">("home");

    const [isDarkMode, setIsDarkMode] = useState(false);

    const [selectedDistance, setSelectedDistance] = useState("10");

    const [stations, setStations] = useState<Station[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    const [userLocation, setUserLocation] = useState<[number, number]>([11.3493, 142.1996]);

    const [userLocationName, setUserLocationName] = useState<string>("");

    const [userLocationAccuracy, setUserLocationAccuracy] = useState<number | null>(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [userProfile, setUserProfile] = useState<any>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [deleteForm, setDeleteForm] = useState({
        username: "",

        email: "",

        password: "",
    });

    const [userVehicles, setUserVehicles] = useState<any[]>([]);

    const searchPlaceholderRef = useRef("Search location");

    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const hasReceivedLocationRef = useRef(false);

    // Request location permission and get user location on mount

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            console.log("Geolocation is not supported by this browser");

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
            console.error("Error getting location:", {
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

    // Update location name when coordinates change

    useEffect(() => {
        const updateLocationName = async () => {
            if (userLocation[0] !== 11.3493 || userLocation[1] !== 142.1996) {
                const name = await reverseGeocode(userLocation[0], userLocation[1]);

                setUserLocationName(name);
            }
        };

        updateLocationName();
    }, [userLocation]);

    // Animated placeholder text

    useEffect(() => {
        const placeholders = ["Search location", "VoltGo", "Find chargers", "Explore stations"];

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
                    if (!("geolocation" in navigator)) {
                        console.warn("Geolocation not available, using stored location");

                        resolve(userLocation);

                        return;
                    }

                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;

                            console.log("📍 Current GPS location:", { latitude, longitude });

                            resolve([latitude, longitude]);
                        },

                        (error) => {
                            console.warn("Failed to get fresh location, using stored:", error);

                            resolve(userLocation);
                        },

                        {
                            enableHighAccuracy: true,

                            timeout: 10000,

                            maximumAge: 60000, // Accept location up to 1 minute old
                        },
                    );
                });
            };

            // Get fresh location

            const currentLocation = await getCurrentLocation();

            const userLocationObj = { lat: currentLocation[0], lng: currentLocation[1] };

            console.log("🔍 Searching for chargers:", {
                distance: `${selectedDistance}km`,

                location: `[${userLocationObj.lat.toFixed(6)}, ${userLocationObj.lng.toFixed(6)}]`,

                radius: `${parseFloat(selectedDistance) * 1000}m`,

                carType: selectedCar,
            });

            const data = await fetchNearbyStations(selectedDistance, selectedCar, userLocationObj);

            console.log("✅ Found stations:", data);

            console.log("📊 Number of stations:", data.length);

            if (data.length === 0) {
                alert(
                    `No charging stations found within ${selectedDistance}km of your location [${userLocationObj.lat.toFixed(4)}, ${userLocationObj.lng.toFixed(4)}]. Try increasing the search radius.`,
                );
            }

            setStations(data);

            setShowChargers(true);
        } catch (error: unknown) {
            console.error("❌ Error fetching stations:", error);

            // Show user-friendly error message

            if (error instanceof Error && error.message === "Authentication required") {
                alert("Please login to search for nearby chargers");
            } else {
                alert(
                    `Failed to find nearby chargers: ${error instanceof Error ? error.message : "Unknown error"}`,
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();

            setIsAuthenticated(false);
        } catch (error) {
            console.error("Logout error:", error);

            // Even if API call fails, still log out from frontend

            setIsAuthenticated(false);
        }
    };

    const fetchUserVehicles = async () => {
        try {
            const response = await axios.get('http://localhost:9000/api/v1/cars/my', {
                withCredentials: true
            });
            setUserVehicles(response.data.data || []);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setUserVehicles([]);
        }
    };

    // Load user profile data

    useEffect(() => {
        const loadUserProfile = async () => {
            if (isAuthenticated) {
                try {
                    const profile = await getUserProfile();

                    setUserProfile(profile);

                    await fetchUserVehicles();
                } catch (error) {
                    console.error("Failed to load user profile:", error);
                }
            }
        };

        loadUserProfile();
    }, [isAuthenticated]);

    // Reload stations when distance changes

    useEffect(() => {
        if (showChargers) {
            handleFindChargers();
        }
    }, [selectedDistance]);

    return (
        // Show login page if not authenticated, otherwise show main app

        !isAuthenticated ? (
            <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} isDarkMode={isDarkMode} />
        ) : (
            <div
                className={`min-h-screen pb-16 transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
            >
                {currentPage === "home" ? (
                    <div className="">
                        {/* Map Container */}

                        <div className="relative h-screen">
                            {/* Search */}

                            <div
                                className="absolute top-4 left-4 z-[1000] animate-in fade-in slide-in-from-top-2 duration-500"
                                style={{ width: "320px" }}
                            >
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />

                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder={searchPlaceholderRef.current}
                                        className={`w-full pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                            isDarkMode
                                                ? "bg-gray-800/90 border-gray-700 text-white placeholder-gray-400 backdrop-blur-sm"
                                                : "bg-white/90 border-gray-200 text-gray-900 backdrop-blur-sm"
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Filter Button */}

                            <div className="absolute top-4 left-[340px] z-[1000] animate-in fade-in slide-in-from-top-2 duration-500">
                                <button
                                    className={`p-3 rounded-full transition-colors ${
                                        isDarkMode
                                            ? "bg-gray-800/90 text-gray-200 hover:bg-gray-700 backdrop-blur-sm"
                                            : "bg-white/90 text-gray-600 hover:bg-gray-100 backdrop-blur-sm"
                                    }`}
                                >
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>

                            <MapComponent
                                center={userLocation}
                                zoom={13}
                                stations={
                                    showChargers
                                        ? stations.map((station: Station) => ({
                                              id: station.id.toString(),

                                              position: [station.lat, station.lng] as [
                                                  number,
                                                  number,
                                              ],

                                              name: station.name,

                                              available: station.available,
                                          }))
                                        : []
                                }
                                onStationSelect={(stationId: string) => {
                                    // Handle station selection

                                    console.log("Selected station:", stationId);
                                }}
                                isDarkMode={isDarkMode}
                            />

                            {/* Distance selector */}

                            {showChargers && (
                                <div className="absolute top-20 left-4 z-[1000] animate-in fade-in slide-in-from-top-2 duration-500">
                                    <Select
                                        value={selectedDistance}
                                        onValueChange={setSelectedDistance}
                                    >
                                        <SelectTrigger
                                            className={`px-3 py-2 rounded-md shadow-sm text-sm border-0 ${
                                                isDarkMode
                                                    ? "bg-gray-700 text-gray-200"
                                                    : "bg-white text-gray-600"
                                            }`}
                                        >
                                            <SelectValue placeholder="Select distance range" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="1">Nearby Stations (1km)</SelectItem>

                                            <SelectItem value="2">Nearby Stations (2km)</SelectItem>

                                            <SelectItem value="3">Nearby Stations (3km)</SelectItem>

                                            <SelectItem value="4">Nearby Stations (4km)</SelectItem>

                                            <SelectItem value="5">Nearby Stations (5km)</SelectItem>

                                            <SelectItem value="10">
                                                Nearby Stations (10km)
                                            </SelectItem>
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

                            <div className="absolute bottom-40 left-4 z-[1000]">
                                <div
                                    className={`flex flex-col items-center justify-center w-20 h-20 rounded-lg shadow-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                                        isDarkMode
                                            ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-750"
                                            : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
                                    }`}
                                    onClick={() => setShowVehiclesModal(true)}
                                >
                                    <Car className="w-6 h-6 mb-0" />
                                    <span className="text-xs font-medium text-center leading-tight">
                                        {(() => {
                                            //check user vehicles
                                            if (userVehicles.length > 0) {
                                                const generateCarValue = (vehicle: any) => {
                                                    let model = vehicle.model.toLowerCase();
                                                    model = model.replace(/ev/gi, '').trim();
                                                    model = model.replace(/\s+/g, '-');
                                                    return `${vehicle.company.toLowerCase()}-${model}`;
                                                };
                                                const selectedVehicle = userVehicles.find(vehicle => generateCarValue(vehicle) === selectedCar);
                                                if (selectedVehicle) return `${selectedVehicle.company} ${selectedVehicle.model}`;
                                            }

                                            // Fallback to "Car" if nothing matches
                                            return "Car";
                                        })()}
                                    </span>
                                </div>
                            </div>

                            {/* My Vehicles Modal */}
                            <MyVehiclesModal
                                isOpen={showVehiclesModal}
                                onClose={() => setShowVehiclesModal(false)}
                                onSelectCar={setSelectedCar}
                                currentSelectedCar={selectedCar}
                                isDarkMode={isDarkMode}
                            />

                            {/* Find Chargers Button - only show when chargers not found */}

                            {!showChargers && (
                                <div className="absolute bottom-4 left-4 right-4 z-[1000] space-y-2">
                                    {/* Location indicator */}

                                    <div
                                        className={`px-4 py-2 rounded-lg text-xs ${
                                            isDarkMode
                                                ? "bg-gray-800/90 text-gray-300 backdrop-blur-sm"
                                                : "bg-white/90 text-gray-600 backdrop-blur-sm"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />

                                            <span>
                                                Searching from:{" "}
                                                {userLocationName ||
                                                    `${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}`}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleFindChargers}
                                        disabled={isLoading}
                                        className={`w-full py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                            isDarkMode
                                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                : "bg-gray-900 hover:bg-gray-800 text-white"
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
                ) : currentPage === "account" ? (
                    <AccountPage
                        isDarkMode={isDarkMode}
                        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                        onLogout={handleLogout}
                        userProfile={userProfile}
                        showDeleteModal={showDeleteModal}
                        setShowDeleteModal={setShowDeleteModal}
                        deleteForm={deleteForm}
                        setDeleteForm={setDeleteForm}
                        setCurrentPage={setCurrentPage}
                    />
                ) : currentPage === "edit-profile" ? (
                    <EditProfilePage
                        isDarkMode={isDarkMode}
                        setCurrentPage={setCurrentPage}
                        setUserProfile={setUserProfile}
                        userProfile={userProfile}
                    />
                ) : null}

                {/* Bottom Navigation - Fixed at bottom like Uber */}

                <nav
                    className={`fixed bottom-0 left-0 right-0 border-t shadow-lg transition-colors duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                    <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-around">
                        <button
                            onClick={() => setCurrentPage("home")}
                            className={`flex flex-col items-center gap-0.5 transition-colors py-1 ${
                                currentPage === "home"
                                    ? isDarkMode
                                        ? "text-white"
                                        : "text-gray-900"
                                    : isDarkMode
                                      ? "text-gray-400 hover:text-white"
                                      : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            <Home className="w-5 h-5" />

                            <span
                                className={`text-xs ${currentPage === "home" ? "font-medium" : ""}`}
                            >
                                Home
                            </span>
                        </button>

                        <button
                            className={`flex flex-col items-center gap-0.5 transition-colors py-1 ${
                                isDarkMode
                                    ? "text-gray-400 hover:text-white"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            <ClockIcon className="w-5 h-5" />

                            <span className="text-xs">Activity</span>
                        </button>

                        <button
                            onClick={() => setCurrentPage("account")}
                            className={`flex flex-col items-center gap-0.5 transition-colors py-1 ${
                                currentPage === "account"
                                    ? isDarkMode
                                        ? "text-white"
                                        : "text-gray-900"
                                    : isDarkMode
                                      ? "text-gray-400 hover:text-white"
                                      : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            <User className="w-5 h-5" />

                            <span
                                className={`text-xs ${currentPage === "account" ? "font-medium" : ""}`}
                            >
                                Account
                            </span>
                        </button>
                    </div>
                </nav>
            </div>
        ) // Added closing parenthesis here
    );
}

function AccountPage({
    isDarkMode,

    onToggleDarkMode,

    onLogout,

    userProfile,

    showDeleteModal,

    setShowDeleteModal,

    deleteForm,

    setDeleteForm,

    setCurrentPage,
}: {
    isDarkMode: boolean;

    onToggleDarkMode: () => void;

    onLogout: () => Promise<void>;

    userProfile: any;

    showDeleteModal: boolean;

    setShowDeleteModal: (value: boolean) => void;

    deleteForm: { username: string; email: string; password: string };

    setDeleteForm: (form: { username: string; email: string; password: string }) => void;

    setCurrentPage: (page: "home" | "account" | "edit-profile") => void;
}): React.JSX.Element {
    return (
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
            {/* User Profile Card */}

            <div
                className={`rounded-lg p-6 shadow-sm border transition-colors duration-300 ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
            >
                <div className="flex items-center gap-4">
                    {/* Profile Picture */}

                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold overflow-hidden">
                        {userProfile?.avatar ? (
                            <img
                                src={userProfile.avatar}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            userProfile?.initials || "U"
                        )}
                    </div>

                    {/* User Info */}

                    <div className="flex-1">
                        <h3
                            className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            {userProfile?.name || "Loading..."}
                        </h3>

                        <p
                            className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                            {userProfile?.email || "Loading..."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Account Options */}

            <div className="space-y-2">
                <button
                    onClick={() => setCurrentPage("edit-profile")}
                    className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
                        isDarkMode
                            ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Edit className="w-5 h-5 text-blue-600" />
                        </div>

                        <span
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            Edit Profile
                        </span>
                    </div>

                    <ChevronRight
                        className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                    />
                </button>

                {/* Theme Toggle with Switch */}

                <div
                    className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between ${
                        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isDarkMode ? "bg-yellow-900" : "bg-indigo-100"
                            }`}
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5 text-yellow-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-indigo-600" />
                            )}
                        </div>

                        <span
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            {isDarkMode ? "Dark Mode" : "Light Mode"}
                        </span>
                    </div>

                    {/* Toggle Switch */}

                    <button
                        onClick={onToggleDarkMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isDarkMode ? "bg-blue-600" : "bg-gray-300"
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isDarkMode ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>

                <button
                    className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
                        isDarkMode
                            ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <ZapIcon className="w-5 h-5 text-green-600" />
                        </div>

                        <span
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            Create Charger Account
                        </span>
                    </div>

                    <ChevronRight
                        className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                    />
                </button>

                <button
                    className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
                        isDarkMode
                            ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>

                        <span
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            Switch Account
                        </span>
                    </div>

                    <ChevronRight
                        className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                    />
                </button>

                <button
                    onClick={() => setShowDeleteModal(true)}
                    className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
                        isDarkMode
                            ? "bg-gray-800 border-gray-700 hover:bg-red-900/20"
                            : "bg-white border-gray-200 hover:bg-red-50"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-red-600" />
                        </div>

                        <span className="text-red-600 font-medium">Delete Account</span>
                    </div>

                    <ChevronRight
                        className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-red-400" : "text-gray-400 group-hover:text-red-400"}`}
                    />
                </button>

                <button
                    onClick={onLogout}
                    className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
                        isDarkMode
                            ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <LogOut className="w-5 h-5 text-gray-600" />
                        </div>

                        <span
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            Log Out
                        </span>
                    </div>

                    <ChevronRight
                        className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                    />
                </button>
            </div>

            {/* Delete Account Modal */}

            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={() => {
                    // TODO: Implement delete account logic

                    console.log("Delete account with form:", deleteForm);

                    setShowDeleteModal(false);
                }}
                form={deleteForm}
                onFormChange={(field, value) => setDeleteForm({ ...deleteForm, [field]: value })}
                isDarkMode={isDarkMode}
            />
        </div>
    );
}
