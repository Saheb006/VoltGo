import React from "react";
import { ChevronRight, Shield, FileText, RotateCcw, Phone } from "lucide-react";

interface AboutPageProps {
    isDarkMode: boolean;
    setCurrentPage: (page: "home" | "account" | "edit-profile" | "subscription" | "about" | "privacy-policy" | "terms") => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ isDarkMode, setCurrentPage }) => {
    return (
        <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">About Us</h1>
                    <button
                        onClick={() => setCurrentPage("account")}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            isDarkMode
                                ? "bg-gray-800 text-white hover:bg-gray-700"
                                : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        Back to Account
                    </button>
                </div>

                <div className="space-y-2">
                    {/* Privacy Policy */}
                    <div
                        onClick={() => setCurrentPage("privacy-policy")}
                        className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group cursor-pointer ${
                            isDarkMode
                                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-600" />
                            </div>

                            <span
                                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                                Privacy Policy
                            </span>
                        </div>

                        <ChevronRight
                            className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                        />
                    </div>

                    {/* Terms & Conditions */}
                    <div
                        onClick={() => setCurrentPage("terms")}
                        className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group cursor-pointer ${
                            isDarkMode
                                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-green-600" />
                            </div>

                            <span
                                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                                Terms & Conditions
                            </span>
                        </div>

                        <ChevronRight
                            className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                        />
                    </div>

                    {/* Refund Policy */}
                    <div
                        className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
                            isDarkMode
                                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <RotateCcw className="w-5 h-5 text-orange-600" />
                            </div>

                            <span
                                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                                Refund Policy
                            </span>
                        </div>

                        <ChevronRight
                            className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                        />
                    </div>

                    {/* Contact */}
                    <div
                        className={`w-full rounded-lg p-4 shadow-sm border transition-colors flex items-center justify-between group ${
                            isDarkMode
                                ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Phone className="w-5 h-5 text-purple-600" />
                            </div>

                            <span
                                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                                Contact
                            </span>
                        </div>

                        <ChevronRight
                            className={`w-5 h-5 ${isDarkMode ? "text-gray-500 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
